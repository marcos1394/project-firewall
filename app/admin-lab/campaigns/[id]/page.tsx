import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

// Forzamos dinamismo para ver datos en tiempo real
export const dynamic = 'force-dynamic'

// Esta función obtiene los datos crudos de la campaña y sus objetivos
async function getCampaignDetails(id: string) {
  // 1. Datos de la campaña
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) return null

  // 2. Lista de objetivos (víctimas)
  const { data: targets } = await supabase
    .from('campaign_targets')
    .select('*')
    .eq('campaign_id', id)
    .order('status', { ascending: true }) // Primero los 'clicked' (alfabéticamente c antes de s) o ajustar orden

  return { campaign, targets }
}

export default async function CampaignDetail({ params }: { params: { id: string } }) {
  const data = await getCampaignDetails(params.id)

  if (!data) return <div className="p-8 text-white">Campaña no encontrada.</div>

  const { campaign, targets } = data
  
  // Calculamos métricas en el momento
  const total = targets?.length || 0
  const clicked = targets?.filter((t: any) => t.status === 'clicked').length || 0
  const rate = total > 0 ? Math.round((clicked / total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      
      {/* Header de Navegación */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <Link href="/admin-lab/campaigns" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft className="h-5 w-5 text-slate-400"/>
            </Link>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-white">{campaign.name}</h1>
                    <Badge variant={campaign.status === 'completed' ? 'default' : 'outline'} className="uppercase text-xs">
                        {campaign.status}
                    </Badge>
                </div>
                <p className="text-slate-400 text-sm flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> Lanzado: {new Date(campaign.created_at).toLocaleString()}</span>
                    <span className="text-indigo-400 font-mono">ID: {campaign.id.split('-')[0]}...</span>
                </p>
            </div>
        </div>
        
        {/* Botón de Acción (Simulado para MVP) */}
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2">
            <Download className="h-4 w-4"/> Exportar CSV
        </Button>
      </div>

      {/* KPI Cards del Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Alcance Total</CardTitle></CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-white">{total}</div>
                <p className="text-xs text-slate-500">Empleados auditados</p>
            </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Comprometidos</CardTitle></CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-red-400">{clicked}</div>
                <p className="text-xs text-slate-500">Hicieron clic en el enlace</p>
            </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Nivel de Riesgo</CardTitle></CardHeader>
            <CardContent>
                <div className={`text-3xl font-bold ${rate > 10 ? 'text-red-500' : 'text-emerald-500'}`}>{rate}%</div>
                <p className="text-xs text-slate-500">Tasa de fallo global</p>
            </CardContent>
        </Card>
      </div>

      {/* La Lista de la Verdad (Auditoría) */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
            <CardTitle className="text-white">Registro de Actividad Individual</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Empleado (Target)</TableHead>
                        <TableHead className="text-slate-400">Estado</TableHead>
                        <TableHead className="text-slate-400">Hora de Envío</TableHead>
                        <TableHead className="text-slate-400 text-right">Momento del Fallo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {targets?.map((target: any) => (
                        <TableRow key={target.id} className="border-slate-800 hover:bg-slate-800/50">
                            <TableCell className="font-medium text-slate-200">
                                {target.email}
                            </TableCell>
                            <TableCell>
                                {target.status === 'clicked' ? (
                                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 gap-1">
                                        <AlertTriangle className="h-3 w-3"/> COMPROMETIDO
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 gap-1">
                                        <CheckCircle2 className="h-3 w-3"/> Seguro
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-slate-500 font-mono text-xs">
                                {target.sent_at ? new Date(target.sent_at).toLocaleTimeString() : '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                                {target.clicked_at ? (
                                    <span className="text-red-400 font-bold">
                                        {new Date(target.clicked_at).toLocaleTimeString()}
                                    </span>
                                ) : (
                                    <span className="text-slate-600">-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}