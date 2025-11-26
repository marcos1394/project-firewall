import { AlertTriangle, CheckCircle, Shield } from "lucide-react"

export default function EducationPage() {
  return (
    <main className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 text-white">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
        
        <div className="mx-auto bg-orange-500/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-orange-500" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Esto fue un simulacro de seguridad.
        </h1>
        
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          Acabas de hacer clic en un enlace de prueba enviado por <strong>Kinetis Security</strong>. 
          Si esto hubiera sido un ataque real, los hackers tendrían acceso a tu contraseña ahora mismo.
        </p>

        <div className="bg-slate-950 rounded-xl p-6 text-left border border-slate-800 mb-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500"/> Cómo detectar este ataque la próxima vez:
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0"/>
                    <span><strong>Revisa el remitente:</strong> El correo decía venir de "Soporte", pero la dirección era extraña.</span>
                </li>
                <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0"/>
                    <span><strong>Sentido de Urgencia:</strong> Los hackers siempre te piden actuar "YA" o "Perderás tu cuenta".</span>
                </li>
            </ul>
        </div>

        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-lg transition-colors w-full md:w-auto">
            Entendido, completé mi lección
        </button>
      </div>
    </main>
  )
}