import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Cliente Supabase Directo (usamos variables de entorno)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const campaign = searchParams.get('c') // ID de campaña

  // 1. Si hay datos, los registramos
  if (email && campaign) {
    await supabase.from('simulation_clicks').insert({
      email: email,
      campaign_id: campaign,
      user_agent: request.headers.get('user-agent') || 'unknown'
    })
  }

  // 2. Redirigimos SIEMPRE a la página de educación
  // Usamos la URL base de la petición para saber el dominio actual (localhost o kinetis.org)
  const baseUrl = new URL(request.url).origin
  return NextResponse.redirect(`${baseUrl}/education`)
}