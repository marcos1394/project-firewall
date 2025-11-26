'use server'

import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Papa from 'papaparse'

// Inicializar Resend con la API Key del entorno
const resend = new Resend(process.env.RESEND_API_KEY)

// Esquema de validación estricto para Leads de la Landing
const schema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
})

// ==========================================
// 1. CAPTURA DE LEADS (Landing Page)
// ==========================================

export async function submitLead(prevState: any, formData: FormData) {
  const email = formData.get('email') as string

  // Validar formato del email
  const validatedFields = schema.safeParse({ email })
  
  if (!validatedFields.success) {
    return { 
      message: validatedFields.error.flatten().fieldErrors.email?.[0] || 'Validación fallida.', 
      status: 'error' 
    }
  }

  try {
    // Insertar en Supabase (Tabla: leads)
    const { error } = await supabase
      .from('leads')
      .insert([
        { 
          email: validatedFields.data.email,
          source: 'kinetis_landing_v2' 
        }
      ])

    if (error) {
      // Código Postgres 23505 = Unique Violation (Duplicado)
      if (error.code === '23505') {
        return { message: 'Este correo ya está registrado.', status: 'error' }
      }
      console.error('Supabase Error:', error)
      return { message: 'Error técnico al guardar.', status: 'error' }
    }

    return { message: '¡Te has registrado correctamente!', status: 'success' }
    
  } catch (e) {
    return { message: 'Error crítico del servidor.', status: 'error' }
  }
}

// ==========================================
// 2. AUTENTICACIÓN ADMIN (Cookie Session)
// ==========================================

export async function setAdminCookie(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    console.error("FATAL: ADMIN_SECRET no está configurado en .env")
    return { error: 'Error de configuración del servidor.' }
  }

  if (password === secret) {
    // Next.js 15/16 requiere await para cookies()
    const cookieStore = await cookies()
    
    // Establecemos la cookie de sesión segura
    cookieStore.set('kinetis_admin_session', secret, { 
      httpOnly: true, // No accesible via JS (XSS safe)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en prod
      maxAge: 60 * 60 * 24, // Expira en 24 horas
      path: '/',
      sameSite: 'strict'
    })
    
    // Redirigimos al panel de control
    redirect('/admin-lab')
  } else {
    // Retardo artificial de 1s para evitar ataques de fuerza bruta
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { error: 'Acceso Denegado: Credenciales inválidas.' }
  }
}

// ==========================================
// 3. MOTOR DE SIMULACIÓN (Phishing Payloads)
// ==========================================

// Diccionario de Plantillas de Ingeniería Social
const TEMPLATES: Record<string, any> = {
  'google-security': {
    subject: 'Alerta de Seguridad: Nuevo inicio de sesión detectado',
    from: 'Soporte IT <security@kinetis.org>', 
    getHtml: (link: string) => `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; max-width: 500px; color: #333;">
        <h2 style="color: #d93025; margin-top: 0;">Alerta de Google Workspace</h2>
        <p>Hemos detectado un inicio de sesión inusual en tu cuenta corporativa.</p>
        <ul style="background: #f9f9f9; padding: 15px; list-style: none; border-radius: 4px;">
            <li><strong>Dispositivo:</strong> iPhone 14 Pro</li>
            <li><strong>Ubicación:</strong> Lagos, Nigeria (IP: 197.210.226.1)</li>
            <li><strong>Hora:</strong> Justo ahora</li>
        </ul>
        <p>Si no fuiste tú, bloquea el acceso inmediatamente para evitar la filtración de datos:</p>
        <a href="${link}" style="background-color: #d93025; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-top: 10px;">Bloquear Acceso y Cambiar Contraseña</a>
        <p style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
            Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043
        </p>
      </div>
    `
  },
  'hr-payroll': {
    subject: 'ACCIÓN REQUERIDA: Ajuste en esquema de nómina Q4',
    from: 'Recursos Humanos <security@kinetis.org>', 
    getHtml: (link: string) => `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333;">
        <p>Hola,</p>
        <p>Debido a las nuevas regulaciones fiscales locales, hemos tenido que recalcular las deducciones de impuestos para la próxima quincena.</p>
        <p>Es importante que revises y confirmes tu nuevo desglose salarial antes del viernes para asegurar que tu pago se procese correctamente.</p>
        <p>Puedes descargar tu pre-nómina personal aquí:</p>
        <a href="${link}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">
            [PDF] Desglose_Nomina_Preliminar_2025.pdf
        </a>
        <p style="margin-top: 30px;">Gracias,<br>Equipo de Compensaciones y Beneficios</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #888;">Este es un mensaje interno y confidencial.</p>
      </div>
    `
  },
  'urgent-file': {
    subject: 'URGENTE: Contrato pendiente de firma',
    from: 'Notificaciones Legales <security@kinetis.org>',
    getHtml: (link: string) => `
      <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 30px;">
        <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
                <span style="font-weight: bold; color: #2563eb;">DocuSign</span> | Kinetis Legal
            </div>
            <p><strong>El departamento legal te ha enviado un documento para firma.</strong></p>
            <p>El cliente está esperando esta confirmación para liberar el proyecto. Por favor revísalo lo antes posible.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #fbbf24; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    REVISAR Y FIRMAR
                </a>
            </div>
            <p style="font-size: 13px; color: #666;">El enlace expira en 24 horas por seguridad.</p>
        </div>
      </div>
    `
  }
}

