'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, Mail } from "lucide-react"

// Cliente cliente-side (solo lectura pública por ahora o con auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function TemplateGallery({ onSelect }: { onSelect: (slug: string) => void }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('email_templates').select('*')
      if (data) setTemplates(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleSelect = (slug: string) => {
    setSelected(slug)
    onSelect(slug)
  }

  if (loading) return <div className="flex gap-2 text-slate-500 text-sm"><Loader2 className="animate-spin h-4 w-4"/> Cargando arsenal...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
      {templates.map((t) => (
        <div 
            key={t.id}
            onClick={() => handleSelect(t.slug)}
            className={`p-4 rounded-lg border cursor-pointer transition-all relative group ${selected === t.slug ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
        >
            {selected === t.slug && (
                <div className="absolute top-2 right-2 text-indigo-400">
                    <CheckCircle2 className="h-5 w-5"/>
                </div>
            )}
            
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] uppercase text-slate-400 border-slate-700">
                    {t.category}
                </Badge>
                {t.difficulty_level === 'hard' && <Badge className="bg-red-500/10 text-red-400 text-[10px]">Difícil</Badge>}
            </div>

            <h4 className="font-bold text-slate-200 text-sm mb-1 flex items-center gap-2">
                <Mail className="h-3 w-3 text-slate-500"/> {t.name}
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2 italic">
                "{t.subject}"
            </p>
        </div>
      ))}
      
      {/* Botón Fake para futuro */}
      <div className="border border-dashed border-slate-800 rounded-lg p-4 flex items-center justify-center text-slate-600 text-xs hover:bg-slate-900/50 cursor-not-allowed">
        + Crear nueva plantilla (Próximamente)
      </div>
    </div>
  )
}