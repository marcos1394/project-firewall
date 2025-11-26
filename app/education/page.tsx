import Link from "next/link"
import { TrainingButton } from "@/components/TrainingButton"
import { 
  AlertTriangle, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Globe, 
  Clock,
  AlertOctagon
} from "lucide-react"

// ==========================================
// DICCIONARIO DE LECCIONES (EDUCATIONAL CONTENT)
// ==========================================
// Aquí definimos qué mostrar según el 'slug' del ataque
const LESSONS: Record<string, any> = {
  'google-security': {
    title: "Suplantación de Marca (Brand Spoofing)",
    emailSubject: "Alerta de Seguridad: Nuevo inicio de sesión",
    senderName: "Soporte IT",
    senderEmail: "security@kinetis.org", // El dominio real desde donde salió
    context: "Los atacantes usan logos y formatos idénticos a los de Google/Microsoft para generar pánico.",
    redFlags: [
      { 
        id: 1, 
        title: "Remitente Incongruente",
        text: "El correo dice ser de 'Google', pero el dominio es @kinetis.org. Google siempre te escribirá desde @google.com.", 
        top: "14%", left: "38%" 
      },
      { 
        id: 2, 
        title: "Urgencia Fabricada",
        text: "Frases como 'Bloquear acceso inmediatamente' buscan que actúes sin pensar. Un servicio real no te amenaza.", 
        top: "65%", left: "50%" 
      },
    ]
  },
  'hr-payroll': {
    title: "Ingeniería Social (Curiosidad Financiera)",
    emailSubject: "ACCIÓN REQUERIDA: Ajuste en esquema de nómina",
    senderName: "Recursos Humanos",
    senderEmail: "security@kinetis.org",
    context: "Este ataque apela a tu miedo a perder dinero o curiosidad por ganar más. Es el vector más efectivo en empresas.",
    redFlags: [
      { 
        id: 1, 
        title: "Archivos Peligrosos",
        text: "Nunca descargues PDFs o Excel de nómina que no solicitaste. Suelen contener scripts (macros) maliciosos.", 
        top: "72%", left: "25%" 
      },
      { 
        id: 2, 
        title: "Canal Incorrecto",
        text: "¿RRHH suele enviar estos avisos por email masivo? Verifica siempre por Teams/Slack antes de abrir.", 
        top: "35%", left: "60%" 
      },
    ]
  },
  'urgent-file': {
    title: "Fraude del CEO (Authority Bias)",
    emailSubject: "URGENTE: Contrato pendiente",
    senderName: "Legal",
    senderEmail: "security@kinetis.org",
    context: "Los hackers se hacen pasar por directivos o departamentos legales para obligarte a saltar protocolos de seguridad.",
    redFlags: [
      { 
        id: 1, 
        title: "Presión de Tiempo",
        text: "El uso de 'URGENTE' y plazos cortos (antes de las 2PM) es la señal #1 de manipulación psicológica.", 
        top: "45%", left: "50%" 
      },
    ]
  },
  'generic': {
    title: "Phishing Genérico",
    emailSubject: "Notificación de Cuenta",
    senderName: "Admin",
    senderEmail: "info@internet.com",
    context: "Un intento estándar de robo de credenciales.",
    redFlags: [
        { id: 1, title: "Link Sospechoso", text: "El enlace no lleva al sitio oficial.", top: "50%", left: "50%" }
    ]
  }
}

