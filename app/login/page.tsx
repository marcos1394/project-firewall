import { signIn } from "@/auth"
import { ShieldCheck, Lock } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo (Glow effects) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Header del Login */}
        <div className="text-center mb-10">
            <div className="bg-indigo-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                <ShieldCheck className="h-10 w-10 text-indigo-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Kinetis Security</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
                Plataforma de Defensa Activa.<br/>
                Inicia sesión con tu identidad corporativa.
            </p>
        </div>

        {/* Botones de Proveedores */}
        <div className="space-y-4">
            
            {/* BOTÓN GOOGLE */}
            <form
                action={async () => {
                    "use server"
                    // Redirigimos al admin-lab tras el login exitoso
                    await signIn("google", { redirectTo: "/admin-lab" })
                }}
            >
                <button 
                    type="submit" 
                    className="group w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-200 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span>Continuar con Google Workspace</span>
                </button>
            </form>

            {/* BOTÓN MICROSOFT */}
            <form
                action={async () => {
                    "use server"
                    await signIn("microsoft-entra-id", { redirectTo: "/admin-lab" })
                }}
            >
                <button 
                    type="submit" 
                    className="group w-full flex items-center justify-center gap-3 bg-[#2F2F2F] text-white hover:bg-[#3F3F3F] border border-slate-700 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
                >
                     <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden="true"><path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
                    <span>Continuar con Microsoft 365</span>
                </button>
            </form>
        </div>

        {/* Footer Seguro */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-2">
                <Lock className="h-3 w-3" />
                <span>Conexión segura SSL/TLS de 256 bits</span>
            </div>
            <p className="text-[10px] text-slate-600">
                Al continuar, aceptas los Términos de Servicio y la Política de Privacidad de Kinetis Organization.
            </p>
        </div>

      </div>
    </div>
  )
}