'use server'

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'

export async function createCheckoutSession(priceId: string) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return { error: 'No autorizado' }
  }

  // 1. Obtener la Organización del usuario
  // (Asumimos que paga para la organización que tiene activa en sesión)
  // @ts-ignore
  const orgId = session.user.orgId

  if (!orgId) {
    return { error: 'No tienes una organización asignada para facturar.' }
  }

  // 2. Buscar si ya tenemos un Customer ID de Stripe para esta Org en la DB
  // (Esto evita crear duplicados en Stripe cada vez que intentan pagar)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', orgId)
    .single()

  let customerId = subscription?.stripe_customer_id

  // 3. Crear la Sesión de Checkout en Stripe
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId, // Si es null, Stripe creará uno nuevo o pedirá email
      customer_email: customerId ? undefined : session.user.email, // Pre-llenar email si es nuevo
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Metadatos CLAVE: Esto nos servirá luego en el Webhook para saber quién pagó
      metadata: {
        organizationId: orgId,
        userId: session.user.id as string,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin-lab/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin-lab/billing?canceled=true`,
    })

    // Si todo sale bien, redirigimos al usuario a la página de Stripe
    if (checkoutSession.url) {
      redirect(checkoutSession.url)
    }
    
  } catch (e: any) {
    // Si el error es por el redirect de Next.js, lo dejamos pasar
    if (e.message === 'NEXT_REDIRECT') throw e
    console.error(e)
    return { error: 'Error conectando con Stripe: ' + e.message }
  }
}