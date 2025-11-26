import { supabase } from '@/lib/supabase'
import { OverviewChart } from '@/components/OverviewChart'
import { CampaignLauncher } from '@/components/CampaignLauncher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MousePointerClick, ShieldAlert, Activity, Zap } from "lucide-react"

// Forzamos que esta página sea dinámica (siempre traiga datos frescos de la DB)
export const dynamic = 'force-dynamic'

async function getStats() {
  // 1. Obtener conteo de clics reales
  const { count: clicksCount } = await supabase
    .from('simulation_clicks')
    .select('*', { count: 'exact', head: true })

  // 2. Obtener conteo de leads (empresas interesadas)
  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  return {
    clicks: clicksCount || 0,
    leads: leadsCount || 0,
    // Simulado: Asumimos que hemos enviado 3 ataques por cada clic para el demo
    sent: (clicksCount || 0) * 3 + 10 
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  
  // Calculamos riesgo simple
  const riskPercentage = stats.sent > 0 ? Math.round((stats.clicks / stats.sent) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Kinetis War Room</h2>
            <p className="text-slate-400">Monitor de amenazas y simulación activa.</p>
        </div>
        <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-mono text-emerald-400">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard 
            title="Total Enviados" 
            value={stats.sent.toString()} 
            icon={<Activity className="h-4 w-4 text-slate-400"/>}
            desc="+12% desde ayer"
        />
        <StatsCard 
            title="Víctimas (Clics)" 
            value={stats.clicks.toString()} 
            icon={<MousePointerClick className="h-4 w-4 text-red-400"/>}
            desc="Alta vulnerabilidad detectada"
        />
        <StatsCard 
            title="Tasa de Infección" 
            value={`${riskPercentage}%`} 
            icon={<ShieldAlert className="h-4 w-4 text-orange-400"/>}
            desc="El objetivo es < 5%"
        />
        <StatsCard 
            title="Empresas en Beta" 
            value={stats.leads.toString()} 
            icon={<Users className="h-4 w-4 text-blue-400"/>}
            desc="En lista de espera"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Gráfica Principal (Ocupa 4 columnas) */}
        <Card className="col-span-4 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Tendencia de Vulnerabilidad</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>

        {/* Panel de Ataque (Ocupa 3 columnas) */}
        <Card className="col-span-3 bg-slate-900/50 border-slate-800">
  <CardHeader>
    <CardTitle className="text-white flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-500"/>
        Gestor de Campañas
    </CardTitle>
    <CardDescription className="text-slate-400">
      Sube un CSV para iniciar una simulación masiva.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <CampaignLauncher />

    <div className="mt-4 pt-4 border-t border-slate-800 text-center">
    <a href="/admin-lab/campaigns" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 hover:underline">
        VER HISTORIAL COMPLETO DE CAMPAÑAS →
    </a>
</div>
            
            {/* Live Feed Simulado */}
            <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-mono text-slate-500 uppercase mb-4">Actividad Reciente</h4>
                <div className="space-y-3 text-xs font-mono">
                    <div className="flex gap-2 text-slate-300">
                        <span className="text-emerald-500">[SENT]</span>
                        <span>Payload 'google-alert' sent to ceo@...</span>
                    </div>
                    {stats.clicks > 0 && (
                        <div className="flex gap-2 text-red-400 animate-pulse">
                            <span className="font-bold">[CLICK]</span>
                            <span>Victim detected via iPhone 14 (MX)</span>
                        </div>
                    )}
                    <div className="flex gap-2 text-slate-500">
                        <span className="text-blue-500">[INFO]</span>
                        <span>System calibration complete.</span>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCard({title, value, icon, desc}: any) {
    return (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              {title}
            </CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className="text-xs text-slate-500 mt-1">
              {desc}
            </p>
          </CardContent>
        </Card>
    )
}