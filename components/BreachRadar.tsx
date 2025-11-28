'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scanOrganizationBreaches } from '@/actions/intelligence'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Radar, ShieldAlert, CheckCircle2, Lock, AlertTriangle, Loader2 } from "lucide-react"

export function BreachRadar({ organizationId, leaksCount }: { organizationId: string, leaksCount: number }) {
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleScan = async () => {
    setScanning(true)
    setMessage('Iniciando escaneo de la Dark Web...')
    
    // Llamada a la acción híbrida (Mock o Real)
    const res = await scanOrganizationBreaches(organizationId)
    
    setMessage(res.message)
    setScanning(false)
    router.refresh() // Recarga la página para mostrar los nuevos datos en la tabla
  }

  return (
    <Card className={`border h-full flex flex-col transition-all duration-500 ${leaksCount > 0 ? 'bg-red-950/10 border-red-900/50' : 'bg-slate-900/50 border-slate-800'}`}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
                <Radar className={`h-5 w-5 ${scanning ? 'animate-spin text-red-500' : 'text-indigo-400'}`}/>
                Dark Web Radar
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
                Monitoreo activo de credenciales filtradas.
            </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6">
            
            {/* Visualización del Radar */}
            <div className="relative group">
                {scanning && (
                    <>
                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 border border-red-500/40 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    </>
                )}
                
                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-slate-950 shadow-2xl z-10 relative ${
                    leaksCount > 0 
                    ? 'border-red-500/50 text-red-500 shadow-red-900/20' 
                    : 'border-emerald-500/50 text-emerald-500 shadow-emerald-900/20'
                }`}>
                    {scanning ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin mb-1"/>
                            <span className="text-[10px] font-mono animate-pulse">SCANNING</span>
                        </div>
                    ) : leaksCount > 0 ? (
                        <div className="text-center animate-in zoom-in">
                            <span className="text-4xl font-extrabold">{leaksCount}</span>
                            <p className="text-[10px] uppercase font-bold tracking-wider">Alertas</p>
                        </div>
                    ) : (
                        <CheckCircle2 className="h-12 w-12"/>
                    )}
                </div>
            </div>

            {/* Texto de Estado */}
            <div className="text-center space-y-2 min-h-[60px]">
                {scanning ? (
                    <p className="text-xs text-indigo-300 animate-pulse">{message || 'Analizando bases de datos...'}</p>
                ) : leaksCount > 0 ? (
                    <>
                        <h3 className="text-red-400 font-bold flex items-center justify-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4"/> AMENAZA ACTIVA
                        </h3>
                        <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                            Se encontraron credenciales expuestas. Revise la tabla de evidencia.
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="text-emerald-400 font-bold flex items-center justify-center gap-2 text-sm">
                            <Lock className="h-4 w-4"/> PERÍMETRO SEGURO
                        </h3>
                        <p className="text-xs text-slate-500">No hay hallazgos recientes.</p>
                    </>
                )}
            </div>

            <Button 
                onClick={handleScan} 
                disabled={scanning}
                size="sm"
                className={`w-full font-mono text-xs tracking-wide ${
                    scanning ? 'bg-slate-800 text-slate-400' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                }`}
            >
                {scanning ? 'BUSCANDO...' : 'INICIAR ESCANEO PROFUNDO'}
            </Button>

        </CardContent>
    </Card>
  )
}