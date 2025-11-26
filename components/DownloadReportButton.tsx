'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { CampaignReportPDF } from '@/components/reports/CampaignReportPDF'
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useEffect, useState } from 'react'

export function DownloadReportButton({ campaign, targets }: { campaign: any, targets: any[] }) {
  const [isClient, setIsClient] = useState(false)

  // Fix para Next.js: Asegurar que esto solo corra en el cliente para evitar errores de hidratación
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
        <Button variant="outline" disabled className="border-slate-700 text-slate-500">
             <Loader2 className="h-4 w-4 animate-spin mr-2"/> Cargando motor PDF...
        </Button>
    )
  }

  return (
    <PDFDownloadLink 
        document={<CampaignReportPDF campaign={campaign} targets={targets} />} 
        fileName={`Reporte_Kinetis_${campaign.name.replace(/\s+/g, '_')}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button 
            variant="outline" 
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4"/>}
            {loading ? 'Generando...' : 'Descargar Reporte PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}