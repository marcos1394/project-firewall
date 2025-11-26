import LeadForm from "@/components/LeadForm";
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  BarChart3, 
  Server, 
  Globe, 
  CheckCircle2, 
  Terminal, 
  AlertTriangle, 
  MousePointerClick 
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      
      {/* 1. NAVBAR FLOTANTE */}
      <header className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0B0F19]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-lg group-hover:bg-indigo-600/30 transition-colors">
              <ShieldCheck className="text-indigo-400 h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-none">Kinetis</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">Security Protocol</span>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">Tecnología</a>
            <a href="#features" className="hover:text-white transition-colors">Características</a>
            <a href="https://kinetis.org" target="_blank" className="hover:text-white transition-colors flex items-center gap-1">
              Kinetis Studio <Globe className="h-3 w-3 opacity-50"/>
            </a>
          </nav>
          
          <div className="flex items-center gap-4">
             {/* Este botón es "fake" por ahora, lleva al form */}
             <a href="#join" className="hidden sm:block text-sm font-medium text-white hover:text-indigo-300 transition-colors">
               Login
             </a>
             <a href="#join" className="text-xs font-mono bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full transition-all shadow-[0_0_15px_-3px_rgba(79,70,229,0.4)]">
               BETA ACCESS
             </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (La Venta) */}
      <section className="relative pt-40 pb-24 px-6 md:pt-48 lg:pb-32">
        {/* Background Gradients (Atmósfera) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 opacity-40 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Badge de Anuncio */}
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
            Nuevo motor de IA v1.0 disponible
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[0.95] drop-shadow-2xl">
            La defensa activa <br />
            <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              para humanos.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            El 91% de los ciberataques comienzan con un email. <br className="hidden md:block"/>
            <strong className="text-indigo-200 font-medium">Kinetis</strong> entrena a tu equipo con simulaciones de IA antes de que los hackers reales ataquen.
          </p>

          <div id="join" className="flex flex-col items-center justify-center gap-8 pt-10">
            {/* Formulario Container Glassmorphism */}
            <div className="w-full max-w-md bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl relative group">
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="bg-[#0B0F19] p-6 rounded-xl relative">
                    <p className="text-sm text-slate-400 mb-4 font-medium text-center">Únete a la lista de espera prioritaria</p>
                    <LeadForm />
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500"/> Sin tarjeta de crédito</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500"/> Setup en 5 minutos</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500"/> Cumple ISO 27001</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF (Infraestructura) */}
      <section className="py-12 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em] mb-8">Construido sobre infraestructura militar</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale mix-blend-luminosity">
                <TechLogo name="Vercel Enterprise" icon={<Globe className="h-5 w-5"/>} />
                <TechLogo name="Supabase" icon={<Server className="h-5 w-5"/>} />
                <TechLogo name="AES-256 GCM" icon={<Lock className="h-5 w-5"/>} />
                <TechLogo name="OpenAI API" icon={<Terminal className="h-5 w-5"/>} />
            </div>
        </div>
      </section>

      {/* 4. PROBLEM AGITATION (El miedo vende seguridad) */}
      <section className="py-24 bg-[#080a11]">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
                <div className="inline-flex items-center rounded-lg bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 mr-2"/> Amenaza Crítica
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                    Tu antivirus no puede <br/>
                    <span className="text-red-500">parchar a las personas.</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Las empresas gastan millones en Firewalls, pero un solo clic de un empleado cansado en Contabilidad puede cifrar todos tus servidores.
                </p>
                <ul className="space-y-4 pt-4">
                    <li className="flex items-start gap-3 text-slate-300">
                        <div className="mt-1 h-2 w-2 rounded-full bg-red-500"/>
                        <span>El ransomware promedio cuesta $1.85M USD.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300">
                        <div className="mt-1 h-2 w-2 rounded-full bg-red-500"/>
                        <span>El phishing de hoy usa IA, es indetectable a simple vista.</span>
                    </li>
                </ul>
            </div>
            {/* Visual Abstracto del Problema */}
            <div className="relative h-80 w-full bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center items-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                
                {/* Email Simulado */}
                <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 border-b pb-3 mb-3">
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">M</div>
                        <div>
                            <div className="h-2 w-24 bg-slate-200 rounded mb-1"></div>
                            <div className="h-2 w-16 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-100 rounded"></div>
                        <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                        <div className="h-8 w-32 bg-red-500 rounded mt-4 flex items-center justify-center text-white text-xs font-bold cursor-not-allowed">
                           URGENTE: FACTURA
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-4 right-6 text-red-400 text-xs font-mono animate-pulse">
                    MALWARE DETECTED
                </div>
            </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (Proceso) */}
      <section id="how-it-works" className="py-32 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-900/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center mb-20">
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">Seguridad sin fricción</h2>
                <p className="text-slate-400">Automatiza la cultura de seguridad en 3 pasos.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                <StepCard 
                    icon={<Globe className="text-indigo-400"/>}
                    title="1. Conexión Silenciosa"
                    desc="Se integra vía API con Google Workspace o Microsoft 365. Sin instalar agentes en las laptops de nadie."
                />
                <StepCard 
                    icon={<Zap className="text-yellow-400"/>}
                    title="2. Ataque Simulado"
                    desc="Kinetis envía correos seguros (phishing ético) diseñados por IA para probar la atención de cada usuario."
                />
                <StepCard 
                    icon={<BarChart3 className="text-emerald-400"/>}
                    title="3. Aprendizaje Instantáneo"
                    desc="Si caen, reciben un micro-video de 60s en ese momento. Si lo reportan, ganan puntos. Gamificación real."
                />
            </div>
        </div>
      </section>

      {/* 6. FEATURES (Grid) */}
      <section id="features" className="py-24 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              title="Ataques Generativos"
              desc="La IA aprende de los errores pasados para crear trampas más difíciles cada mes."
              icon={<Terminal className="h-6 w-6 text-indigo-500" />}
            />
            <FeatureCard 
              title="Cero Lectura de Datos"
              desc="Privacidad absoluta. Nunca leemos tus correos reales, solo monitoreamos nuestras simulaciones."
              icon={<Lock className="h-6 w-6 text-emerald-500" />}
            />
            <FeatureCard 
              title="Reportes Ejecutivos"
              desc="Métricas claras: 'El riesgo humano bajó un 40% este mes'. Listos para enviar al CEO."
              icon={<BarChart3 className="h-6 w-6 text-blue-500" />}
            />
            <FeatureCard 
              title="Botón de Pánico"
              desc="Plugin para Outlook/Gmail que permite a los usuarios reportar amenazas con un clic."
              icon={<MousePointerClick className="h-6 w-6 text-purple-500" />}
            />
            <FeatureCard 
              title="Setup en Minutos"
              desc="Importa tus usuarios desde el directorio activo. No requiere configuración manual."
              icon={<Server className="h-6 w-6 text-pink-500" />}
            />
            <FeatureCard 
              title="Certificado ISO/SOC2"
              desc="Generamos la evidencia de capacitación que te piden los auditores anualmente."
              icon={<ShieldCheck className="h-6 w-6 text-orange-500" />}
            />
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL & FOOTER */}
      <footer className="pt-24 pb-12 border-t border-slate-900 bg-[#05080F] text-sm relative overflow-hidden">
        {/* Glow final */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-900/20 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20">
                <div className="max-w-md">
                    <h3 className="text-2xl font-bold text-white mb-2">Protege tu empresa hoy.</h3>
                    <p className="text-slate-400">Únete a los líderes de TI que duermen tranquilos.</p>
                </div>
                <div>
                   <a href="#join" className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-slate-900 shadow transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
                     Solicitar Acceso Beta
                   </a>
                </div>
            </div>

            <div className="h-px w-full bg-slate-800 mb-8"></div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                        <div className="h-3 w-3 bg-indigo-500 rounded-sm"></div> Kinetis Security
                    </span>
                    <p className="text-slate-600 text-xs">Una división de Kinetis Venture Studio.</p>
                </div>
                <div className="flex gap-8 text-slate-500 font-medium">
                    <a href="#" className="hover:text-indigo-400 transition-colors">Privacidad</a>
                    <a href="#" className="hover:text-indigo-400 transition-colors">Términos</a>
                    <a href="mailto:security@kinetis.org" className="hover:text-indigo-400 transition-colors">Soporte</a>
                </div>
                <p className="text-slate-700">&copy; 2025 Kinetis Organization.</p>
            </div>
        </div>
      </footer>
    </main>
  );
}

// COMPONENTES UI MICRO (Para mantener el archivo limpio pero funcional al copiar)

function TechLogo({name, icon}: {name: string, icon: any}) {
    return (
        <div className="flex items-center gap-2 group cursor-help transition-all duration-300 hover:grayscale-0 hover:opacity-100">
            {icon}
            <span className="font-bold text-lg text-slate-300">{name}</span>
        </div>
    )
}

function StepCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
      <div className="relative p-8 rounded-2xl bg-slate-900/20 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/40 transition-all duration-300 group">
        <div className="mb-4 bg-slate-950 w-12 h-12 flex items-center justify-center rounded-xl border border-slate-800 group-hover:border-indigo-500 group-hover:scale-110 transition-all shadow-lg">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
      </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800/60 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
                {icon}
                <h3 className="text-base font-semibold text-white">{title}</h3>
            </div>
            <p className="text-sm text-slate-400">{desc}</p>
        </div>
    )
}