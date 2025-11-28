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
// 10. BREACH RADAR (Híbrido: Mock vs Real)
// ==========================================

// Función auxiliar para simular datos (Modo Gratis)
function getMockBreaches(email: string) {
  // Determinístico: Si el email tiene una "a", decimos que fue hackeado en LinkedIn
  if (email.includes('a')) {
    return [{
      Name: 'LinkedIn',
      Title: 'LinkedIn Scrape 2021',
      DataClasses: ['Email addresses', 'Job titles', 'Phone numbers', 'Social media profiles'],
      BreachDate: '2021-04-08'
    }, {
      Name: 'Canva',
      Title: 'Canva Design Breach',
      DataClasses: ['Email addresses', 'Names', 'Usernames', 'Passwords'],
      BreachDate: '2019-05-24'
    }]
  }
  return []
}

// Función para consultar API Real (Modo Pago)
async function checkHIBP(email: string, apiKey: string) {
  const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
    headers: {
      'hibp-api-key': apiKey,
      'user-agent': 'Kinetis-Security-App-v1'
    }
  })

  if (response.status === 404) return [] 
  if (response.status === 429) throw new Error('Rate limit excedido en HIBP (Esperar)')
  if (!response.ok) throw new Error(`Error HIBP: ${response.statusText}`)

  return await response.json()
}

export async function scanOrganizationBreaches(organizationId: string) {
  if (!organizationId) return { message: 'ID requerido', status: 'error' }

  // DETECCIÓN DE MODO
  const apiKey = process.env.HIBP_API_KEY
  const isDemoMode = !apiKey || apiKey === ''

  try {
    const { data: employees } = await supabase
      .from('employees')
      .select('id, email')
      .eq('organization_id', organizationId)

    if (!employees || employees.length === 0) {
        return { message: 'No hay empleados para escanear.', status: 'error' }
    }

    let leaksFound = 0
    let processed = 0

    for (const emp of employees) {
        // Delay: Si es real esperamos 1.6s, si es demo solo 500ms para sensación de carga
        await new Promise(r => setTimeout(r, isDemoMode ? 500 : 1600))

        try {
            let breaches = []

            if (isDemoMode) {
                // USAMOS DATOS FALSOS GRATIS
                breaches = getMockBreaches(emp.email)
            } else {
                // USAMOS API REAL DE PAGO
                // @ts-ignore
                breaches = await checkHIBP(emp.email, apiKey)
            }
            
            if (breaches.length > 0) {
                leaksFound++
                
                const newLeaks = breaches.map((b: any) => ({
                    employee_id: emp.id,
                    source: b.Name,
                    data_classes: b.DataClasses,
                    leaked_at: b.BreachDate,
                    detected_at: new Date().toISOString()
                }))

                await supabase.from('employee_leaks').insert(newLeaks)
                
                await supabase.from('employees').update({ 
                    risk_level: 'critical',
                    total_leaks: breaches.length 
                }).eq('id', emp.id)
            }
        } catch (err) {
            console.error(`Error escaneando ${emp.email}:`, err)
        }
        processed++
    }

    // Mensaje diferente según el modo
    const finalMsg = isDemoMode 
        ? `[MODO DEMO] Escaneo simulado completado. ${leaksFound} empleados marcados como riesgo.`
        : `Escaneo Real completado. ${leaksFound} credenciales expuestas detectadas.`

    return { 
        message: finalMsg, 
        status: leaksFound > 0 ? 'warning' : 'success',
        leaksCount: leaksFound
    }

  } catch (e: any) {
    return { message: 'Error en el radar: ' + e.message, status: 'error' }
  }
}