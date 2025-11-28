import { Card } from "@/components/ui/card"
import { BarChart3, LayoutTemplate, Mail } from "lucide-react"

interface TopMetricsProps {
  totalSent: number
  totalCampaigns: number
  totalContacts: number
}

export default function TopMetrics({ totalSent, totalCampaigns, totalContacts }: TopMetricsProps) {
  const metrics = [
    {
      icon: LayoutTemplate,
      label: "Total Campaigns",
      value: totalCampaigns,
      color: "bg-blue-500",
      subtext: "campaigns created"
    },
    {
      icon: Mail,
      label: "Emails Sent",
      value: totalSent,
      color: "bg-green-500",
      subtext: "total emails"
    },
    {
      icon: BarChart3,
      label: "Contacts",
      value: totalContacts,
      color: "bg-purple-500",
      subtext: "in your lists"
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="flex flex-col gap-3 p-6 shadow-md border-0 bg-gradient-to-br from-muted/70 to-background dark:from-muted/50 dark:to-background hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className={`rounded-full p-3 ${metric.color} bg-opacity-20`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
            </span>
            <span className="text-muted-foreground text-xs font-medium">{metric.subtext}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold">{metric.value.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">{metric.label}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
