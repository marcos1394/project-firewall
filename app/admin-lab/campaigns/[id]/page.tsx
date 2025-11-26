import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpenCheck, 
  Send 
} from "lucide-react"
import Link from "next/link"
import { DownloadReportButton } from "@/components/DownloadReportButton"

// Forzamos que la página sea dinámica para ver los cambios en tiempo real (clics/training)
export const dynamic = 'force-dynamic'

// Función para obtener datos de la DB
async function getCampaignDetails(id: string) {
  // 1. Datos de la campaña
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) return null

  // 2. Lista de objetivos (targets)
  // Ordenamos para que los que hicieron acción (clicked/trained) salgan arriba
  const { data: targets } = await supabase
    .from('campaign_targets')
    .select('*')
    .eq('campaign_id', id)
    .order('status', { ascending: false }) 
    // Orden alfabético inverso pone 'trained' y 'clicked' antes que 'sent' o 'pending'

  return { campaign, targets }
}

export default async function CampaignDetail({ params }: { params: { id: string } }) {
  const data = await getCampaignDetails(params.id)

  if (!data) return <div className="p-8 text-white">Campaña no encontrada.</div>

  const { campaign, targets } = data
  
  // --- CÁLCULO DE MÉTRICAS ---
  const total = targets?.length || 0
  
  // Vulnerables = Los que están en 'clicked' O 'trained' (porque para entrenarse tuvieron que caer primero)
  const vulnerableCount = targets?.filter((t: any) => t.status === 'clicked' || t.status === 'trained').length || 0
  
  // Mitigados = Los que completaron el entrenamiento ('trained')
  const trainedCount = targets?.filter((t: any) => t.status === 'trained').length || 0
  
  // Tasas
  const failRate = total > 0 ? Math.round((vulnerableCount / total) * 100) : 0
  const recoveryRate = vulnerableCount > 0 ? Math.round((trainedCount / vulnerableCount) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      
      {/* --- HEADER DE NAVEGACIÓN --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <Link href="/admin-lab/campaigns" className="p-2 hover:bg-slate-800 rounded-full transition-colors group">
                <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white"/>
            </Link>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-white">{campaign.name}</h1>
                    <Badge variant={campaign.status === 'completed' ? 'default' : 'outline'} className="uppercase text-xs font-mono">
                        {campaign.status}
                    </Badge>
                </div>
                <p className="text-slate-400 text-sm flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> Creado: {new Date(campaign.created_at).toLocaleDateString()} {new Date(campaign.created_at).toLocaleTimeString()}</span>
                    <span className="text-indigo-400 font-mono text-xs bg-indigo-950/30 px-2 rounded">TEMPLATE: {campaign.template_type}</span>
                </p>
            </div>
        </div>
        
       <DownloadReportButton campaign={campaign} targets={targets ?? []} />
      </div>

      {/* --- KPI CARDS (Dashboard Ejecutivo) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Total */}
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alcance Total</CardTitle></CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                    {total} <span className="text-slate-600 text-sm font-normal">empleados</span>
                </div>
            </CardContent>
        </Card>

        {/* Card 2: Vulnerables (Caídos) */}
        <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden">
            {failRate > 0 && <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>}
            <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comprometidos</CardTitle></CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-red-400 flex items-center gap-2">
                    {vulnerableCount}
                    <Badge className="bg-red-500/10 text-red-500 border-0 ml-2">{failRate}% Rate</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">Hicieron clic en el enlace trampa</p>
            </CardContent>
        </Card>

        {/* Card 3: Mitigados (Entrenados) */}
        <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden">
             {/* Barra de progreso visual */}
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 transition-all duration-1000" style={{ width: `${recoveryRate}%` }}></div>
            
            <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recuperación</CardTitle></CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-blue-400 flex items-center gap-2">
                    {trainedCount}
                    <CheckCircle2 className="h-5 w-5 text-blue-500"/>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    El <span className="text-blue-400 font-bold">{recoveryRate}%</span> completó la capacitación
                </p>
            </CardContent>
        </Card>

        {/* Card 4: Estado General */}
        <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-center items-center text-center">
            <CardContent className="pt-6">
                {failRate < 5 ? (
                    <>
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2 mx-auto"/>
                        <div className="text-lg font-bold text-emerald-400">Riesgo Bajo</div>
                        <p className="text-xs text-slate-500">Campaña Exitosa</p>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="h-8 w-8 text-orange-500 mb-2 mx-auto"/>
                        <div className="text-lg font-bold text-orange-400">Riesgo Alto</div>
                        <p className="text-xs text-slate-500">Se requiere re-entrenamiento</p>
                    </>
                )}
            </CardContent>
        </Card>
      </div>

      {/* --- TABLA DE AUDITORÍA DETALLADA --- */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
                <BookOpenCheck className="h-5 w-5 text-slate-400"/>
                Bitácora de Actividad
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Objetivo (Email)</TableHead>
                        <TableHead className="text-slate-400">Estado Actual</TableHead>
                        <TableHead className="text-slate-400">Envío</TableHead>
                        <TableHead className="text-slate-400">Momento del Clic</TableHead>
                        <TableHead className="text-right text-slate-400">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {targets?.map((target: any) => (
                        <TableRow key={target.id} className="border-slate-800 hover:bg-slate-800/50 group">
                            
                            {/* Columna 1: Email */}
                            <TableCell className="font-medium text-slate-200 font-mono text-sm">
                                {target.email}
                            </TableCell>

                            {/* Columna 2: Badge de Estado */}
                            <TableCell>
                                {target.status === 'trained' && (
                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 gap-1 px-3 py-1">
                                        <BookOpenCheck className="h-3 w-3"/> CAPACITADO
                                    </Badge>
                                )}
                                {target.status === 'clicked' && (
                                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 gap-1 px-3 py-1 animate-pulse">
                                        <AlertTriangle className="h-3 w-3"/> VULNERABLE
                                    </Badge>
                                )}
                                {target.status === 'sent' && (
                                    <Badge variant="outline" className="border-slate-600 text-slate-500 gap-1">
                                        <Send className="h-3 w-3"/> ENVIADO
                                    </Badge>
                                )}
                                {target.status === 'pending' && (
                                    <Badge variant="secondary" className="text-slate-500">PENDIENTE</Badge>
                                )}
                            </TableCell>

                            {/* Columna 3: Hora de Envío */}
                            <TableCell className="text-slate-500 text-xs">
                                {target.sent_at ? new Date(target.sent_at).toLocaleTimeString() : '-'}
                            </TableCell>

                            {/* Columna 4: Hora de Clic */}
                            <TableCell className="text-slate-300 text-xs font-mono">
                                {target.clicked_at ? (
                                    <span className="text-red-400 font-bold">
                                        {new Date(target.clicked_at).toLocaleTimeString()}
                                    </span>
                                ) : (
                                    <span className="text-slate-700">-</span>
                                )}
                            </TableCell>

                            {/* Columna 5: Acciones (Visual) */}
                            <TableCell className="text-right">
                                {target.status === 'trained' ? (
                                    <CheckCircle2 className="h-5 w-5 text-blue-500 ml-auto opacity-50"/>
                                ) : target.status === 'clicked' ? (
                                    <div className="h-2 w-2 rounded-full bg-red-500 ml-auto animate-ping"></div>
                                ) : (
                                    <div className="h-2 w-2 rounded-full bg-slate-700 ml-auto"></div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    
                    {(!targets || targets.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                No hay objetivos registrados en esta campaña.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}