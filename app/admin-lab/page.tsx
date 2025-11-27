import { auth, signOut } from "@/auth"
import { supabase } from '@/lib/supabase'
import { OverviewChart } from '@/components/OverviewChart'
import { CampaignLauncher } from '@/components/CampaignLauncher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MousePointerClick, 
  ShieldAlert, 
  Activity, 
  Zap,
  Building2,
  FileText
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

// Forzamos renderizado dinámico para tener datos frescos
export const dynamic = 'force-dynamic'

// ==========================================
// LÓGICA DE DATOS (Backend en Server Component)
// ==========================================
async function getStats(orgId?: string) {
  
  // 1. Identificar Campañas Relevantes
  // Si hay orgId (Cliente), buscamos solo SUS campañas.
  // Si no hay orgId (Owner), buscamos TODAS.
  let campaignsQuery = supabase.from('campaigns').select('id, status')
  
  if (orgId) {
    campaignsQuery = campaignsQuery.eq('organization_id', orgId)
  }
  
  const { data: campaigns, error } = await campaignsQuery
  
  if (error) console.error("Error fetching campaigns:", error)

  const campaignIds = campaigns?.map(c => c.id) || []
  const activeCampaigns = campaigns?.filter(c => c.status === 'sending').length || 0

  // Si el cliente no tiene campañas, retornamos ceros para evitar errores de query vacía
  if (campaignIds.length === 0) {
     // Solo buscamos leads si NO hay orgId (es admin), si es cliente retorna 0
     let leadsCount = 0
     if (!orgId) {
        const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true })
        leadsCount = count || 0
     }
     return { clicks: 0, leads: leadsCount, sent: 0, active: 0 }
  }

  // 2. Contar Objetivos (Total Enviados) en esas campañas
  const { count: targetsCount } = await supabase
    .from('campaign_targets')
    .select('*', { count: 'exact', head: true })
    .in('campaign_id', campaignIds)

  // 3. Contar Vulnerables (Clics) en esas campañas
  // Consideramos 'clicked' y 'trained' como vulnerables (porque cayeron)
  const { count: clicksCount } = await supabase
    .from('campaign_targets')
    .select('*', { count: 'exact', head: true })
    .in('campaign_id', campaignIds)
    .in('status', ['clicked', 'trained'])

  // 4. Contar Leads (Solo para Admin Global)
  let leadsCount = 0
  if (!orgId) {
    const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true })
    leadsCount = count || 0
  }

  return {
    clicks: clicksCount || 0,
    leads: leadsCount || 0,
    sent: targetsCount || 0,
    active: activeCampaigns
  }
}

