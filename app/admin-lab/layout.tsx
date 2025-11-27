import { AppSidebar } from "@/components/AppSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex">
      {/* Sidebar fijo a la izquierda */}
      <AppSidebar />
      
      {/* Contenido principal a la derecha */}
      <div className="flex-1 ml-64 min-h-screen">
        {/* Aquí podríamos poner un Topbar/Header común si quisiéramos */}
        <main className="w-full">
            {children}
        </main>
      </div>
    </div>
  )
}