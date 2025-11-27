import { Check, CreditCard, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "para siempre",
    description: "Para consultores independientes y pruebas.",
    features: [
      "1 Organización",
      "Hasta 50 Empleados",
      "Campañas de Phishing Manuales",
      "Reportes Básicos"
    ],
    current: true,
    action: "Tu Plan Actual"
  },
  {
    name: "Professional",
    price: "$299",
    period: "/ mes",
    description: "Para PyMEs que requieren cumplimiento normativo.",
    features: [
      "3 Organizaciones",
      "Hasta 500 Empleados",
      "Sincronización con Microsoft 365",
      "Breach Radar (Dark Web)",
      "Reportes PDF Marca Blanca"
    ],
    current: false,
    popular: true,
    action: "Mejorar Plan"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Para corporativos con necesidades avanzadas.",
    features: [
      "Organizaciones Ilimitadas",
      "Empleados Ilimitados",
      "SSO & SAML",
      "SLA Garantizado",
      "Gerente de Cuenta Dedicado"
    ],
    current: false,
    action: "Contactar Ventas"
  }
]

export default function BillingPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Suscripción y Facturación</h1>
        <p className="text-slate-400">Gestiona tu plan y métodos de pago.</p>
      </div>

      {/* Estado Actual */}
      <div className="mb-12 bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600/20 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-indigo-400"/>
            </div>
            <div>
                <p className="text-sm text-slate-400">Plan Actual</p>
                <p className="text-xl font-bold text-white">Free Tier</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Próxima renovación</p>
            <p className="text-white font-mono">N/A</p>
        </div>
      </div>

      {/* Grid de Precios */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
            <Card 
                key={plan.name} 
                className={`bg-slate-900/50 border flex flex-col ${plan.popular ? 'border-indigo-500 shadow-2xl shadow-indigo-900/20 relative' : 'border-slate-800'}`}
            >
                {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white border-0 px-3">MÁS POPULAR</Badge>
                    </div>
                )}
                <CardHeader>
                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-400 mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="mb-6">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-slate-500 text-sm">{plan.period}</span>
                    </div>
                    <ul className="space-y-3">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center text-sm text-slate-300">
                                <Check className="h-4 w-4 text-emerald-500 mr-3 shrink-0"/>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button 
                        className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700'} text-white`}
                        variant={plan.current ? "outline" : "default"}
                        disabled={plan.current}
                    >
                        {plan.current ? <Check className="mr-2 h-4 w-4"/> : null}
                        {plan.action}
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Shield className="h-4 w-4"/>
            Los pagos son procesados de forma segura por Stripe. Puedes cancelar en cualquier momento.
        </p>
      </div>
    </div>
  )
}