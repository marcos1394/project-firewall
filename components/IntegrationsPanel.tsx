'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { syncMicrosoftDirectory, addSingleEmployee } from '@/app/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Plus, X } from "lucide-react"

// --- LOGOS SVG (Componentes visuales) ---
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
)

const MicrosoftLogo = () => (
  <svg viewBox="0 0 23 23" className="h-5 w-5 mr-2" aria-hidden="true"><path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
)

// --- COMPONENTE PRINCIPAL ---
export function IntegrationsPanel({ organizationId }: { organizationId: string }) {
  const router = useRouter()
  
  // Estado de carga para saber QUÉ botón está trabajando ('microsoft', 'google', 'manual')
  const [loading, setLoading] = useState<string | null>(null)
  
  // Mensajes de feedback (éxito o error)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Estado para el formulario manual
  const [showManual, setShowManual] = useState(false)
  const [manualEmail, setManualEmail] = useState('')
  const [manualName, setManualName] = useState('')

  // 1. MANEJADOR: MICROSOFT SYNC (Real)
  const handleSyncMicrosoft = async () => {
    setLoading('microsoft')
    setStatusMsg(null)
    
    try {
        const res = await syncMicrosoftDirectory(organizationId)
        
        if (res.status === 'success') {
            setStatusMsg({ type: 'success', text: res.message })
            router.refresh() // Recarga la tabla de empleados
        } else {
            setStatusMsg({ type: 'error', text: res.message })
        }
    } catch (error) {
        setStatusMsg({ type: 'error', text: 'Error de conexión con el servidor.' })
    }
    
    setLoading(null)
  }

  // 2. MANEJADOR: GOOGLE SYNC (Simulado/Futuro)
  const handleSyncGoogle = () => {
    setLoading('google')
    setStatusMsg(null)
    
    // Simulación de delay
    setTimeout(() => {
        setLoading(null)
        setStatusMsg({ type: 'error', text: 'Integración con Google Workspace requiere configuración de Service Account (Próximamente).' })
    }, 1500)
  }

  // 3. MANEJADOR: AÑADIR MANUAL (Fallback)
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading('manual')
    setStatusMsg(null)

    const formData = new FormData()
    formData.append('organizationId', organizationId)
    formData.append('email', manualEmail)
    formData.append('name', manualName)

    const res = await addSingleEmployee(null, formData) // Usamos la acción creada anteriormente

    if (res?.status === 'success') {
        setStatusMsg({ type: 'success', text: 'Empleado añadido correctamente.' })
        setManualEmail('')
        setManualName('')
        setShowManual(false)
        router.refresh()
    } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Error al añadir.' })
    }
    
    setLoading(null)
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
            <CardTitle className="text-sm text-slate-400 uppercase flex items-center gap-2">
                <RefreshCw className="h-4 w-4"/> Sincronización de Directorio
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
                Conecta el proveedor de identidad (IdP) para mantener el directorio actualizado automáticamente.
            </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
            
            {/* OPCIÓN 1: GOOGLE WORKSPACE */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-950/30">
                <div className="flex items-center">
                    <GoogleLogo />
                    <div>
                        <p className="text-sm font-bold text-slate-200">Google Workspace</p>
                        <p className="text-[10px] text-slate-500">API Directory Read</p>
                    </div>
                </div>
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-8 text-xs bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                    onClick={handleSyncGoogle}
                    disabled={!!loading}
                >
                    {loading === 'google' ? <Loader2 className="h-3 w-3 animate-spin"/> : 'Conectar'}
                </Button>
            </div>

            {/* OPCIÓN 2: MICROSOFT 365 */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-950/30">
                <div className="flex items-center">
                    <MicrosoftLogo />
                    <div>
                        <p className="text-sm font-bold text-slate-200">Microsoft Entra ID</p>
                        <p className="text-[10px] text-slate-500">Sync Automático</p>
                    </div>
                </div>
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-8 text-xs bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                    onClick={handleSyncMicrosoft}
                    disabled={!!loading}
                >
                    {loading === 'microsoft' ? <Loader2 className="h-3 w-3 animate-spin"/> : <RefreshCw className="h-3 w-3 mr-2"/>}
                    {loading === 'microsoft' ? 'Sincronizando...' : 'Sincronizar Ahora'}
                </Button>
            </div>

            {/* ÁREA DE MENSAJES DE ESTADO */}
            {statusMsg && (
                <div className={`text-xs p-3 rounded border flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
                    statusMsg.type === 'success' 
                        ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50' 
                        : 'text-red-400 bg-red-950/30 border-red-900/50'
                }`}>
                    {statusMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
                    {statusMsg.text}
                </div>
            )}

            {/* OPCIÓN 3: AÑADIR MANUAL (FALLBACK) */}
            <div className="pt-4 border-t border-slate-800/50">
                {!showManual ? (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 bg-transparent"
                        onClick={() => setShowManual(true)}
                    >
                        <Plus className="h-3 w-3 mr-1"/> Añadir empleado individualmente
                    </Button>
                ) : (
                    <form onSubmit={handleManualAdd} className="space-y-3 bg-slate-900 p-3 rounded border border-slate-800 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-400 font-bold">Registro Manual</span>
                            <button type="button" onClick={() => setShowManual(false)} className="text-slate-500 hover:text-white">
                                <X className="h-3 w-3"/>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <Input 
                                placeholder="Nombre (Ej. Juan Pérez)" 
                                className="h-8 text-xs bg-black border-slate-700"
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                            />
                            <Input 
                                type="email" 
                                placeholder="Email (ej. juan@empresa.com)" 
                                className="h-8 text-xs bg-black border-slate-700"
                                value={manualEmail}
                                onChange={(e) => setManualEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button 
                            type="submit" 
                            size="sm" 
                            className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-500"
                            disabled={loading === 'manual'}
                        >
                            {loading === 'manual' ? <Loader2 className="h-3 w-3 animate-spin"/> : 'Guardar Empleado'}
                        </Button>
                    </form>
                )}
            </div>

        </CardContent>
    </Card>
  )
}