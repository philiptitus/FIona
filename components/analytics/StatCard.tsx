"use client"

import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  color?: "default" | "success" | "warning" | "danger"
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "default",
}: StatCardProps) {
  const colorVariants = {
    default: "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200",
    success: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
    warning: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
    danger: "bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200",
  }

  const iconColorVariants = {
    default: "text-slate-600",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-rose-600",
  }

  const counterColorVariants = {
    default: "text-slate-900",
    success: "text-emerald-900",
    warning: "text-amber-900",
    danger: "text-rose-900",
  }

  const formattedValue = value.toLocaleString()

  return (
    <Card className={`${colorVariants[color]} p-6 rounded-2xl border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2 tracking-wide uppercase">{label}</p>
          <p className={`${counterColorVariants[color]} text-4xl font-bold tracking-tight`}>
            {formattedValue}
          </p>
          {trend !== undefined && trendLabel && (
            <p className="text-xs text-slate-500 mt-2">
              {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {trendLabel}
            </p>
          )}
        </div>
        <div className={`${iconColorVariants[color]} p-3 bg-white rounded-lg shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}