// ==========================================
// COMPONENTE PRINCIPAL (PÁGINA)
// ==========================================
export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Extraemos Rol y OrgId de la sesión (inyectados en auth.ts)
  // @ts-ignore
  const userRole = session.user.role || 'user'
  // @ts-ignore
  const userOrgId = session.user.orgId

  // --- LÓGICA DE TENANT ISOLATION ---
  // Si es OWNER -> filterId es undefined (trae todo)
  // Si es USER -> filterId es su orgId (trae solo lo suyo)
  const filterId = userRole === 'owner' ? undefined : userOrgId

  // Obtenemos estadísticas filtradas
  const stats = await getStats(filterId)
  
  // Cálculo de Riesgo
  const riskPercentage = stats.sent > 0 ? Math.round((stats.clicks / stats.sent) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      
      {/* HEADER SUPERIOR CON PERFIL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Kinetis War Room
                {userRole === 'owner' && (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 bg-yellow-500/10 text-[10px] uppercase tracking-widest">
                        Super Admin
                    </Badge>
                )}
                {userRole === 'user' && (
                    <Badge variant="outline" className="text-indigo-400 border-indigo-500/50 bg-indigo-500/10 text-[10px] uppercase tracking-widest">
                        Vista Cliente
                    </Badge>
                )}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
                Bienvenido, <span className="text-white font-medium">{session.user.name}</span>. 
                {userRole === 'owner' ? ' Monitor Global de Amenazas.' : ' Panel de Seguridad Corporativa.'}
            </p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">{session.user.email}</p>
                <div className="flex justify-end items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${userOrgId || userRole === 'owner' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                    <p className="text-xs text-slate-500 font-mono">
                        ORG: {userRole === 'owner' ? 'GLOBAL' : (userOrgId ? 'CONECTADO' : 'SIN ASIGNAR')}
                    </p>
                </div>
            </div>
            <Avatar className="h-10 w-10 border border-slate-700">
                <AvatarImage src={session.user.image || ''} />
                <AvatarFallback className="bg-indigo-900 text-indigo-200">KN</AvatarFallback>
            </Avatar>
            
            {/* LOGOUT BUTTON */}
            <form action={async () => {
                'use server'
                await signOut({ redirectTo: "/login" })
            }}>
                <Button variant="outline" size="sm" className="border-red-900/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 hover:border-red-800">
                    Salir
                </Button>
            </form>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN RÁPIDA (Solo visible para Admin o según permisos) */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <Link href="/admin-lab/campaigns">
            <Button variant="secondary" size="sm" className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white gap-2">
                <Activity className="h-4 w-4"/> Historial de Campañas
            </Button>
        </Link>
        <Link href="/admin-lab/templates/new">
            <Button variant="secondary" size="sm" className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white gap-2">
                <FileText className="h-4 w-4"/> Nueva Plantilla
            </Button>
        </Link>
        
        {/* Solo el dueño puede ver la gestión de clientes */}
        {userRole === 'owner' && (
            <Link href="/admin-lab/clients">
                <Button variant="secondary" size="sm" className="bg-indigo-900/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-900/40 gap-2">
                    <Building2 className="h-4 w-4"/> Gestionar Clientes
                </Button>
            </Link>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard 
            title="Total Enviados" 
            value={stats.sent.toString()} 
            icon={<Activity className="h-4 w-4 text-slate-400"/>}
            desc="Correos de simulación"
        />
        <StatsCard 
            title="Vulnerables Detectados" 
            value={stats.clicks.toString()} 
            icon={<MousePointerClick className="h-4 w-4 text-red-400"/>}
            desc="Hicieron clic en trampas"
            trend={stats.clicks > 0 ? "negative" : "positive"}
        />
        <StatsCard 
            title="Nivel de Riesgo" 
            value={`${riskPercentage}%`} 
            icon={<ShieldAlert className="h-4 w-4 text-orange-400"/>}
            desc="Tasa de fallo promedio"
            trend={riskPercentage > 10 ? "negative" : "positive"}
        />
        
        {/* Card condicional: Leads para Admin, Campañas Activas para Cliente */}
        {userRole === 'owner' ? (
            <StatsCard 
                title="Beta Waitlist" 
                value={stats.leads.toString()} 
                icon={<Users className="h-4 w-4 text-blue-400"/>}
                desc="Empresas interesadas"
            />
        ) : (
            <StatsCard 
                title="Campañas Activas" 
                value={stats.active.toString()} 
                icon={<Zap className="h-4 w-4 text-blue-400"/>}
                desc="En proceso de envío"
            />
        )}
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* GRÁFICA (4 Columnas) */}
        <Card className="col-span-4 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Tendencia de Vulnerabilidad</CardTitle>
            <CardDescription className="text-slate-400">
                Análisis de comportamiento de los últimos 30 días.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>

        {/* LANZADOR DE CAMPAÑAS (3 Columnas) */}
        <Card className="col-span-3 bg-slate-900/50 border-slate-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500"/>
                Centro de Operaciones
            </CardTitle>
            <CardDescription className="text-slate-400">
              Inicia una nueva simulación masiva.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <CampaignLauncher />
            
            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <Link href="/admin-lab/campaigns" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 hover:underline flex items-center justify-center gap-1">
                    VER HISTORIAL COMPLETO <Activity className="h-3 w-3"/>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Subcomponente simple para las tarjetas
function StatsCard({title, value, icon, desc, trend}: any) {
    return (
        <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              {title}
            </CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trend === 'negative' ? 'text-red-400' : 'text-white'}`}>
                {value}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {desc}
            </p>
          </CardContent>
        </Card>
    )
}