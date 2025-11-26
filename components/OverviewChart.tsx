"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Lun", enviados: 4, clics: 1 },
  { name: "Mar", enviados: 3, clics: 0 },
  { name: "Mie", enviados: 10, clics: 2 },
  { name: "Jue", enviados: 7, clics: 4 },
  { name: "Vie", enviados: 5, clics: 1 },
  { name: "Sab", enviados: 0, clics: 0 },
  { name: "Dom", enviados: 0, clics: 0 },
]

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorEnviados" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorClics" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
        />
        <YAxis 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`} 
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
        />
        <Area 
            type="monotone" 
            dataKey="enviados" 
            stroke="#6366f1" 
            fillOpacity={1} 
            fill="url(#colorEnviados)" 
            strokeWidth={2}
        />
        <Area 
            type="monotone" 
            dataKey="clics" 
            stroke="#ef4444" 
            fillOpacity={1} 
            fill="url(#colorClics)" 
            strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}