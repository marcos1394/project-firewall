import { supabase } from '@/lib/supabase'
import { IntegrationsPanel } from '@/components/IntegrationsPanel' // <--- AQUÍ IMPORTAMOS EL NUEVO COMPONENTE
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, ShieldAlert, Zap, Building2 } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getOrgDetails(id: string) {
  // 1. Datos de la Org
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  // 2. Empleados de esa Org
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', id)
    .order('created_at', { ascending: false })

  return { org, employees }
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const { org, employees } = await getOrgDetails(params.id)

  if (!org) return <div className="p-8 text-white">Organización no encontrada.</div>

  // Calcular métricas rápidas
  const totalEmployees = employees?.length || 0
  const compromisedEmployees = employees?.filter((e: any) => e.risk_level === 'vulnerable' || e.risk_level === 'critical').length || 0

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <Link href="/admin-lab/clients" className="p-2 hover:bg-slate-800 rounded-full transition-colors group">
                <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white"/>
            </Link>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-slate-500"/>
                    {org.name}
                </h1>
                <p className="text-slate-400 text-sm font-mono flex items-center gap-2">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-300">ID: {org.id.split('-')[0]}...</span>
                    {org.domain && <span>| {org.domain}</span>}
                </p>
            </div>
        </div>
        
        {/* Acciones de Cliente */}
        <div className="flex gap-2">
            <Button variant="secondary" className="bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/20 gap-2">
                <Zap className="h-4 w-4"/> Lanzar Ataque Exclusivo
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Integraciones & Stats */}
        <div className="space-y-6">
            
            {/* Tarjeta de Riesgo */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Estado de Seguridad</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-bold text-white">{org.risk_score || 0}%</span>
                        <span className="text-sm text-slate-400 mb-1">Riesgo Global</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-red-500" style={{ width: `${org.risk_score || 5}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3 text-red-400"/>
                        {compromisedEmployees} empleados comprometidos históricamente.
                    </p>
                </CardContent>
            </Card>

            {/* AQUÍ ESTÁ EL NUEVO PANEL DE INTEGRACIONES */}
            <IntegrationsPanel organizationId={org.id} />
            
        </div>

        {/* COLUMNA DERECHA: Lista de Empleados (Directorio) */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 flex flex-col h-full min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Users className="h-5 w-5 text-indigo-400"/>
                        Directorio Activo
                    </CardTitle>
                    <p className="text-xs text-slate-500">Empleados sincronizados para pruebas de phishing.</p>
                </div>
                <Badge variant="outline" className="text-slate-400 bg-slate-950">{totalEmployees} Total</Badge>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto p-0">
                <Table>
                    <TableHeader className="bg-slate-950/50">
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400 h-10 text-xs uppercase font-bold w-[40%]">Empleado</TableHead>
                            <TableHead className="text-slate-400 h-10 text-xs uppercase font-bold">Posición</TableHead>
                            <TableHead className="text-slate-400 h-10 text-xs uppercase font-bold text-center">Nivel Riesgo</TableHead>
                            <TableHead className="text-slate-400 h-10 text-xs uppercase font-bold text-right">Incidencias</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees?.map((emp: any) => (
                            <TableRow key={emp.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors group">
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-slate-200 text-sm">{emp.first_name || 'Sin Nombre'}</p>
                                        <p className="font-mono text-slate-500 text-xs">{emp.email}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-400 text-xs">
                                    {emp.position || '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                    {emp.risk_level === 'critical' ? (
                                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">CRÍTICO</Badge>
                                    ) : emp.risk_level === 'vulnerable' ? (
                                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]">ALTO</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-800 text-slate-500 border-slate-700 text-[10px]">DESCONOCIDO</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {emp.times_compromised > 0 ? (
                                        <div className="flex items-center justify-end gap-1 text-red-400 font-bold text-xs">
                                            <ShieldAlert className="h-3 w-3"/> {emp.times_compromised}
                                        </div>
                                    ) : (
                                        <span className="text-slate-700 text-xs">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        
                        {(!employees || employees.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-16 text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-10 w-10 text-slate-700"/>
                                        <p>Directorio vacío.</p>
                                        <p className="text-xs">Usa el panel de la izquierda para sincronizar o añadir empleados.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

      </div>
    </div>
  )
}