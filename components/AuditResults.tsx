import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion" // Necesitas instalar accordion de shadcn o usar divs simples
import { CheckCircle2, XCircle, AlertOctagon, HelpCircle } from "lucide-react"

// Diccionario de Remediación (Ayuda para arreglarlo)
const REMEDIATION: Record<string, string> = {
    'CIS 1.1.1': 'Ve al portal de Azure AD > Security > Conditional Access. Crea una política que requiera MFA para los roles de Administrador Global.',
    'CIS 1.1.2': 'Habilita "Security Defaults" en Azure AD o crea una política de Acceso Condicional para todos los usuarios.',
    'CIS 1.5': 'Reduce el número de Global Admins. Asigna roles menos privilegiados como "Exchange Administrator" o "User Administrator" a quienes no necesiten control total.'
}

export function AuditResults({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) return null

  // Calcular Score promedio
  const totalScore = logs.reduce((acc, log) => acc + (log.score || 0), 0)
  const averageCompliance = Math.round(totalScore / logs.length)

  return (
    <div className="space-y-6 mt-6">
        
        {/* Scorecard General */}
        <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="relative h-16 w-16 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    {/* Progress Circle */}
                    <path 
                        className={averageCompliance < 50 ? "text-red-500" : averageCompliance < 80 ? "text-yellow-500" : "text-emerald-500"} 
                        strokeDasharray={`${averageCompliance}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                    />
                </svg>
                <span className="absolute text-sm font-bold text-white">{averageCompliance}%</span>
            </div>
            <div>
                <h3 className="text-white font-bold">Nivel de Cumplimiento CIS</h3>
                <p className="text-xs text-slate-400">Basado en {logs.length} controles auditados.</p>
            </div>
        </div>

        {/* Lista de Controles */}
        <div className="space-y-3">
            {logs.map((log) => (
                <Card key={log.id} className="bg-slate-900/30 border-slate-800 overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
                        <div className="flex items-center gap-3">
                            {log.status === 'PASS' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500"/>
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500"/>
                            )}
                            <div>
                                <p className="text-sm font-bold text-slate-200">{log.control_id}: {log.control_name}</p>
                                <p className="text-xs text-slate-500">Auditado: {new Date(log.scanned_at).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={log.status === 'PASS' ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400"}>
                            {log.status}
                        </Badge>
                    </div>
                    
                    {/* Detalles del Fallo (Solo si falló) */}
                    {log.status === 'FAIL' && (
                        <div className="p-4 bg-red-950/10 text-xs">
                            <p className="text-red-300 font-bold mb-2 flex items-center gap-2">
                                <AlertOctagon className="h-3 w-3"/> Hallazgos:
                            </p>
                            
                            {/* Renderizado condicional de detalles JSON */}
                            {log.details?.failed_users && (
                                <div className="mb-3">
                                    <p className="text-slate-400 mb-1">Usuarios sin MFA:</p>
                                    <ul className="list-disc list-inside text-slate-300 font-mono">
                                        {log.details.failed_users.map((u: string) => (
                                            <li key={u}>{u}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {log.details?.admin_count && (
                                <p className="text-slate-300">
                                    Se detectaron <strong className="text-white">{log.details.admin_count}</strong> Administradores Globales. El límite recomendado es 4.
                                </p>
                            )}

                            {/* Guía de Remediación */}
                            <div className="mt-4 pt-4 border-t border-red-900/20">
                                <p className="text-slate-400 flex items-center gap-1 mb-1">
                                    <HelpCircle className="h-3 w-3"/> Cómo solucionar:
                                </p>
                                <p className="text-slate-300 italic">
                                    {REMEDIATION[log.control_id] || "Consulte la guía oficial de Microsoft."}
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    </div>
  )
}