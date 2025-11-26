import { AlertTriangle, Search, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

// Diccionario de lecciones según el ataque
const LESSONS: Record<string, any> = {
  'google-security': {
    title: "Suplantación de Identidad (Spoofing)",
    emailSubject: "Alerta de Seguridad: Nuevo inicio de sesión",
    sender: "Soporte IT <security@kinetis.org>",
    redFlags: [
      { id: 1, text: "Remitente externo: El dominio @kinetis.org no es @google.com", top: "15%", left: "40%" },
      { id: 2, text: "Urgencia Falsa: Los hackers usan miedo para que no pienses.", top: "60%", left: "50%" },
    ]
  },
  'hr-payroll': {
    title: "Ingeniería Social (Codicia/Curiosidad)",
    emailSubject: "ACCIÓN REQUERIDA: Ajuste en esquema de nómina",
    sender: "Recursos Humanos <security@kinetis.org>",
    redFlags: [
      { id: 1, text: "Archivos adjuntos o Links: Nunca abras PDFs de nómina no solicitados.", top: "70%", left: "30%" },
      { id: 2, text: "Contexto General: ¿Es normal que te escriban esto por email?", top: "30%", left: "50%" },
    ]
  },
  'urgent-file': {
    title: "Ataque de Autoridad (CEO Fraud)",
    emailSubject: "URGENTE: Contrato pendiente",
    sender: "Legal <security@kinetis.org>",
    redFlags: [
      { id: 1, text: "Presión de Tiempo: 'Antes de las 2PM' es una señal clásica.", top: "40%", left: "20%" },
    ]
  },
  'generic': {
    title: "Ataque de Phishing Genérico",
    emailSubject: "Aviso Importante",
    sender: "Admin",
    redFlags: []
  }
}

export default function EducationPage({ searchParams }: { searchParams: { t?: string } }) {
  const type = searchParams.t || 'generic'
  const lesson = LESSONS[type] || LESSONS['generic']

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center py-12 px-4">
      
      {/* Header de Alerta */}
      <div className="max-w-4xl w-full text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full border border-red-500/20 animate-pulse">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-mono font-bold uppercase tracking-widest">Simulacro de Seguridad</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mt-4">
            Has sido <span className="text-red-500">comprometido.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Acabas de entregar tus credenciales en una simulación controlada. 
            A continuación, te mostramos las <strong>banderas rojas</strong> que pasaste por alto.
        </p>
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-start">
        
        {/* COLUMNA IZQUIERDA: La Autopsia del Correo */}
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-20"></div>
            <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl text-slate-900">
                {/* Header Simulado de Email Client */}
                <div className="bg-slate-100 border-b p-4 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">Correo Recibido: Hace 2 min</div>
                </div>
                
                {/* Cuerpo del Correo Reconstruido */}
                <div className="p-8 min-h-[400px]">
                    <h3 className="text-xl font-bold mb-2">{lesson.emailSubject}</h3>
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                            {lesson.sender[0]}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{lesson.sender.split('<')[0]}</p>
                            <p className="text-xs text-slate-500">{lesson.sender}</p>
                        </div>
                    </div>
                    
                    {/* Contenido Simulado (Placeholder visual) */}
                    <div className="space-y-4 opacity-70 blur-[1px] select-none hover:blur-0 transition-all duration-500">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-12 bg-blue-600 rounded-md w-1/2 mx-auto mt-8 flex items-center justify-center text-white font-bold opacity-50">
                            CLICK AQUÍ (TRAMPA)
                        </div>
                    </div>

                    {/* OVERLAYS (Las pistas) */}
                    {lesson.redFlags.map((flag: any) => (
                        <div 
                            key={flag.id}
                            className="absolute bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg cursor-help animate-bounce"
                            style={{ top: flag.top, left: flag.left }}
                        >
                            <Search className="h-3 w-3 inline mr-1"/>
                            PISTA #{flag.id}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: La Lección */}
        <div className="space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500"/>
                    Anatomía del Ataque
                </h2>
                
                <div className="space-y-6">
                    {lesson.redFlags.map((flag: any) => (
                        <div key={flag.id} className="flex gap-4">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-sm border border-red-500/30">
                                {flag.id}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-200">Bandera Roja #{flag.id}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed mt-1">
                                    {flag.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl">
                <h3 className="font-bold text-indigo-300 mb-2">¿Qué debo hacer ahora?</h3>
                <p className="text-slate-400 text-sm mb-4">
                    Este evento ha sido registrado en tu historial de capacitación. No necesitas cambiar tu contraseña real, ya que esto fue una simulación.
                </p>
                <Link href="/" className="inline-flex items-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg transition-colors w-full justify-center">
                    Volver al Dashboard de Seguridad <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </div>
        </div>

      </div>
    </main>
  )
}