'use client'

import { useState } from 'react'
import { sendSimulation } from '@/actions/campaigns' 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Asegúrate de tener select instalado o usa HTML nativo estilizado
import { Zap, Loader2, CheckCircle2 } from "lucide-react"

export function QuickAttack() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const res = await sendSimulation(formData)
    setResult(res)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase">Vector de Ataque</label>
            <select 
                name="type" 
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
            >
                <option value="google-security">🔓 Google Security Alert</option>
                <option value="hr-payroll">💰 RRHH Nómina (Payroll)</option>
                <option value="urgent-file">⚖️ Legal Urgent Doc</option>
            </select>
        </div>
        <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase">Objetivo (Target Email)</label>
            <Input 
                name="email" 
                type="email" 
                placeholder="victima@empresa.com" 
                required
                className="bg-slate-950 border-slate-800 text-white"
            />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-red-600/90 hover:bg-red-600 text-white font-mono tracking-wider border border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Zap className="h-4 w-4 mr-2"/>}
        {loading ? 'INJECTING PAYLOAD...' : 'DEPLOY SIMULATION'}
      </Button>

      {result && (
        <div className={`p-3 rounded border text-xs font-mono flex items-center gap-2 ${result.status === 'success' ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400' : 'bg-red-950/30 border-red-900 text-red-400'}`}>
            {result.status === 'success' && <CheckCircle2 className="h-4 w-4"/>}
            {result.message}
        </div>
      )}
    </form>
  )
}