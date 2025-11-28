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
