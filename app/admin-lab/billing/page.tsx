import { auth } from "@/auth"
import { supabase } from '@/lib/supabase'
import { CheckoutButton } from "@/components/CheckoutButton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Shield, AlertTriangle, Building2 } from "lucide-react"
import { redirect } from "next/navigation"
  
// Forzar dinamismo para ver cambios de suscripción al instante
export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const session = await auth()
  
  // @ts-ignore
  const orgId = session?.user?.orgId

  if (!orgId) {
    return (
        <div className="p-8 text-center text-slate-400">
            <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-yellow-500"/>
            <h2 className="text-xl text-white font-bold">Sin Organización Asignada</h2>
            <p>Debes pertenecer a una organización para gestionar la facturación.</p>
        </div>
    )
  }

  // 1. Obtener Datos de la Organización y Suscripción Actual
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', orgId)
    .in('status', ['active', 'trialing']) // Solo nos importan las activas
    .single()

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', orgId)
    .single()

  // 2. Obtener Planes Disponibles desde la DB
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true })

  // Lógica para determinar el plan actual
  // Si no hay suscripción activa, asumimos que es el plan con precio 0 (Starter)
  const currentPriceId = subscription?.stripe_subscription_id 
    ? subscription.stripe_price_id // Este campo deberías guardarlo al crear la sub, o inferirlo
    : 'free_tier'

  // *Nota: Para este MVP, si hay suscripción en DB, asumimos que es el plan PRO. 
  // Si no, es FREE. Ajusta esto según tu lógica de DB exacta.
  const isPro = !!subscription

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Suscripción y Facturación</h1>
            <p className="text-slate-400 flex items-center gap-2">
                Gestionando para: <span className="text-white font-medium flex items-center gap-1"><Building2 className="h-3 w-3"/> {org?.name}</span>
            </p>
        </div>
      </div>

      {/* Estado Actual */}
      <div className="mb-12 bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isPro ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                <CreditCard className="h-6 w-6"/>
            </div>
            <div>
                <p className="text-sm text-slate-400">Tu Plan Actual</p>
                <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-white">{isPro ? 'Professional' : 'Starter (Gratis)'}</p>
                    {isPro && <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">ACTIVO</Badge>}
                </div>
            </div>
        </div>
        
        {isPro && (
            <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Próxima renovación</p>
                <p className="text-white font-mono">
                    {subscription?.current_period_end 
                        ? new Date(subscription.current_period_end).toLocaleDateString() 
                        : 'Calculando...'}
                </p>
                <Button variant="link" className="text-xs text-red-400 h-auto p-0 mt-1 hover:text-red-300">
                    Cancelar suscripción
                </Button>
            </div>
        )}
      </div>

      {/* Grid de Planes Dinámico */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans?.map((plan) => {
            // Lógica de visualización
            const isCurrent = (plan.price === 0 && !isPro) || (plan.price > 0 && isPro)
            const isEnterprise = plan.stripe_price_id === 'contact_sales'
            const isPaidPlan = plan.price > 0 && !isEnterprise

            return (
                <Card 
                    key={plan.id} 
                    className={`bg-slate-900/50 border flex flex-col transition-all ${
                        isPaidPlan && !isCurrent 
                            ? 'border-indigo-500/50 shadow-2xl shadow-indigo-900/10 hover:border-indigo-400' 
                            : 'border-slate-800'
                    }`}
                >
                    {isPaidPlan && !isCurrent && (
                        <div className="bg-indigo-600 text-white text-[10px] font-bold text-center py-1 uppercase tracking-widest rounded-t-lg">
                            Recomendado
                        </div>
                    )}
                    
                    <CardHeader>
                        <CardTitle className="text-white text-xl flex justify-between items-center">
                            {plan.name}
                            {isCurrent && <CheckCircleIcon className="h-5 w-5 text-emerald-500"/>}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2 min-h-[40px]">
                            {/* Descripción basada en el nombre para demo */}
                            {plan.name === 'Starter' && "Para pruebas y consultores independientes."}
                            {plan.name === 'Professional' && "Para empresas que requieren cumplimiento normativo."}
                            {plan.name === 'Enterprise' && "Para corporativos con necesidades avanzadas."}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                        <div className="mb-6 flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">
                                {plan.price === 0 && !isEnterprise ? "$0" : 
                                 isEnterprise ? "Custom" : 
                                 `$${plan.price / 100}`}
                            </span>
                            {plan.price > 0 && <span className="text-slate-500 text-sm">/ mes</span>}
                        </div>
                        
                        <ul className="space-y-3">
                            {plan.features?.map((feature: string, i: number) => (
                                <li key={i} className="flex items-start text-sm text-slate-300">
                                    <Check className="h-4 w-4 text-emerald-500 mr-3 shrink-0 mt-0.5"/>
                                    <span className="leading-tight">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    
                    <CardFooter>
                        {isCurrent ? (
                            <Button className="w-full bg-slate-800 text-slate-400 cursor-default hover:bg-slate-800" variant="outline">
                                Plan Actual
                            </Button>
                        ) : isEnterprise ? (
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white" variant="outline">
                                Contactar Ventas
                            </Button>
                        ) : (
                            // AQUÍ ESTÁ EL BOTÓN DE PAGO REAL
                            <CheckoutButton 
                                priceId={plan.stripe_price_id} 
                                label={plan.price > 0 ? "Mejorar Plan" : "Downgrade"}
                            />
                        )}
                    </CardFooter>
                </Card>
            )
        })}
      </div>
      
      {/* Footer de Confianza */}
      <div className="mt-16 border-t border-slate-800 pt-8 text-center">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-slate-400"/>
            Pagos procesados de forma segura por <strong>Stripe</strong>. Encriptación SSL de 256 bits.
        </p>
      </div>
    </div>
  )
}

function CheckCircleIcon({className}: {className?: string}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
    )
}