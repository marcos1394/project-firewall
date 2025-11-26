'use client'

import { useState } from 'react'
import { sendSimulation } from '@/app/actions' // Crearemos esta acción en el paso 5
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminLab() {
  const [status, setStatus] = useState('')

  async function handleAttack(formData: FormData) {
    setStatus('Enviando ataque...')
    const result = await sendSimulation(formData)
    setStatus(result.message)
  }

  return (
    <div className="min-h-screen bg-black text-white p-20 flex flex-col items-center">
      <h1 className="text-3xl font-mono text-red-500 mb-8">💀 KINETIS ATTACK LAB</h1>
      
      <form action={handleAttack} className="w-full max-w-md space-y-4 border border-red-900 p-8 rounded bg-red-950/10">
        <label className="text-sm font-mono text-red-300">Target Email (Víctima):</label>
        <Input 
            name="email" 
            type="email" 
            placeholder="victima@empresa.com" 
            className="bg-black border-red-800 text-white" 
            required
        />
        
        <label className="text-sm font-mono text-red-300">Tipo de Ataque:</label>
        <select name="type" className="w-full bg-black border border-red-800 rounded p-2 text-sm text-white">
            <option value="password-reset">Google Password Reset</option>
            {/* Futuro: agregar más plantillas */}
        </select>

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-mono">
           LANZAR SIMULACIÓN
        </Button>
      </form>
      
      {status && <p className="mt-8 font-mono text-yellow-400">{status}</p>}
    </div>
  )
}