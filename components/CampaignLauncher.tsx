'use client'

import { useState } from 'react'
import { launchCampaign } from '@/app/actions' // La acción nueva
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UploadCloud, FileSpreadsheet } from "lucide-react"
import { TemplateGallery } from './TemplateGallery'

export function CampaignLauncher() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<any>(null)
  const [fileName, setFileName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    
    const formData = new FormData(event.currentTarget)
    const res = await launchCampaign(null, formData)
    
    setMessage(res)
    setLoading(false)
  }
  // selectedTemplate and setSelectedTemplate are managed by useState above

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Nombre y Tipo */}
      <div className="grid gap-4">
        <div className="space-y-2">
            <Label className="text-slate-400">Nombre de la Operación</Label>
            <Input 
                name="campaignName" 
                placeholder="Ej: Auditoría Q4 - Finanzas" 
                required
                className="bg-slate-950 border-slate-800 text-white"
            />
        </div>
        
        <div className="space-y-3">
    <Label className="text-slate-400">Seleccionar Vector de Ataque</Label>
    <TemplateGallery onSelect={(slug) => setSelectedTemplate(slug)} />
    {/* Input oculto vital para que funcione el form action */}
    <input type="hidden" name="templateType" value={selectedTemplate} required />
</div>
      </div>

      {/* 2. Carga de Archivo (Drag & Drop visual) */}
      <div className="space-y-2">
        <Label className="text-slate-400">Objetivos (Lista CSV)</Label>
        <div className="relative group cursor-pointer">
            <input 
                type="file" 
                name="csvFile" 
                accept=".csv"
                required
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-900/50 group-hover:bg-slate-800/50 group-hover:border-indigo-500 transition-all">
                {fileName ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                        <FileSpreadsheet className="h-6 w-6"/>
                        <span className="font-mono text-sm">{fileName}</span>
                    </div>
                ) : (
                    <>
                        <UploadCloud className="h-8 w-8 text-slate-500 mb-2 group-hover:text-indigo-400"/>
                        <p className="text-sm text-slate-400 font-medium">Arrastra tu CSV aquí</p>
                        <p className="text-xs text-slate-600">Formato: solo una columna con emails</p>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* 3. Botón de Lanzamiento */}
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide transition-all"
      >
        {loading ? (
            <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin"/> INICIALIZANDO CAMPAÑA...
            </span>
        ) : (
            'LANZAR ATAQUE MASIVO'
        )}
      </Button>

      {/* Feedback */}
      {message && (
        <div className={`p-4 rounded-md text-sm font-medium border ${message.status === 'success' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' : 'bg-red-950/50 border-red-900 text-red-400'}`}>
            {message.message}
        </div>
      )}
    </form>
  )
}