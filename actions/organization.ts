'use server'

import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Papa from 'papaparse' // Asegúrate de tener: npm install papaparse @types/papaparse
import { getMicrosoftToken, fetchMicrosoftUsers } from '@/lib/microsoft-graph'

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Esquema de validación para Leads (Landing)
const schema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
})



// ==========================================
// 7. GESTOR DE ORGANIZACIONES (Multi-Tenancy)
// ==========================================

export async function createOrganization(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const domain = formData.get('domain') as string

  if (!name) return { message: 'El nombre es obligatorio', status: 'error' }

  try {
    const { error } = await supabase.from('organizations').insert({
      name,
      domain
    })

    if (error) throw new Error(error.message)
    
    // Revalidamos path
    redirect('/admin-lab/clients')

  } catch (e: any) {
    if (e.message === 'NEXT_REDIRECT') throw e
    return { message: 'Error: ' + e.message, status: 'error' }
  }
}

// Importar empleados al Directorio Persistente
export async function importDirectory(prevState: any, formData: FormData) {
  const organizationId = formData.get('organizationId') as string
  const csvFile = formData.get('csvFile') as File

  if (!csvFile || !organizationId) return { message: 'Datos incompletos', status: 'error' }

  // Parsear CSV
  const text = await csvFile.text()
  const parsed = Papa.parse(text, { header: false })
  const emails = parsed.data.flat().map((e: any) => e?.toString().trim()).filter(e => e && e.includes('@'))

  if (emails.length === 0) return { message: 'CSV vacío', status: 'error' }

  try {
    // Preparar datos para upsert (Insertar o Actualizar si ya existe)
    const employeesData = emails.map(email => ({
      organization_id: organizationId,
      email: email,
      risk_level: 'unknown'
    }))

    // Upsert masivo (ignora duplicados gracias al UNIQUE constraint)
    const { error } = await supabase
      .from('employees')
      .upsert(employeesData, { onConflict: 'organization_id,email' })

    if (error) throw new Error(error.message)

    return { message: `Directorio actualizado. ${emails.length} registros procesados.`, status: 'success' }

  } catch (e: any) {
    return { message: 'Error al importar: ' + e.message, status: 'error' }
  }
}


// ==========================================
// 8. SYNC DE DIRECTORIO (Microsoft Entra ID)
// ==========================================
export async function syncMicrosoftDirectory(organizationId: string) {
  if (!organizationId) return { message: 'ID de organización requerido', status: 'error' }

  try {
    // 1. Conectar con Azure (Server-to-Server)
    const token = await getMicrosoftToken()
    
    // 2. Descargar empleados
    const azureUsers = await fetchMicrosoftUsers(token)
    
    if (!azureUsers || azureUsers.length === 0) {
        return { message: 'No se encontraron usuarios en el directorio de Microsoft.', status: 'error' }
    }

    // 3. Mapear datos al formato de Kinetis
    // Nota: En Azure, a veces el email está en 'mail' y a veces en 'userPrincipalName'
    const employeesData = azureUsers
        .filter((u: any) => u.mail || u.userPrincipalName) // Solo usuarios con email
        .map((u: any) => ({
            organization_id: organizationId,
            email: u.mail || u.userPrincipalName,
            first_name: u.displayName,
            position: u.jobTitle || 'Empleado',
            risk_level: 'unknown'
        }))

    // 4. Guardar en BD (Upsert masivo)
    const { error } = await supabase
      .from('employees')
      .upsert(employeesData, { onConflict: 'organization_id,email' })

    if (error) throw new Error(error.message)

    return { 
        message: `Sincronización Exitosa. ${employeesData.length} empleados actualizados desde Microsoft 365.`, 
        status: 'success' 
    }

  } catch (e: any) {
    console.error(e)
    return { message: 'Error de Sync: ' + e.message, status: 'error' }
  }
}

// ==========================================
// 9. AGREGAR EMPLEADO MANUAL (Single Add)
// ==========================================
export async function addSingleEmployee(prevState: any, formData: FormData) {
  const organizationId = formData.get('organizationId') as string
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  if (!email || !organizationId) {
    return { message: 'El email y la organización son obligatorios.', status: 'error' }
  }

  try {
    // Insertamos el empleado
    const { error } = await supabase.from('employees').insert({
      organization_id: organizationId,
      email: email,
      first_name: name,
      risk_level: 'unknown',
      times_compromised: 0
    })

    if (error) {
        // Código 23505 es violación de unicidad (email repetido en esa org)
        if (error.code === '23505') {
            return { message: 'Este empleado ya está registrado en esta organización.', status: 'error' }
        }
        throw new Error(error.message)
    }

    return { message: 'Empleado añadido correctamente.', status: 'success' }

  } catch (e: any) {
    return { message: 'Error al guardar: ' + e.message, status: 'error' }
  }
}

