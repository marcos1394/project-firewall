import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, MousePointerClick, Send, Clock } from "lucide-react"

// Forzamos datos frescos siempre
export const dynamic = 'force-dynamic'

async function getCampaigns() {
  // Traemos las campañas ordenadas por fecha reciente
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (!campaigns) return []

  // Para cada campaña, obtenemos estadísticas rápidas
  // (En producción esto se haría con una vista SQL o query compleja, 
  //  para MVP hacemos un map simple)
  const campaignsWithStats = await Promise.all(campaigns.map(async (camp) => {
    
    // Contar total enviados
    const { count: total } = await supabase
      .from('campaign_targets')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', camp.id)

    // Contar clics
    const { count: clicks } = await supabase
      .from('campaign_targets')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', camp.id)
      .eq('status', 'clicked')

    return {
      ...camp,
      stats: {
        total: total || 0,
        clicks: clicks || 0,
        rate: total ? Math.round(((clicks || 0) / total) * 100) : 0
      }
    }
  }))

  return campaignsWithStats
}

export default async function CampaignsList() {
  const campaigns = await getCampaigns()

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Historial de Operaciones</h2>
            <p className="text-slate-400">Registro de todas las campañas masivas ejecutadas.</p>
        </div>
        <a href="/admin-lab" className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-white transition-colors">
          ← Volver al War Room
        </a>
      </div>

      <div className="grid gap-4">
        {campaigns.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 border border-slate-800 rounded-lg border-dashed">
                <p className="text-slate-500">No hay campañas registradas aún.</p>
            </div>
        ) : (
            campaigns.map((camp) => (
                <Card key={camp.id} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-medium text-white flex items-center gap-3">
                                {camp.name}
                                <Badge variant={camp.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                    {camp.status}
                                </Badge>
                            </CardTitle>
                            <div className="flex gap-4 text-xs text-slate-400 font-mono">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {new Date(camp.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><FileText className="h-3 w-3"/> Template: {camp.template_type}</span>
                            </div>
                        </div>
                        
                        {/* KPI Box de la Campaña */}
                        <div className="flex gap-6 text-right">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Enviados</p>
                                <p className="text-xl font-bold text-slate-200 flex items-center justify-end gap-2">
                                    {camp.stats.total} <Send className="h-4 w-4 text-slate-600"/>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Víctimas</p>
                                <p className={`text-xl font-bold flex items-center justify-end gap-2 ${camp.stats.clicks > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                                    {camp.stats.clicks} <MousePointerClick className="h-4 w-4"/>
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Tasa de Falla</p>
                                <p className={`text-xl font-bold ${camp.stats.rate > 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {camp.stats.rate}%
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            ))
        )}
      </div>
    </div>
  )
}