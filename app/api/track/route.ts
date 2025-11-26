import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 1. Cliente Supabase (Directo para API Routes)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Función auxiliar para detectar si un string es UUID (ID de Campaña)
function isUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return regex.test(uuid)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Parámetros que vienen del enlace en el correo
  const email = searchParams.get('email')
  const cParam = searchParams.get('c') // Puede ser UUID (Campaña) o String (Nombre Template)

  // Por defecto, si algo falla, mostramos la lección genérica
  let templateType = 'generic'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Validamos que tengamos datos mínimos para rastrear
  if (email && cParam) {
    try {
      
      // CASO A: Es una Campaña Masiva (UUID)
      if (isUUID(cParam)) {
        
        // 1. Registrar el clic en la tabla de objetivos de campaña
        await supabase
          .from('campaign_targets')
          .update({ 
            status: 'clicked', 
            clicked_at: new Date().toISOString()
          })
          .eq('campaign_id', cParam) // cParam es el ID de la campaña
          .eq('email', email)

        // 2. Consultar qué template usaba esta campaña (para la educación)
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('template_type')
          .eq('id', cParam)
          .single()

        if (campaign && campaign.template_type) {
          templateType = campaign.template_type
        }

      } 
      // CASO B: Es un Ataque Individual (Quick Attack del Admin Lab)
      else {
        // En este caso, 'cParam' NO es un ID, es directamente el nombre del template (ej: 'hr-payroll')
        templateType = cParam

        // Registramos en la tabla simple de clics (Legacy/Individual)
        await supabase
          .from('simulation_clicks')
          .insert({
            email: email,
            campaign_id: 'quick-attack-' + cParam, // Marcador para identificarlo
            user_agent: userAgent
          })
      }

      console.log(`✅ Click trackeado: ${email} | Template: ${templateType}`)

    } catch (error) {
      // Si falla la base de datos, NO detenemos la redirección. 
      // El usuario debe ver la página de educación sí o sí.
      console.error('❌ Error crítico en tracking:', error)
    }
  }

  // 3. Redirección Final (The Teachable Moment)
  // Construimos la URL absoluta hacia la página de educación pasando el tipo de lección
  const requestUrl = new URL(request.url)
  const redirectUrl = new URL('/education', requestUrl.origin)
  
  // Agregamos el parámetro 't' para que el Frontend sepa qué lección mostrar
  redirectUrl.searchParams.set('t', templateType)

  return NextResponse.redirect(redirectUrl)
}