'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { runCloudAudit } from '@/actions/auditor' // Asegúrate de tener la acción aquí
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Loader2, Play, AlertTriangle } from "lucide-react"

export function CISAuditor({ organizationId, lastScan }: { organizationId: string, lastScan?: string }) {
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAudit = async () => {
    setScanning(true)
    setMessage('Conectando con Microsoft Graph API...')
    
    // Llamada al motor de auditoría
    const res = await runCloudAudit(organizationId)
    
    setMessage(res.message)
    setScanning(false)
    
    if (res.status === 'success') {
        router.refresh() // Refresca la página para mostrar los resultados nuevos
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-indigo-400"/>
                Auditor CIS Benchmark
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
                Verifica la configuración de Microsoft 365 contra estándares internacionales.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs text-slate-500 bg-slate-950 p-2 rounded border border-slate-800">
                    <span>Último escaneo:</span>
                    <span className="font-mono text-slate-300">
                        {lastScan ? new Date(lastScan).toLocaleString() : 'Nunca'}
                    </span>
                </div>

                <Button 
                    onClick={handleAudit} 
                    disabled={scanning}
                    className={`w-full ${scanning ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-bold`}
                >
                    {scanning ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2"/> Auditando...
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4 mr-2 fill-current"/> Ejecutar Auditoría Nivel 1
                        </>
                    )}
                </Button>
                
                {message && (
                    <p className="text-[10px] text-center text-slate-400 animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </CardContent>
    </Card>
  )
}