export async function sendSimulation(formData: FormData) {
  const email = formData.get('email') as string
  // Obtenemos el tipo del formulario, si no viene, usamos Google por defecto
  const type = formData.get('type') as string || 'google-security' 
  
  const template = TEMPLATES[type]
  
  // Validación de seguridad para que no inyecten tipos raros
  if (!template) {
      return { message: 'Error: Tipo de ataque no válido.', status: 'error' }
  }

  // Detectar URL base para el link de rastreo
  // En producción (Vercel) debe estar configurada NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://security.kinetis.org'
  
  // Construimos el enlace trampa con el ID de campaña (tipo de ataque)
  // Al hacer clic aquí, irán a /api/track -> Supabase -> /education
  const trackingLink = `${baseUrl}/api/track?email=${encodeURIComponent(email)}&c=${type}`

  try {
    const { data, error } = await resend.emails.send({
      from: template.from, // Usamos el remitente específico (Legal, RRHH, IT)
      to: [email],
      subject: template.subject,
      html: template.getHtml(trackingLink) // Inyectamos el link trampa en la plantilla
    })

    if (error) {
        console.error('Resend Error:', error)
        return { message: 'Error al enviar ataque: ' + error.message, status: 'error' }
    }

    return { message: `✅ Ataque '${type}' lanzado a ${email}`, status: 'success' }

  } catch (error: any) {
    console.error('Server Error:', error)
    return { message: 'Error crítico del servidor.', status: 'error' }
  }
}

export async function launchCampaign(prevState: any, formData: FormData) {
  const campaignName = formData.get('campaignName') as string
  const templateType = formData.get('templateType') as string
  const csvFile = formData.get('csvFile') as File

  if (!csvFile || csvFile.size === 0) {
    return { message: 'Por favor sube un archivo CSV válido.', status: 'error' }
  }

  // 1. Leer y Parsear el CSV
  const text = await csvFile.text()
  const parsed = Papa.parse(text, { header: false }) // Asumimos lista simple sin headers o columna 1
  const emails = parsed.data
    .flat()
    .map((e: any) => e?.toString().trim())
    .filter((e) => e && e.includes('@')) // Filtro básico de emails válidos

  if (emails.length === 0) {
    return { message: 'No se encontraron emails válidos en el archivo.', status: 'error' }
  }

  try {
    // 2. Crear la Campaña en DB
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .insert({ name: campaignName, template_type: templateType, status: 'sending' })
      .select()
      .single()

    if (campError) throw new Error(campError.message)

    // 3. Preparar los Targets para inserción masiva
    const targetsData = emails.map(email => ({
      campaign_id: campaign.id,
      email: email,
      status: 'pending'
    }))

    const { error: targetsError } = await supabase
      .from('campaign_targets')
      .insert(targetsData)

    if (targetsError) throw new Error(targetsError.message)

    // 4. ENVIAR CORREOS (En producción usaríamos una Queue como Redis/Inngest, para MVP hacemos loop)
    // Usamos el template seleccionado
    const template = TEMPLATES[templateType]
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://security.kinetis.org'

    let sentCount = 0

    // Ejecutamos en paralelo limitado (Promise.all) para velocidad
    await Promise.all(emails.map(async (email) => {
      // Link único para rastrear ESTA campaña y ESTE usuario
      // IMPORTANTE: Ahora pasamos campaign_id para agrupar las métricas
      const trackingLink = `${baseUrl}/api/track?email=${encodeURIComponent(email)}&c=${campaign.id}`

      const { error } = await resend.emails.send({
        from: template.from,
        to: [email],
        subject: template.subject,
        html: template.getHtml(trackingLink)
      })

      if (!error) {
        // Actualizar estado a 'sent' en DB (sin await para no bloquear)
        supabase.from('campaign_targets')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .match({ campaign_id: campaign.id, email: email })
          .then() 
        sentCount++
      }
    }))

    // 5. Cerrar Campaña
    await supabase.from('campaigns').update({ status: 'completed' }).eq('id', campaign.id)

    return { 
      message: `Campaña lanzada. ${sentCount}/${emails.length} correos enviados.`, 
      status: 'success' 
    }

  } catch (e: any) {
    console.error(e)
    return { message: 'Error de campaña: ' + e.message, status: 'error' }
  }
}