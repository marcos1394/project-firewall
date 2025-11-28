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
