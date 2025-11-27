'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react"
import { signOut } from "next-auth/react" // Importamos del cliente para el botón

const menuItems = [
  { name: "War Room", href: "/admin-lab", icon: LayoutDashboard },
  { name: "Cartera de Clientes", href: "/admin-lab/clients", icon: Users },
  { name: "Historial de Campañas", href: "/admin-lab/campaigns", icon: Zap },
  { name: "Galería de Armas", href: "/admin-lab/templates/new", icon: FileText }, // Apuntando temporalmente a new, luego haremos lista
  { name: "Suscripción & Pagos", href: "/admin-lab/billing", icon: CreditCard },
  { name: "Configuración", href: "/admin-lab/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r border-slate-800 bg-[#0B0F19] flex flex-col h-screen fixed left-0 top-0 z-50">
      
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
        <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
            <h1 className="font-bold text-white tracking-tight">Kinetis</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Enterprise Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin-lab")
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User / Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
        >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
        </button>
      </div>
    </div>
  )
}