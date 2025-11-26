import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Cliente Supabase Directo
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const campaignId = searchParams.get('c') // ID de la campaña

  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Validamos que vengan los datos críticos
  if (email && campaignId) {
    try {
      // 1. Actualizar el estado del objetivo en la campaña específica
      // Buscamos coincidencia por email Y campaign_id
      const { error } = await supabase
        .from('campaign_targets')
        .update({ 
          status: 'clicked', 
          clicked_at: new Date().toISOString()
        })
        .eq('campaign_id', campaignId)
        .eq('email', email)

      if (error) {
        console.error('Error tracking click:', error)
      } else {
        console.log(`Click registrado para ${email} en campaña ${campaignId}`)
      }

    } catch (e) {
      console.error('Tracking exception:', e)
    }
  }

  // 2. Redirigir SIEMPRE a la página de educación
  // Detectamos el dominio base automáticamente
  const baseUrl = new URL(request.url).origin
  return NextResponse.redirect(`${baseUrl}/education`)
}