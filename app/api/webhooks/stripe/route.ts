import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  // 1. Verificar firma criptográfica (Seguridad)
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // 2. Manejar el evento "Pago Exitoso"
  if (event.type === 'checkout.session.completed') {
    
    // Recuperamos los metadatos que inyectamos en la acción de cobro
    const subscriptionId = session.subscription as string
    const customerId = session.customer as string
    const orgId = session.metadata?.organizationId
    const userId = session.metadata?.userId // (Opcional, para logs)

    if (!orgId) {
      return new NextResponse('Error: Sin Organization ID en metadatos', { status: 400 })
    }

    console.log(`💰 Pago recibido para Org: ${orgId}`)

    // 3. Obtener detalles de la suscripción desde Stripe (para saber fechas)
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // 4. Guardar/Actualizar en Supabase (Tabla subscriptions)
    // Usamos supabaseAdmin para saltarnos permisos RLS
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        organization_id: orgId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        // Mapeamos el ID del precio de Stripe al plan interno
        // (En un sistema real, buscarías el plan_id en tu tabla subscription_plans)
        // Por ahora, guardamos el price_id directo si tu tabla lo soporta o lo inferimos
        status: 'active',
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
      }, { onConflict: 'organization_id' })

    if (error) {
      console.error('Error actualizando DB:', error)
      return new NextResponse('Database Error', { status: 500 })
    }
  }

  // 5. Manejar evento "Pago Recurrente Exitoso" (Renovación mensual)
  if (event.type === 'invoice.payment_succeeded') {
    const subscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Solo actualizamos la fecha de fin
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)
  }

  // 6. Manejar cancelación o falta de pago
  if (event.type === 'customer.subscription.deleted') {
     const subscriptionId = session.subscription as string
     await supabaseAdmin
       .from('subscriptions')
       .update({ status: 'canceled' })
       .eq('stripe_subscription_id', subscriptionId)
  }

  return new NextResponse(null, { status: 200 })
}