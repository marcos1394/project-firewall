'use server'

import { supabase } from '@/lib/supabase'
import { z } from 'zod'

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