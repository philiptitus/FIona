"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import TopMetrics from "@/components/analytics/TopMetrics"
import WeeklyActivityChart from "@/components/analytics/WeeklyActivityChart"
import PendingTodayCounter from "@/components/analytics/PendingTodayCounter"
import ByIndustryPieChart from "@/components/analytics/ByIndustryPieChart"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { handleFetchDashboardMetrics } from "@/store/actions/analyticsActions"
import { AppDispatch, RootState } from "@/store/store"
import { AlertCircle, BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { dashboardMetrics, loading, error } = useSelector((state: RootState) => state.analytics)

  useEffect(() => {
    dispatch(handleFetchDashboardMetrics())
  }, [dispatch])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Analytics</h1>
            <p className="text-muted-foreground text-lg">Your campaign and engagement insights at a glance.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !dashboardMetrics) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Analytics</h1>
            <p className="text-muted-foreground text-lg">Your campaign and engagement insights at a glance.</p>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Failed to load analytics data. Please try refreshing the page."}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-lg">Your campaign and engagement insights at a glance.</p>
        </div>

        {/* Top 3 Metrics */}
        <TopMetrics
          totalSent={dashboardMetrics.total_sent}
          totalCampaigns={dashboardMetrics.total_campaigns}
          totalContacts={dashboardMetrics.total_contacts}
        />

        {/* Weekly Activity Chart */}
        <WeeklyActivityChart weeklyData={dashboardMetrics.weekly_window} />

        {/* Pending Today & By Industry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingTodayCounter
            scheduled={dashboardMetrics.pending_today.scheduled}
            sequence={dashboardMetrics.pending_today.sequence}
            total={dashboardMetrics.pending_today.total}
          />
          <ByIndustryPieChart industryData={dashboardMetrics.by_industry} />
        </div>
      </div>
    </MainLayout>
  )
}
