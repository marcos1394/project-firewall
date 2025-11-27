'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, Users, Zap, FileText, CreditCard, 
  Settings, LogOut, ShieldCheck, ChevronLeft, ChevronRight 
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils" // Utilidad de Shadcn

const menuItems = [
  { name: "War Room", href: "/admin-lab", icon: LayoutDashboard },
  { name: "Clientes", href: "/admin-lab/clients", icon: Users },
  { name: "Campañas", href: "/admin-lab/campaigns", icon: Zap },
  { name: "Armería", href: "/admin-lab/templates/new", icon: FileText },
  { name: "Billing", href: "/admin-lab/billing", icon: CreditCard },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div 
      className={cn(
        "border-r border-slate-800 bg-[#0B0F19] flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header / Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/50 h-20">
        {!collapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
                <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
                    <ShieldCheck className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="font-bold text-white tracking-tight">Kinetis</h1>
                </div>
            </div>
        )}
        {collapsed && (
             <div className="mx-auto bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
                <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>
        )}
        
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-white ml-auto"
        >
            {collapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-indigo-400" : "text-slate-500")} />
              
              {!collapsed && <span>{item.name}</span>}
              
              {/* Tooltip en modo colapsado */}
              {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                    {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
                "flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-950/20 rounded-lg transition-colors",
                collapsed && "justify-center"
            )}
        >
            <LogOut className="h-5 w-5" />
            {!collapsed && "Cerrar Sesión"}
        </button>
      </div>
    </div>
  )
}