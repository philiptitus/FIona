import MainLayout from "@/components/layout/main-layout"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Mail, LayoutTemplate } from "lucide-react"

const mockStats = [
  { icon: BarChart3, label: "Total Campaigns", value: 18, color: "bg-blue-500" },
  { icon: LayoutTemplate, label: "Templates", value: 42, color: "bg-purple-500" },
  { icon: Mail, label: "Emails Sent", value: 1243, color: "bg-green-500" },
  { icon: Users, label: "Audience", value: 860, color: "bg-orange-500" },
]

const mockChartData = [
  { name: "Jan", campaigns: 2, emails: 100 },
  { name: "Feb", campaigns: 3, emails: 120 },
  { name: "Mar", campaigns: 4, emails: 150 },
  { name: "Apr", campaigns: 5, emails: 200 },
  { name: "May", campaigns: 4, emails: 180 },
  { name: "Jun", campaigns: 6, emails: 220 },
]

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Analytics</h1>
            <p className="text-muted-foreground text-lg">Your campaign and engagement insights at a glance.</p>
          </div>
          <Tabs defaultValue="overview" className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="main-stats">
          {mockStats.map((stat, idx) => (
            <Card key={stat.label} className="flex flex-col items-center justify-center gap-2 py-8 shadow-md border-0 bg-gradient-to-br from-muted/70 to-background dark:from-muted/50 dark:to-background">
              <span className={`rounded-full p-3 ${stat.color} bg-opacity-20 mb-2`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </span>
              <span className="text-2xl font-bold">{stat.value.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </Card>
          ))}
        </div>
        <div className="rounded-xl bg-card shadow-lg p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-semibold">Engagement Trends</h2>
            <Badge variant="outline" className="px-3 py-1 text-base">Last 6 Months</Badge>
          </div>
          <div className="w-full h-[320px]">
            <ChartContainer config={{}}>
              {/* Placeholder for future chart, e.g. BarChart/LineChart */}
              <div className="flex items-center justify-center h-full text-muted-foreground text-lg">
                [Analytics Chart Placeholder]
              </div>
            </ChartContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-500" /> Top Performing Campaigns</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Spring Sale</span> <span>68% open</span>
              </div>
              <Progress value={68} className="h-2" />
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Product Launch</span> <span>54% open</span>
              </div>
              <Progress value={54} className="h-2" />
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Newsletter</span> <span>41% open</span>
              </div>
              <Progress value={41} className="h-2" />
            </div>
          </Card>
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-green-500" /> Audience Growth</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Subscribers</span> <span>+120</span>
              </div>
              <Progress value={80} className="h-2" />
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Unsubscribes</span> <span>-12</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
          </Card>
        </div>
        <div className="flex flex-col items-center justify-center mt-12 opacity-70">
          <BarChart3 className="h-14 w-14 text-primary mb-4 animate-pulse" />
          <h4 className="text-xl font-semibold mb-2">Analytics Integration Coming Soon</h4>
          <p className="text-muted-foreground text-center max-w-xl">
            This page will soon provide detailed analytics and visualizations for your campaigns, audience, and engagement. Stay tuned for powerful insights!
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
