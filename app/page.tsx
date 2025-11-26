import LeadForm from "@/components/LeadForm"
import { ShieldCheck, Zap, Lock, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500/30">
      
      {/* Navbar Simple */}
      <header className="border-b border-slate-900/50 backdrop-blur-sm fixed w-full z-10 top-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <ShieldCheck className="text-emerald-500" />
            <span>PhishGuard AI</span>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">v1.0 Early Access</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-sm text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Cupos limitados para Beta Tester
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            Tu equipo es tu mayor <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              vulnerabilidad.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Reducimos el riesgo de hackeo en un 90% entrenando a tus empleados 
            con simulaciones de phishing generadas por IA que aprenden de sus errores.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4">
            <LeadForm />
            <p className="text-xs text-slate-600">
              Sin tarjeta de crédito. Cancela cuando quieras.
            </p>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-24 bg-slate-900/20 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              title="Generación IA Realista"
              desc="Nuestros agentes analizan huellas digitales públicas para crear correos señuelo imposibles de distinguir."
            />
            <FeatureCard 
              icon={<Lock className="h-6 w-6 text-emerald-400" />}
              title="Micro-Learning Instantáneo"
              desc="Si un empleado cae en la trampa, recibe una lección interactiva de 2 minutos en ese mismo instante."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6 text-blue-400" />}
              title="Métricas de Riesgo Humano"
              desc="Visualiza qué departamentos son más vulnerables y mide la mejora semana tras semana."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>&copy; 2025 Project Firewall. Todos los derechos reservados.</p>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="mb-4 bg-slate-900/50 w-fit p-3 rounded-lg">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}