import { supabase } from '@/lib/supabase'
import { IntegrationsPanel } from '@/components/IntegrationsPanel'
import { BreachRadar } from '@/components/BreachRadar'
import { LeaksTable } from '@/components/LeaksTable'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, ShieldAlert, Zap, Building2, Lock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

// Forzamos renderizado dinámico para ver actualizaciones en tiempo real
export const dynamic = 'force-dynamic'

// Función de carga de datos
async function getOrgDetails(id: string) {
  // 1. Datos de la Organización
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (!org) return { org: null, employees: [], leaks: [] }

  // 2. Lista de Empleados
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', id)
    .order('created_at', { ascending: false })

  // 3. Lista de Fugas (Leaks)
  // Obtenemos los leaks que coincidan con los IDs de los empleados de esta org
  const employeeIds = employees?.map((e: any) => e.id) || []
  
  let leaks: any[] = []
  
  if (employeeIds.length > 0) {
    const { data } = await supabase
      .from('employee_leaks')
      .select('*, employees(email)') // Join para traer el email
      .in('employee_id', employeeIds)
      .order('detected_at', { ascending: false })
    
    if (data) leaks = data
  }

  return { org, employees, leaks }
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const { org, employees, leaks } = await getOrgDetails(params.id)

  if (!org) {
    return (
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Organización no encontrada</h1>
                <Link href="/admin-lab/clients" className="text-indigo-400 hover:underline">Volver a la lista</Link>
            </div>
        </div>
    )
  }

  // --- CÁLCULO DE MÉTRICAS ---
  const totalEmployees = employees?.length || 0
  const compromisedCount = employees?.filter((e: any) => e.risk_level === 'vulnerable' || e.risk_level === 'critical').length || 0
  const leaksCount = leaks?.length || 0
  
  // Cálculo de Score de Seguridad (Inverso al riesgo)
  // Si risk_score en DB es 0, lo calculamos basado en empleados comprometidos
  const calculatedRisk = totalEmployees > 0 ? Math.round((compromisedCount / totalEmployees) * 100) : 0
  const displayRisk = org.risk_score > 0 ? org.risk_score : calculatedRisk

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      
      {/* --- HEADER SUPERIOR --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <Link href="/admin-lab/clients" className="p-2 hover:bg-slate-800 rounded-full transition-colors group">
                <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white"/>
            </Link>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-slate-500"/>
                    {org.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-slate-400 text-xs font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        ID: {org.id.split('-')[0]}...
                    </p>
                    {org.domain && (
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                            <span className="w-1 h-1 bg-slate-500 rounded-full"></span> {org.domain}
                        </p>
                    )}
                </div>
            </div>
        </div>
        
        {/* Acciones de Nivel Cliente */}
        <div className="flex gap-2">
            <Button variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 gap-2">
                <Zap className="h-4 w-4 text-yellow-500"/> Nueva Campaña
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUMNA IZQUIERDA (Herramientas & Estado) --- */}
        <div className="space-y-6">
            
            {/* 1. TARJETA DE RIESGO */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de Seguridad</CardTitle>
                    {displayRisk > 50 ? <ShieldAlert className="h-4 w-4 text-red-500"/> : <CheckCircle2 className="h-4 w-4 text-emerald-500"/>}
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className={`text-4xl font-extrabold ${displayRisk > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {displayRisk}%
                        </span>
                        <span className="text-sm text-slate-400 font-medium">Exposición</span>
                    </div>
                    
                    {/* Barra de Progreso Custom */}
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                            className={`h-full transition-all duration-1000 ${displayRisk > 50 ? 'bg-red-600' : displayRisk > 20 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${displayRisk}%` }}
                        ></div>
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-4 flex items-start gap-2">
                        <Users className="h-3 w-3 mt-0.5 shrink-0"/>
                        <span>
                            <strong className="text-slate-300">{compromisedCount}</strong> de <strong className="text-slate-300">{totalEmployees}</strong> empleados marcados como vulnerables.
                        </span>
                    </p>
                </CardContent>
            </Card>

            {/* 2. BREACH RADAR (Escáner Dark Web) */}
            <BreachRadar organizationId={org.id} leaksCount={leaksCount} />

            {/* 3. PANEL DE INTEGRACIONES (Sincronización) */}
            <IntegrationsPanel organizationId={org.id} />
            
        </div>

        {/* --- COLUMNA DERECHA (Datos & Directorio) --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. TABLA DE FUGAS (Solo visible si hay leaks) */}
            {leaks && leaks.length > 0 && (
                <LeaksTable leaks={leaks} />
            )}

            {/* 2. DIRECTORIO DE EMPLEADOS */}
            <Card className="bg-slate-900/50 border-slate-800 flex flex-col min-h-[500px]">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Users className="h-5 w-5 text-indigo-400"/>
                            Directorio Activo
                        </CardTitle>
                        <p className="text-xs text-slate-500">Base de datos de empleados monitoreados.</p>
                    </div>
                    <Badge variant="outline" className="text-slate-400 bg-slate-950 border-slate-800">
                        {totalEmployees} Usuarios
                    </Badge>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-auto p-0">
                    <Table>
                        <TableHeader className="bg-slate-950/30">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-500 h-10 text-[10px] uppercase font-bold tracking-wider w-[40%]">Identidad</TableHead>
                                <TableHead className="text-slate-500 h-10 text-[10px] uppercase font-bold tracking-wider">Rol</TableHead>
                                <TableHead className="text-slate-500 h-10 text-[10px] uppercase font-bold tracking-wider text-center">Nivel Riesgo</TableHead>
                                <TableHead className="text-slate-500 h-10 text-[10px] uppercase font-bold tracking-wider text-right">Leaks / Fallos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees?.map((emp: any) => (
                                <TableRow key={emp.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors group">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-200 text-sm group-hover:text-indigo-300 transition-colors">
                                                {emp.first_name || 'Usuario'}
                                            </p>
                                            <p className="font-mono text-slate-500 text-xs">{emp.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-xs">
                                        {emp.position || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {emp.risk_level === 'critical' ? (
                                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] hover:bg-red-500/20">CRÍTICO</Badge>
                                        ) : emp.risk_level === 'vulnerable' ? (
                                            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px] hover:bg-orange-500/20">ALTO</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-800 text-slate-500 border-slate-700 text-[10px] hover:bg-slate-700">NORMAL</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {emp.total_leaks > 0 && (
                                                <div className="flex items-center gap-1 text-red-400 text-xs font-bold" title="Contraseñas filtradas">
                                                    <Lock className="h-3 w-3"/> {emp.total_leaks}
                                                </div>
                                            )}
                                            {emp.times_compromised > 0 && (
                                                <div className="flex items-center gap-1 text-orange-400 text-xs font-bold" title="Clics en Phishing">
                                                    <ShieldAlert className="h-3 w-3"/> {emp.times_compromised}
                                                </div>
                                            )}
                                            {emp.total_leaks === 0 && emp.times_compromised === 0 && (
                                                <span className="text-slate-700 text-xs">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            
                            {(!employees || employees.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-20">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                                            <Users className="h-12 w-12 text-slate-600"/>
                                            <p className="text-slate-400 text-sm">Directorio vacío</p>
                                            <p className="text-xs text-slate-600">Usa el panel izquierdo para añadir empleados.</p>
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
    </div>
  )
}