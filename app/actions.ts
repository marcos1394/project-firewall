'use server'

import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Papa from 'papaparse' // Asegúrate de tener: npm install papaparse @types/papaparse

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Esquema de validación para Leads (Landing)
const schema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
})

// ==========================================
// 1. CAPTURA DE LEADS (Landing Page)
// ==========================================
export async function submitLead(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const validatedFields = schema.safeParse({ email })
  
  if (!validatedFields.success) {
    return { message: validatedFields.error.issues[0].message, status: 'error' }
  }

  try {
    const { error } = await supabase.from('leads').insert([{ 
      email: validatedFields.data.email,
      source: 'kinetis_landing_v2' 
    }])

    if (error) {
      if (error.code === '23505') return { message: 'Este correo ya está registrado.', status: 'error' }
      return { message: 'Error técnico al guardar.', status: 'error' }
    }
    return { message: '¡Te has registrado correctamente!', status: 'success' }
  } catch (e) {
    return { message: 'Error crítico del servidor.', status: 'error' }
  }
}

// ==========================================
// 2. AUTENTICACIÓN ADMIN
// ==========================================
export async function setAdminCookie(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const secret = process.env.ADMIN_SECRET

  if (!secret) return { error: 'Error de configuración del servidor.' }

  if (password === secret) {
    const cookieStore = await cookies()
    cookieStore.set('kinetis_admin_session', secret, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'strict'
    })
    redirect('/admin-lab')
  } else {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { error: 'Acceso Denegado: Credenciales inválidas.' }
  }
}

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
export async function launchCampaign(prevState: any, formData: FormData) {
  const campaignName = formData.get('campaignName') as string
  const templateSlug = formData.get('templateType') as string
  const csvFile = formData.get('csvFile') as File

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://security.kinetis.org'

  if (!csvFile || csvFile.size === 0) {
    return { message: 'Por favor sube un archivo CSV válido.', status: 'error' }
  }

  try {
    // A) Validar que la plantilla existe ANTES de procesar nada
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('slug', templateSlug)
      .single()

    if (templateError || !template) {
      return { message: 'Error crítico: La plantilla seleccionada no existe.', status: 'error' }
    }

    // B) Leer y Parsear CSV
    const text = await csvFile.text()
    const parsed = Papa.parse(text, { header: false })
    const emails = parsed.data
      .flat()
      .map((e: any) => e?.toString().trim())
      .filter((e) => e && e.includes('@'))

    if (emails.length === 0) {
      return { message: 'No se encontraron emails válidos en el CSV.', status: 'error' }
    }

    // C) Crear la Campaña en DB
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .insert({ 
        name: campaignName, 
        template_type: templateSlug, 
        status: 'sending' 
      })
      .select()
      .single()

    if (campError) throw new Error(campError.message)

    // D) Insertar Objetivos (Bulk Insert)
    const targetsData = emails.map(email => ({
      campaign_id: campaign.id,
      email: email,
      status: 'pending'
    }))

    const { error: targetsError } = await supabase
      .from('campaign_targets')
      .insert(targetsData)

    if (targetsError) throw new Error(targetsError.message)

    // E) Loop de Envío (Procesamiento por Lotes)
    let sentCount = 0

    await Promise.all(emails.map(async (email) => {
      // Link único usando el ID de la CAMPAÑA
      const trackingLink = `${baseUrl}/api/track?email=${encodeURIComponent(email)}&c=${campaign.id}`
      
      // Inyección dinámica de link en el HTML de la DB
      const finalHtml = template.html_content.replace('{{link}}', trackingLink)

      const { error } = await resend.emails.send({
        from: `${template.from_name} <${template.from_email}>`,
        to: [email],
        subject: template.subject,
        html: finalHtml
      })

      if (!error) {
        // Actualizar estado a 'sent' (fuego y olvido para no bloquear)
        supabase.from('campaign_targets')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .match({ campaign_id: campaign.id, email: email })
          .then() 
        sentCount++
      }
    }))

    // F) Finalizar Campaña
    await supabase.from('campaigns')
      .update({ status: 'completed' })
      .eq('id', campaign.id)

    return { 
      message: `Campaña '${campaignName}' finalizada. ${sentCount}/${emails.length} correos enviados con plantilla '${template.name}'.`, 
      status: 'success' 
    }

  } catch (e: any) {
    console.error(e)
    return { message: 'Error de campaña: ' + e.message, status: 'error' }
  }
}

// ==========================================
// 5. REMEDIACIÓN (Marcar como Entrenado)
// ==========================================
export async function completeTraining(targetId: string) {
  if (!targetId) return { error: 'ID inválido' }

  try {
    const { error } = await supabase
      .from('campaign_targets')
      .update({ status: 'trained' }) // Cambiamos de 'clicked' a 'trained'
      .eq('id', targetId)

    if (error) throw new Error(error.message)
    
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Error al actualizar estado' }
  }
}