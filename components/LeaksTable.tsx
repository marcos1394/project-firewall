import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Globe, Key, AlertOctagon } from "lucide-react"

export function LeaksTable({ leaks }: { leaks: any[] }) {
  if (!leaks || leaks.length === 0) return null

  return (
    <div className="rounded-lg border border-red-900/30 bg-red-950/5 overflow-hidden mt-8 animate-in slide-in-from-bottom-4">
      <div className="bg-red-950/20 px-4 py-3 border-b border-red-900/30 flex items-center justify-between">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
            <AlertOctagon className="h-4 w-4"/> Evidencia Forense
        </h3>
        <Badge variant="outline" className="text-red-400 border-red-900/50 bg-red-950/30">
            {leaks.length} Registros
        </Badge>
      </div>
      
      <Table>
        <TableHeader>
            <TableRow className="border-red-900/20 hover:bg-transparent">
                <TableHead className="text-red-300/70 text-xs">Víctima</TableHead>
                <TableHead className="text-red-300/70 text-xs">Fuente de Fuga</TableHead>
                <TableHead className="text-red-300/70 text-xs">Datos Expuestos</TableHead>
                <TableHead className="text-red-300/70 text-xs text-right">Fecha Incidente</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {leaks.map((leak) => (
                <TableRow key={leak.id} className="border-red-900/10 hover:bg-red-900/10">
                    <TableCell className="font-mono text-slate-300 text-xs font-medium">
                        {leak.employees?.email || 'Desconocido'}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                            <Globe className="h-3 w-3 text-slate-500"/>
                            {leak.source}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1">
                            {leak.data_classes?.map((data: string, i: number) => (
                                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-300 border border-red-500/20">
                                    {data === 'Password' || data === 'Password Hash' ? <Key className="h-3 w-3 mr-1"/> : null}
                                    {data}
                                </span>
                            ))}
                        </div>
                    </TableCell>
                    <TableCell className="text-right text-slate-500 text-xs font-mono">
                        {leak.leaked_at || 'N/A'}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}