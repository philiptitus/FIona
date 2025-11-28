import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, CheckCircle2 } from "lucide-react"

interface PendingTodayCounterProps {
  scheduled: number
  sequence: number
  total: number
}

export default function PendingTodayCounter({ scheduled, sequence, total }: PendingTodayCounterProps) {
  const counters = [
    {
      icon: Clock,
      label: "Scheduled",
      value: scheduled,
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Zap,
      label: "Sequence",
      value: sequence,
      color: "bg-purple-500",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: CheckCircle2,
      label: "Total Pending",
      value: total,
      color: "bg-orange-500",
      textColor: "text-orange-600 dark:text-orange-400",
      highlight: true
    }
  ]

  return (
    <Card className="p-6 shadow-md bg-gradient-to-br from-muted/50 to-background">
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Pending Today</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {counters.map((counter) => (
            <div
              key={counter.label}
              className={`flex flex-col gap-3 p-4 rounded-lg border ${
                counter.highlight
                  ? "bg-background border-border dark:border-border/50"
                  : "bg-muted/20 border-transparent"
              } transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full p-2 ${counter.color} bg-opacity-20`}>
                  <counter.icon className={`h-5 w-5 ${counter.color}`} />
                </span>
                {counter.highlight && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className={`text-3xl font-bold ${counter.textColor}`}>
                  {counter.value}
                </span>
                <span className="text-sm text-muted-foreground">{counter.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          These items will be processed today
        </div>
      </div>
    </Card>
  )
}
