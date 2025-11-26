'use server'

import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  email: z.string().email({ message: "Email inválido" }),
})

export async function submitLead(prevState: any, formData: FormData) {
  const email = formData.get('email') as string

  // 1. Validar
  const validatedFields = schema.safeParse({ email })
  if (!validatedFields.success) {
    return { message: 'Formato de correo incorrecto.', status: 'error' }
  }

  // 2. Insertar en Supabase (API REST)
  const { error } = await supabase
    .from('leads')
    .insert([{ email: validatedFields.data.email }])

  if (error) {
    // Código 23505 es unique_violation en Postgres
    if (error.code === '23505') {
      return { message: 'Este correo ya está registrado.', status: 'error' }
    }
    console.error(error)
    return { message: 'Error al guardar. Intenta de nuevo.', status: 'error' }
  }

  return { message: '¡Estás dentro! Te notificaremos.', status: 'success' }
}

// NUEVA FUNCIÓN: Enviar Simulación
export async function sendSimulation(formData: FormData) {
  const email = formData.get('email') as string
  
  // URL Dinámica: Detecta si estamos en localhost o producción
  // NOTA IMPORTANTE: En Vercel debes configurar NEXT_PUBLIC_BASE_URL = https://security.kinetis.org
  // Si no está configurada, intentamos inferirla, pero mejor hardcodearla para producción si falla.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://security.kinetis.org' 
  
  // Construimos el enlace trampa
  const trackingLink = `${baseUrl}/api/track?email=${encodeURIComponent(email)}&c=campaign_001`

  try {
    const { data, error } = await resend.emails.send({
      from: 'Kinetis Security <security@kinetis.org>', // ¡DEBE SER TU DOMINIO VERIFICADO!
      to: [email],
      subject: 'Alerta de Seguridad: Nuevo inicio de sesión detectado',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; max-width: 500px;">
            <h2 style="color: #d93025;">Alerta de Google Workspace</h2>
            <p>Hemos detectado un inicio de sesión inusual en tu cuenta corporativa.</p>
            <p><strong>Dispositivo:</strong> iPhone 14 Pro<br><strong>Ubicación:</strong> Lagos, Nigeria</p>
            <p>Si no fuiste tú, por favor bloquea el acceso inmediatamente:</p>
            <a href="${trackingLink}" style="background-color: #d93025; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Bloquear Acceso y Cambiar Contraseña</a>
            <p style="font-size: 12px; color: #666; margin-top: 20px;">Este es un mensaje automático de seguridad.</p>
        </div>
      `
    })

    if (error) {
        console.error(error)
        return { message: 'Error al enviar ataque: ' + error.message, status: 'error' }
    }

    return { message: `Ataque enviado a ${email} (ID: ${data?.id})`, status: 'success' }

  } catch (error) {
    return { message: 'Error de servidor', status: 'error' }
  }
}