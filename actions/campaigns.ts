
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
// 3. MOTOR DE SIMULACIÓN INDIVIDUAL (Quick Attack)
// ==========================================
export async function sendSimulation(formData: FormData) {
  const email = formData.get('email') as string
  // El 'type' ahora corresponde al 'slug' en la base de datos (ej: 'hr-payroll')
  const templateSlug = formData.get('type') as string || 'google-security'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://security.kinetis.org'

  try {
    // A) Buscar la plantilla en la Base de Datos
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('slug', templateSlug)
      .single()

    if (templateError || !template) {
      return { message: 'Error: La plantilla no existe en la base de datos.', status: 'error' }
    }

    // B) Construir el enlace trampa
    // Para ataques individuales, pasamos el slug directamente en 'c'
    const trackingLink = `${baseUrl}/api/track?email=${encodeURIComponent(email)}&c=${templateSlug}`

    // C) Inyectar el link en el HTML (Reemplazamos {{link}})
    const finalHtml = template.html_content.replace('{{link}}', trackingLink)

    // D) Enviar correo
    const { error } = await resend.emails.send({
      from: `${template.from_name} <${template.from_email}>`,
      to: [email],
      subject: template.subject,
      html: finalHtml
    })

    if (error) throw new Error(error.message)

    return { message: `✅ Ataque '${template.name}' lanzado a ${email}`, status: 'success' }

  } catch (error: any) {
    console.error('Simulation Error:', error)
    return { message: 'Error al enviar: ' + error.message, status: 'error' }
  }
}

// ==========================================
// 4. GESTOR DE CAMPAÑAS MASIVAS (Bulk Attack)
// ==========================================
// Función auxiliar para obtener emails (DRY principle)
async function getTargets(formData: FormData) {
  const mode = formData.get('targetMode') as string // 'csv' | 'directory'
  const organizationId = formData.get('organizationId') as string
  const csvFile = formData.get('csvFile') as File

  // MODO 1: Directorio Guardado (Smart Targeting)
  if (mode === 'directory' && organizationId) {
    const { data: employees } = await supabase
      .from('employees')
      .select('email')
      .eq('organization_id', organizationId)
    
    if (!employees || employees.length === 0) {
      throw new Error('La organización seleccionada no tiene empleados registrados.')
    }
    return employees.map(e => e.email)
  }

  // MODO 2: CSV Manual (Legacy/Tactical)
  if (csvFile && csvFile.size > 0) {
    const text = await csvFile.text()
    const parsed = Papa.parse(text, { header: false })
    return parsed.data
      .flat()
      .map((e: any) => e?.toString().trim())
      .filter((e) => e && e.includes('@'))
  }

  throw new Error('Debes subir un CSV o seleccionar una organización.')
}

export async function launchCampaign(prevState: any, formData: FormData) {
  const campaignName = formData.get('campaignName') as string
  const templateSlug = formData.get('templateType') as string
  // Capturamos el ID de organización si existe (para asociar la campaña al cliente)
  const organizationId = formData.get('organizationId') as string || null

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://security.kinetis.org'

  try {
    // 1. Obtener Lista de Objetivos (Lógica abstraída arriba)
    const emails = await getTargets(formData)

    if (emails.length === 0) return { message: 'Lista de objetivos vacía.', status: 'error' }

    // 2. Validar Plantilla
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('slug', templateSlug)
      .single()

    if (!template) return { message: 'Plantilla no encontrada.', status: 'error' }

    // 3. Crear Campaña
    // AHORA guardamos el organization_id para que el reporte salga en el dashboard del cliente
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .insert({ 
        name: campaignName, 
        template_type: templateSlug, 
        status: 'sending',
        organization_id: organizationId // Vinculación clave
      })
      .select()
      .single()

    if (campError) throw new Error(campError.message)

    // 4. Insertar Targets
    const targetsData = emails.map(email => ({
      campaign_id: campaign.id,
      email: email,
      status: 'pending'
    }))

    const { error: targetsError } = await supabase
      .from('campaign_targets')
      .insert(targetsData)

    if (targetsError) throw new Error(targetsError.message)

    // 5. Loop de Envío
    let sentCount = 0
    await Promise.all(emails.map(async (email) => {
      const trackingLink = `${baseUrl}/api/track?email=${encodeURIComponent(email)}&c=${campaign.id}`
      const finalHtml = template.html_content.replace('{{link}}', trackingLink)

      const { error } = await resend.emails.send({
        from: `${template.from_name} <${template.from_email}>`,
        to: [email],
        subject: template.subject,
        html: finalHtml
      })

      if (!error) {
        supabase.from('campaign_targets')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .match({ campaign_id: campaign.id, email: email })
          .then() 
        sentCount++
      }
    }))

    // 6. Cerrar
    await supabase.from('campaigns').update({ status: 'completed' }).eq('id', campaign.id)

    return { 
      message: `Operación Exitosa. ${sentCount}/${emails.length} objetivos impactados.`, 
      status: 'success' 
    }

  } catch (e: any) {
    return { message: e.message, status: 'error' }
  }
}

// ==========================================
// 6. GESTOR DE PLANTILLAS (La Forja)
// ==========================================
export async function createTemplate(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const subject = formData.get('subject') as string
  const fromName = formData.get('fromName') as string
  const category = formData.get('category') as string
  const htmlContent = formData.get('htmlContent') as string
  
  // Generar Slug automático (ej: "Black Friday Offer" -> "black-friday-offer")
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  if (!name || !subject || !htmlContent) {
    return { message: 'Faltan campos obligatorios.', status: 'error' }
  }

  try {
    const { error } = await supabase.from('email_templates').insert({
      name,
      slug,
      subject,
      from_name: fromName,
      from_email: 'security@kinetis.org', // Forzado por seguridad/reputación
      category,
      html_content: htmlContent,
      difficulty_level: 'medium'
    })

    if (error) {
      if (error.code === '23505') return { message: 'Ya existe una plantilla con ese nombre.', status: 'error' }
      throw new Error(error.message)
    }

    // Revalidar path si usas cache, o redirect
    redirect('/admin-lab')
    
  } catch (e: any) {
    // Si es un error de redirect, lo dejamos pasar (Next.js internals)
    if (e.message === 'NEXT_REDIRECT') throw e
    return { message: 'Error al crear plantilla: ' + e.message, status: 'error' }
  }
}

