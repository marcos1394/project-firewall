'use client'

import { SetStateAction, useActionState, useState } from 'react' // Next.js 15/16 hook
import { createTemplate } from '@/actions/campaigns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Eye, Code } from "lucide-react"
import Link from "next/link"

const initialState = {
  message: '',
  status: '',
}

export default function NewTemplatePage() {
  const [state, formAction, isPending] = useActionState(createTemplate, initialState)
  
  // Estado local para la vista previa en tiempo real
  const [html, setHtml] = useState('<div style="padding: 20px; font-family: sans-serif;">\n  <h1>Hola!</h1>\n  <p>Este es un mensaje de prueba.</p>\n  <a href="{{link}}">Clic aquí</a>\n</div>')
  const [subject, setSubject] = useState('Asunto del Correo')
  const [fromName, setFromName] = useState('Soporte')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('general')

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6 md:p-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin-lab" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-400"/>
        </Link>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Constructor de Plantillas</h1>
            <p className="text-slate-400 text-sm">Diseñador de vectores de ataque.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-150px)]">
        
        {/* COLUMNA IZQUIERDA: EDITOR */}
        <Card className="bg-slate-900/50 border-slate-800 flex flex-col h-full overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Code className="h-4 w-4"/> Configuración del Payload
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Nombre Interno</Label>
                        <Input 
                            name="name" 
                            placeholder="Ej: Netflix Suspensión" 
                            className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Remitente (Nombre)</Label>
                            <Input 
                                name="fromName" 
                                placeholder="Netflix Support" 
                                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500" 
                                required 
                                value={fromName}
                                onChange={(e) => setFromName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <select 
                                name="category" 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="general" className="bg-slate-950 text-white">General</option>
                                <option value="financial" className="bg-slate-950 text-white">Financiero</option>
                                <option value="urgency" className="bg-slate-950 text-white">Urgencia</option>
                                <option value="authority" className="bg-slate-950 text-white">Autoridad (CEO/Legal)</option>
                                <option value="service" className="bg-slate-950 text-white">Servicios (Netflix/Amazon)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Asunto del Correo</Label>
                        <Input 
                            name="subject" 
                            placeholder="Tu cuenta ha sido suspendida" 
                            className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500" 
                            required 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <Label className="flex justify-between">
                            <span>Código HTML</span>
                            <span className="text-xs text-slate-500 font-mono">Usa {'{{link}'} para el botón trampa</span>
                        </Label>
                        <Textarea 
                            name="htmlContent" 
                            className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs flex-1 min-h-[300px]" 
                            value={html}
                            onChange={(e: { target: { value: SetStateAction<string> } }) => setHtml(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-500">
                            {isPending ? 'Guardando...' : <><Save className="h-4 w-4 mr-2"/> Guardar Plantilla</>}
                        </Button>
                        {state?.message && (
                            <p className={`text-xs mt-2 text-center ${state.status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                                {state.message}
                            </p>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>

        {/* COLUMNA DERECHA: PREVIEW */}
        <Card className="bg-white text-slate-900 border-slate-800 h-full overflow-hidden flex flex-col">
            <div className="bg-slate-100 border-b p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-4 flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-500 shadow-sm flex justify-between">
                    <span>{subject}</span>
                    <span className="text-slate-400">Ahora</span>
                </div>
            </div>
            
            <div className="border-b px-4 py-3 bg-white">
                <h3 className="font-bold text-lg leading-tight">{subject || '(Sin Asunto)'}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {fromName[0] || 'S'}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900">
                            {fromName || 'Remitente'} <span className="text-slate-400 font-normal">&lt;security@kinetis.org&gt;</span>
                        </p>
                        <p className="text-[10px] text-slate-400">Para: victima@empresa.com</p>
                    </div>
                </div>
            </div>

            <CardContent className="flex-1 overflow-y-auto p-0 bg-white">
                {/* Renderizado Seguro del HTML */}
                <iframe 
                    srcDoc={html.replace('{{link}}', '#')} 
                    className="w-full h-full border-none"
                    sandbox="allow-same-origin" 
                />
            </CardContent>
            
            <div className="bg-slate-50 p-2 text-[10px] text-center text-slate-400 border-t">
                Vista previa aproximada. El renderizado final depende del cliente de correo (Outlook, Gmail).
            </div>
        </Card>

      </div>
    </div>
  )
}