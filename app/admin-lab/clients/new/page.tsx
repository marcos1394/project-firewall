'use client'

import { useActionState } from 'react'
import { createOrganization } from '@/app/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

const initialState = { message: '', status: '' }

export default function NewClientPage() {
  const [state, formAction, isPending] = useActionState(createOrganization, initialState)

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/admin-lab/clients" className="flex items-center text-slate-400 hover:text-white mb-8 text-sm gap-2">
            <ArrowLeft className="h-4 w-4"/> Volver
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Registrar Nuevo Cliente</h1>
        
        <form action={formAction} className="space-y-6 bg-slate-900/50 p-8 rounded-xl border border-slate-800">
            <div className="space-y-2">
                <Label>Nombre de la Empresa</Label>
                <Input name="name" placeholder="Ej: Tech Solutions Inc." className="bg-slate-950 border-slate-700" required />
            </div>
            
            <div className="space-y-2">
                <Label>Dominio Corporativo (Opcional)</Label>
                <Input name="domain" placeholder="Ej: techsolutions.com" className="bg-slate-950 border-slate-700" />
            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-500">
                {isPending ? 'Guardando...' : <><Save className="h-4 w-4 mr-2"/> Crear Organización</>}
            </Button>
            
            {state?.message && (
                <p className="text-red-400 text-xs text-center">{state.message}</p>
            )}
        </form>
      </div>
    </div>
  )
}