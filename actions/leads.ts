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