// ==========================================
// COMPONENTE DE PÁGINA
// ==========================================
export default function EducationPage({ searchParams }: { searchParams: { t?: string, uid?: string } }) {
  // 1. Recuperar parámetros de la URL
  const templateSlug = searchParams.t || 'generic'
  const targetId = searchParams.uid // ID de la víctima para marcar como entrenado
  
  // 2. Cargar lección correspondiente
  const lesson = LESSONS[templateSlug] || LESSONS['generic']

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-50 flex flex-col items-center py-12 px-6 font-sans selection:bg-red-500/30">
      
      {/* --- HEADER DE ALERTA --- */}
      <div className="max-w-5xl w-full text-center space-y-6 mb-16 animate-in slide-in-from-top-10 duration-700">
        <div className="inline-flex items-center gap-3 bg-red-500/10 text-red-500 px-5 py-2 rounded-full border border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]">
            <AlertOctagon className="h-5 w-5 animate-pulse" />
            <span className="font-mono font-bold uppercase tracking-widest text-sm">Simulacro de Seguridad Activo</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Has sido <span className="text-red-500 underline decoration-red-900 underline-offset-8">comprometido.</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Acabas de entregar tus credenciales en una simulación controlada por <strong>Kinetis</strong>. 
            Si esto fuera real, los atacantes tendrían acceso a tu equipo ahora mismo.
        </p>
      </div>

      <div className="max-w-7xl w-full grid lg:grid-cols-12 gap-12 items-start">
        
        {/* --- COLUMNA IZQUIERDA (7 cols): AUTOPSIA DEL CORREO --- */}
        <div className="lg:col-span-7 relative group perspective-1000">
            {/* Efecto de fondo brillante */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl text-slate-900 border border-slate-200">
                {/* Barra de título simulada */}
                <div className="bg-slate-100 border-b p-4 flex items-center justify-between select-none">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500"></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <Lock className="h-3 w-3"/> Mensaje Sospechoso
                    </div>
                </div>
                
                {/* Cuerpo del Correo Reconstruido */}
                <div className="p-8 min-h-[500px] relative">
                    <h3 className="text-2xl font-bold mb-1 tracking-tight">{lesson.emailSubject}</h3>
                    
                    {/* Remitente simulado */}
                    <div className="flex items-start gap-4 mb-8 mt-4 border-b border-slate-100 pb-6">
                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                            {lesson.senderName[0]}
                        </div>
                        <div>
                            <p className="font-bold text-base text-slate-900">
                                {lesson.senderName} <span className="font-normal text-slate-500 text-sm">&lt;{lesson.senderEmail}&gt;</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Para: mi-correo@empresa.com</p>
                        </div>
                    </div>
                    
                    {/* Contenido Simulado (Blur Effect) */}
                    <div className="space-y-6 opacity-60 select-none filter blur-[1px] hover:blur-0 transition-all duration-500 cursor-not-allowed">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        
                        <div className="py-8 flex justify-center">
                            <div className="bg-blue-600 text-white px-8 py-3 rounded font-bold opacity-50 shadow-md">
                                ACCIÓN REQUERIDA (LINK TRAMPA)
                            </div>
                        </div>

                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>

                    {/* --- HOTSPOTS (BANDERAS ROJAS) --- */}
                    {lesson.redFlags.map((flag: any) => (
                        <div 
                            key={flag.id}
                            className="absolute z-10 group/spot"
                            style={{ top: flag.top, left: flag.left }}
                        >
                            {/* El punto pulsante */}
                            <div className="relative cursor-help">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold border-2 border-white shadow-lg">
                                    {flag.id}
                                </span>
                            </div>

                            {/* Tooltip flotante al hacer hover */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-48 opacity-0 group-hover/spot:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover/spot:translate-y-0">
                                <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                                    <p className="font-bold mb-1 text-red-400">{flag.title}</p>
                                    {flag.text}
                                    {/* Flechita del tooltip */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-4 font-mono">
                * Reconstrucción forense del correo original
            </p>
        </div>

        {/* --- COLUMNA DERECHA (5 cols): LA LECCIÓN Y CTA --- */}
        <div className="lg:col-span-5 space-y-8 flex flex-col h-full justify-center">
            
            {/* Tarjeta de Análisis */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500 h-6 w-6"/>
                    Anatomía del Ataque
                </h2>
                <p className="text-sm text-slate-400 mb-8 border-l-2 border-indigo-500 pl-4 italic">
                    {lesson.context}
                </p>
                
                <div className="space-y-6">
                    {lesson.redFlags.map((flag: any) => (
                        <div key={flag.id} className="flex gap-4 p-4 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm border border-red-500/20">
                                {flag.id}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-200 text-sm mb-1">{flag.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {flag.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tarjeta de Acción (Remediation) */}
            <div className="bg-indigo-950/30 border border-indigo-500/30 p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Globe className="h-24 w-24 text-indigo-500"/>
                </div>
                
                <h3 className="font-bold text-indigo-300 mb-2 text-lg">Certifica tu Aprendizaje</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Este incidente ha quedado registrado. Para mitigar el riesgo en tu perfil de empleado, confirma que has entendido los puntos anteriores.
                </p>
                
                {/* AQUÍ ESTÁ EL BOTÓN QUE CIERRA EL CICLO */}
                <TrainingButton targetId={targetId} />

                {!targetId && (
                     <div className="mt-4 flex items-center justify-center gap-2 text-xs text-yellow-500/80 bg-yellow-500/10 py-2 rounded">
                        <Clock className="h-3 w-3"/>
                        Modo Vista Previa (No se guardará el progreso)
                     </div>
                )}
            </div>
            
            <div className="text-center">
                <Link href="/" className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-white transition-colors">
                    Desarrollado por Kinetis Security <ArrowRight className="ml-1 h-3 w-3"/>
                </Link>
            </div>
        </div>

      </div>
    </main>
  )
}