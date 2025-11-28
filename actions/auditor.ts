'use server'

import { supabase } from '@/lib/supabase'
import { getMicrosoftToken, fetchCredentialUserRegistrationDetails, fetchGlobalAdmins } from '@/lib/microsoft-graph'

export async function runCloudAudit(organizationId: string) {
  if (!organizationId) return { message: 'ID requerido', status: 'error' }

  try {
    // 1. Obtener Token
    const token = await getMicrosoftToken()

    // 2. Extraer Datos Crudos de Microsoft (Evidence Gathering)
    const mfaReport = await fetchCredentialUserRegistrationDetails(token)
    const globalAdmins = await fetchGlobalAdmins(token)

    const auditResults = []

    // ---------------------------------------------------------
    // CONTROL CIS 1.1.1: MFA para Admins
    // Requisito: Todos los Global Admins deben tener isMfaRegistered = true
    // ---------------------------------------------------------
    const adminsWithoutMfa = globalAdmins.filter((admin: any) => {
      // Buscar al admin en el reporte de credenciales
      const userCreds = mfaReport.find((u: any) => u.userPrincipalName === admin.userPrincipalName)
      // Fallo si no existe en el reporte o si isMfaRegistered es false
      return !userCreds || userCreds.isMfaRegistered === false
    })

    auditResults.push({
      organization_id: organizationId,
      control_id: 'CIS 1.1.1',
      control_name: 'MFA Habilitado para Administradores',
      status: adminsWithoutMfa.length === 0 ? 'PASS' : 'FAIL',
      score: adminsWithoutMfa.length === 0 ? 100 : 0,
      details: adminsWithoutMfa.length > 0 
        ? { failed_users: adminsWithoutMfa.map((u: any) => u.userPrincipalName) } 
        : { message: 'Todos los administradores tienen MFA.' }
    })

    // ---------------------------------------------------------
    // CONTROL CIS 1.1.2: MFA para Todos los Usuarios
    // Requisito: Todos los usuarios deben tener isMfaRegistered = true
    // ---------------------------------------------------------
    const usersWithoutMfa = mfaReport.filter((u: any) => u.isMfaRegistered === false)
    
    // Calculamos score proporcional (Ej: 80% de usuarios con MFA)
    const totalUsers = mfaReport.length
    const scoreMfa = totalUsers > 0 ? Math.round(((totalUsers - usersWithoutMfa.length) / totalUsers) * 100) : 0

    auditResults.push({
      organization_id: organizationId,
      control_id: 'CIS 1.1.2',
      control_name: 'MFA Habilitado para Todos los Usuarios',
      status: usersWithoutMfa.length === 0 ? 'PASS' : 'FAIL',
      score: scoreMfa,
      details: { 
        total_users: totalUsers, 
        failed_count: usersWithoutMfa.length,
        // Guardamos solo los primeros 10 para no saturar la DB
        sample_failed: usersWithoutMfa.slice(0, 10).map((u: any) => u.userPrincipalName) 
      }
    })

    // ---------------------------------------------------------
    // CONTROL CIS 1.5: Menos de 5 Global Admins
    // Requisito: adminCount < 5
    // ---------------------------------------------------------
    const adminCount = globalAdmins.length
    
    auditResults.push({
      organization_id: organizationId,
      control_id: 'CIS 1.5',
      control_name: 'Minimizar número de Global Admins (< 5)',
      status: adminCount < 5 ? 'PASS' : 'FAIL',
      score: adminCount < 5 ? 100 : 0,
      details: { 
        admin_count: adminCount, 
        admins: globalAdmins.map((a: any) => a.userPrincipalName) 
      }
    })

    // 3. Guardar Resultados en Base de Datos
    const { error } = await supabase.from('cis_audit_logs').insert(auditResults)

    if (error) throw new Error(error.message)

    return { 
        message: `Auditoría CIS completada. ${auditResults.filter(r => r.status === 'FAIL').length} controles fallidos detectados.`, 
        status: 'success',
        data: auditResults
    }

  } catch (e: any) {
    console.error(e)
    return { message: 'Error de auditoría: ' + e.message, status: 'error' }
  }
}