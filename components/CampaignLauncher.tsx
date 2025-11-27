'use client'

import { useEffect, useState } from 'react'
import { launchCampaign } from '@/app/actions'
import { createClient } from '@supabase/supabase-js'
import { TemplateGallery } from './TemplateGallery'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UploadCloud, FileSpreadsheet, Building2, Users } from "lucide-react"

// Cliente cliente-side para cargar organizaciones
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function CampaignLauncher() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<any>(null)
  
  // Estados de Formulario
  const [targetMode, setTargetMode] = useState<'csv' | 'directory'>('csv')
  const [fileName, setFileName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [orgs, setOrgs] = useState<any[]>([])

  // Cargar organizaciones al montar
  useEffect(() => {
    async function loadOrgs() {
      const { data } = await supabase.from('organizations').select('id, name, employees(count)')
      if (data) setOrgs(data)
    }
    loadOrgs()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedTemplate) {
        setMessage({ message: 'Selecciona una plantilla de ataque', status: 'error' })
        return
    }
    
    setLoading(true)
    setMessage(null)
    
    const formData = new FormData(event.currentTarget)
    // Forzamos el template seleccionado si no lo agarró el input hidden
    formData.set('templateType', selectedTemplate)
    
    const res = await launchCampaign(null, formData)
    
    setMessage(res)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Datos Básicos */}
      <div className="space-y-2">
        <Label className="text-slate-400">Nombre de la Operación</Label>
        <Input 
            name="campaignName" 
            placeholder="Ej: Auditoría Q1 - Phishing Test" 
            required
            className="bg-slate-950 border-slate-800 text-white"
        />
      </div>

      {/* 2. Selección de Objetivo (Tabs) */}
      <div className="space-y-3">
        <Label className="text-slate-400">Seleccionar Objetivos</Label>
        
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
                type="button"
                onClick={() => setTargetMode('csv')}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-all flex items-center justify-center gap-2 ${targetMode === 'csv' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <UploadCloud className="h-3 w-3"/> Carga Manual (CSV)
            </button>
            <button
                type="button"
                onClick={() => setTargetMode('directory')}
                className={`flex-1 text-xs font-medium py-2 rounded-md transition-all flex items-center justify-center gap-2 ${targetMode === 'directory' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Building2 className="h-3 w-3"/> Directorio de Cliente
            </button>
        </div>
        
        {/* Input Oculto para decirle al backend el modo */}
        <input type="hidden" name="targetMode" value={targetMode} />

        {/* CONTENIDO SEGÚN MODO */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 min-h-[100px] flex flex-col justify-center">
            
            {targetMode === 'csv' ? (
                // MODO CSV
                <div className="relative group cursor-pointer text-center">
                    <input 
                        type="file" 
                        name="csvFile" 
                        accept=".csv"
                        required={targetMode === 'csv'}
                        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {fileName ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                            <FileSpreadsheet className="h-5 w-5"/>
                            <span className="font-mono text-sm">{fileName}</span>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm">
                            <p className="font-medium group-hover:text-white transition-colors">Click para subir CSV</p>
                            <p className="text-xs mt-1">Lista simple de correos</p>
                        </div>
                    )}
                </div>
            ) : (
                // MODO DIRECTORIO
                <div className="space-y-2">
                    {orgs.length === 0 ? (
                        <p className="text-xs text-center text-slate-500">No hay organizaciones registradas.</p>
                    ) : (
                        <select 
                            name="organizationId" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                            required={targetMode === 'directory'}
                        >
                            <option value="">-- Seleccionar Cliente --</option>
                            {orgs.map(org => (
                                <option key={org.id} value={org.id}>
                                    {org.name} ({org.employees[0].count} empleados)
                                </option>
                            ))}
                        </select>
                    )}
                    <p className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
                        <Users className="h-3 w-3"/> Se enviará a todos los empleados registrados
                    </p>
                </div>
            )}
        </div>
      </div>

      {/* 3. Selección de Arma */}
      <div className="space-y-3">
        <Label className="text-slate-400">Vector de Ataque</Label>
        <TemplateGallery onSelect={(slug) => setSelectedTemplate(slug)} />
        <input type="hidden" name="templateType" value={selectedTemplate} />
      </div>

      {/* Botón Final */}
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-bold tracking-wide transition-all shadow-lg shadow-red-900/20"
      >
        {loading ? (
            <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin"/> INICIALIZANDO ATAQUE...
            </span>
        ) : (
            'EJECUTAR OPERACIÓN'
        )}
      </Button>

      {message && (
        <div className={`p-4 rounded-md text-sm font-medium border text-center animate-in slide-in-from-bottom-2 ${message.status === 'success' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' : 'bg-red-950/50 border-red-900 text-red-400'}`}>
            {message.message}
        </div>
      )}
    </form>
  )
}