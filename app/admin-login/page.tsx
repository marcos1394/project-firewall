'use client'

import { useActionState } from 'react' // Usamos el hook moderno de React 19
import { setAdminCookie } from '@/app/actions'
import { ShieldAlert, Lock } from 'lucide-react'

const initialState = {
  error: '',
}

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(setAdminCookie, initialState)

  return (
    <main className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
        
        <div className="flex flex-col items-center mb-8">
            <div className="bg-red-500/10 p-3 rounded-full mb-4">
                <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-widest font-mono">
                KINETIS CLASSIFIED
            </h1>
            <p className="text-slate-500 text-xs mt-2">Acceso restringido nivel 5</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
            <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Master Key" 
                  required
                  className="w-full pl-10 pr-4 py-2 bg-black border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                />
            </div>
            
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Verificando...' : 'Autenticar'}
            </button>
            
            {state?.error && (
                <p className="text-red-400 text-xs text-center font-mono mt-2 bg-red-950/30 py-1 rounded border border-red-900/50">
                    ⚠️ {state.error}
                </p>
            )}
        </form>
      </div>
    </main>
  )
}