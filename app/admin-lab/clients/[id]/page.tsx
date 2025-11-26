import { supabase } from '@/lib/supabase'
import { DirectoryImporter } from '@/components/DirectoryImporter'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, ShieldAlert, Zap } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <Link href="/admin-lab/clients" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft className="h-5 w-5 text-slate-400"/>
            </Link>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{org.name}</h1>
                <p className="text-slate-400 text-sm font-mono">{org.domain || 'ID: ' + org.id}</p>
            </div>
        </div>
        
        {/* Futuro Feature: Lanzar campaña SOLO a esta empresa */}
        <Button variant="secondary" className="bg-indigo-600 text-white hover:bg-indigo-500 border-none gap-2">
            <Zap className="h-4 w-4"/> Lanzar Ataque Exclusivo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Stats & Import */}
        <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader><CardTitle className="text-sm text-slate-400 uppercase">Riesgo Acumulado</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-white mb-2">{org.risk_score || 0}%</div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-red-500" style={{ width: `${org.risk_score || 0}%` }}></div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader><CardTitle className="text-sm text-slate-400 uppercase">Cargar Directorio</CardTitle></CardHeader>
                <CardContent>
                    <DirectoryImporter organizationId={org.id} />
                </CardContent>
            </Card>
        </div>

        {/* COLUMNA DERECHA: Lista de Empleados */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400"/>
                    Directorio de Empleados
                </CardTitle>
                <Badge variant="outline" className="text-slate-400">{employees?.length || 0} Registros</Badge>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400">Email</TableHead>
                            <TableHead className="text-slate-400">Nivel de Riesgo</TableHead>
                            <TableHead className="text-slate-400 text-right">Veces Comprometido</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees?.map((emp: any) => (
                            <TableRow key={emp.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="font-mono text-slate-300 text-sm">{emp.email}</TableCell>
                                <TableCell>
                                    {emp.risk_level === 'critical' ? (
                                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20">CRÍTICO</Badge>
                                    ) : emp.risk_level === 'vulnerable' ? (
                                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">ALTO</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-slate-500">Desconocido</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {emp.times_compromised > 0 ? (
                                        <div className="flex items-center justify-end gap-1 text-red-400 font-bold">
                                            <ShieldAlert className="h-3 w-3"/> {emp.times_compromised}
                                        </div>
                                    ) : (
                                        <span className="text-slate-600">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!employees || employees.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-10 text-slate-500">
                                    No hay empleados importados. Sube un CSV para empezar.
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