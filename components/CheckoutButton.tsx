'use client'

import { createCheckoutSession } from '@/actions/billing'
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { useTransition } from 'react'

export function CheckoutButton({ priceId, label = "Mejorar Plan" }: { priceId: string, label?: string }) {
  const [isPending, startTransition] = useTransition()

  const handleCheckout = () => {
    startTransition(async () => {
      await createCheckoutSession(priceId)
    })
  }

  return (
    <Button 
        onClick={handleCheckout} 
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
    >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4"/>}
        {label}
    </Button>
  )
}