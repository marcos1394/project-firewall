'use client'

import { useActionState } from 'react' // NUEVO: Importación correcta para React 19
import { submitLead } from '@/actions/leads'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

const initialState = {
  message: '',
  status: '',
}

export default function LeadForm() {
  // NUEVO: useActionState devuelve [estado, accion, pendiente]
  const [state, formAction, isPending] = useActionState(submitLead, initialState)

  return (
    <div className="w-full max-w-sm space-y-4">
      <form action={formAction} className="flex flex-col sm:flex-row gap-2">
        <Input 
          type="email" 
          name="email" 
          placeholder="nombre@empresa.com" 
          required 
          disabled={isPending} // Bloqueamos input mientras carga
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
        
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-white text-slate-900 hover:bg-slate-200 font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Solicitar Acceso'
          )}
        </Button>
      </form>
      
      {/* Mensajes de feedback */}
      <div aria-live="polite" className="text-sm font-medium h-6">
        {state?.status === 'success' && (
          <p className="text-emerald-400">✨ {state.message}</p>
        )}
        {state?.status === 'error' && (
          <p className="text-red-400">⚠️ {state.message}</p>
        )}
      </div>
    </div>
  )
}