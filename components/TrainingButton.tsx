'use client'

import { useState } from 'react'
import { completeTraining } from '@/app/actions'
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { useRouter } from 'next/navigation' // Importante para refrescar o redirigir

export function TrainingButton({ targetId }: { targetId?: string }) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const router = useRouter()

  async function handleComplete() {
    if (!targetId) return // Si es un test sin ID, no hace nada
    
    setLoading(true)
    await completeTraining(targetId)
    setLoading(false)
    setCompleted(true)
    
    // Opcional: Redirigir a una página de "Gracias" o a la web corporativa
    // router.push('https://kinetis.org')
  }

  if (completed) {
    return (
        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-center font-bold flex items-center justify-center gap-2 animate-in fade-in zoom-in">
            <CheckCircle2 className="h-5 w-5"/>
            ¡Capacitación Registrada!
        </div>
    )
  }

  return (
    <Button 
        onClick={handleComplete}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 text-base font-bold"
    >
        {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2"/>
        ) : (
            <CheckCircle2 className="h-4 w-4 mr-2"/>
        )}
        {loading ? 'Registrando...' : 'Confirmar que he leído y entendido'}
    </Button>
  )
}