'use client'

import { useState } from 'react'
import { importDirectory } from '@/actions/organization' // Asegúrate de que esta función esté en tu actions.ts (paso anterior)
import { Button } from "@/components/ui/button"
import { UploadCloud, Loader2, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react"

export function DirectoryImporter({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<any>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    // Añadimos el ID oculto al form data
    formData.append('organizationId', organizationId)
    
    const res = await importDirectory(null, formData)
    setResult(res)
    setLoading(false)
    
    // Si éxito, recargamos la página para ver la tabla actualizada
    if (res?.status === 'success') {
        setTimeout(() => window.location.reload(), 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 border-dashed rounded-lg p-6 text-center">
        {!result?.status ? (
            <div className="space-y-4">
                <div className="relative group cursor-pointer inline-block">
                    <input 
                        type="file" 
                        name="csvFile" 
                        accept=".csv"
                        required
                        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Button type="button" variant="outline" className="border-slate-700 text-slate-400 group-hover:text-white group-hover:border-indigo-500">
                        {fileName ? <FileSpreadsheet className="mr-2 h-4 w-4"/> : <UploadCloud className="mr-2 h-4 w-4"/>}
                        {fileName || 'Seleccionar CSV de Empleados'}
                    </Button>
                </div>
                <p className="text-xs text-slate-500">Formato: Columna única de emails o CSV simple.</p>
                
                {fileName && (
                    <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500">
                        {loading ? <Loader2 className="animate-spin h-4 w-4"/> : 'Importar al Directorio'}
                    </Button>
                )}
            </div>
        ) : (
            <div className={`flex flex-col items-center gap-2 ${result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.status === 'success' ? <CheckCircle2 className="h-8 w-8"/> : <AlertTriangle className="h-8 w-8"/>}
                <p className="text-sm font-medium">{result.message}</p>
            </div>
        )}
    </form>
  )
}