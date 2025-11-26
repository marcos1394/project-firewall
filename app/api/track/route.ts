import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function isUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return regex.test(uuid)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const cParam = searchParams.get('c') 

  let templateType = 'generic'
  let targetIdParam = null // Variable para guardar el ID de la víctima

  if (email && cParam) {
    try {
      if (isUUID(cParam)) {
        // 1. Es Campaña Masiva: Actualizamos status a 'clicked'
        // Y usamos .select() para recuperar el ID del registro actualizado
        const { data: updatedTarget, error } = await supabase
          .from('campaign_targets')
          .update({ status: 'clicked', clicked_at: new Date().toISOString() })
          .eq('campaign_id', cParam)
          .eq('email', email)
          .select('id') // Importante: Pedimos que nos devuelva el ID
          .single()

        if (updatedTarget) {
            targetIdParam = updatedTarget.id
        }

        // Buscar tipo de template
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('template_type')
          .eq('id', cParam)
          .single()

        if (campaign?.template_type) templateType = campaign.template_type

      } else {
        // 2. Es Quick Attack (Legacy)
        templateType = cParam
        await supabase.from('simulation_clicks').insert({
            email: email, campaign_id: 'quick-' + cParam
        })
      }
    } catch (error) {
      console.error('Tracking Error:', error)
    }
  }

  // Redirección con parámetros
  const redirectUrl = new URL('/education', request.url) // Usamos request.url como base segura
  redirectUrl.searchParams.set('t', templateType)
  
  if (targetIdParam) {
    redirectUrl.searchParams.set('uid', targetIdParam) // UID = User ID (Target ID)
  }

  return NextResponse.redirect(redirectUrl)
}