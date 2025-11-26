import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Building2, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const { data: orgs } = await supabase
    .from('organizations')
    .select('*, employees(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Cartera de Clientes</h1>
            <p className="text-slate-400 text-sm">Gestiona organizaciones y directorios de empleados.</p>
        </div>
        <Link href="/admin-lab/clients/new">
            <Button className="bg-indigo-600 hover:bg-indigo-500 gap-2">
                <Plus className="h-4 w-4"/> Nueva Empresa
            </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orgs?.map((org: any) => (
            <Link key={org.id} href={`/admin-lab/clients/${org.id}`}>
                <Card className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                            <Building2 className="h-5 w-5"/>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors"/>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-lg font-bold text-white mb-1">{org.name}</CardTitle>
                        <p className="text-sm text-slate-500 mb-4">{org.domain || 'Sin dominio registrado'}</p>
                        
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/50 p-2 rounded">
                            <Users className="h-3 w-3"/>
                            {org.employees[0].count} Empleados en directorio
                        </div>
                    </CardContent>
                </Card>
            </Link>
        ))}

        {/* Empty State / Add New Card */}
        <Link href="/admin-lab/clients/new">
            <Card className="bg-slate-900/20 border-slate-800 border-dashed hover:border-slate-700 hover:bg-slate-900/40 transition-all cursor-pointer h-full flex flex-col items-center justify-center min-h-[180px]">
                <Plus className="h-8 w-8 text-slate-600 mb-2"/>
                <p className="text-sm text-slate-500 font-medium">Registrar Organización</p>
            </Card>
        </Link>
      </div>
    </div>
  )
}