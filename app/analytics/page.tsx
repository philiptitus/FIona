"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import StatCard from "@/components/analytics/StatCard"
import WeeklyChart from "@/components/analytics/WeeklyChart"
import PendingCard from "@/components/analytics/PendingCard"
import IndustryBreakdown from "@/components/analytics/IndustryBreakdown"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { handleFetchDashboardMetrics } from "@/store/actions/analyticsActions"
import { AppDispatch, RootState } from "@/store/store"
import { AlertCircle, Send, Mail, Users, TrendingUp } from "lucide-react"

export default function AnalyticsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { dashboardMetrics, loading, error } = useSelector((state: RootState) => state.analytics)

  useEffect(() => {
    dispatch(handleFetchDashboardMetrics())
  }, [dispatch])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-5 w-96 bg-slate-100 rounded-lg animate-pulse" />
          </div>

          {/* KPI Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>

          {/* Industry Skeleton */}
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </MainLayout>
    )
  }

  if (error || !dashboardMetrics) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Analytics</h1>
            <p className="text-lg text-slate-600">Your campaign and engagement insights at a glance.</p>
          </div>

          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              {error || "Failed to load analytics data. Please try refreshing the page."}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">Analytics</h1>
            <p className="text-lg text-slate-600 mt-2">
              Your campaign performance and engagement metrics in real-time.
            </p>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" />
        </div>

        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Emails Sent"
            value={dashboardMetrics.total_sent}
            icon={Send}
            color="success"
          />
          <StatCard
            label="Total Campaigns"
            value={dashboardMetrics.total_campaigns}
            icon={TrendingUp}
            color="default"
          />
          <StatCard
            label="Total Contacts"
            value={dashboardMetrics.total_contacts}
            icon={Users}
            color="default"
          />
          <StatCard
            label="Pending Today"
            value={dashboardMetrics.pending_today.total}
            icon={Mail}
            color={dashboardMetrics.pending_today.total > 0 ? "warning" : "default"}
          />
        </div>

        {/* Row 2: Weekly Chart & Pending Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeeklyChart data={dashboardMetrics.weekly_window} />
          </div>
          <PendingCard
            scheduled={dashboardMetrics.pending_today.scheduled}
            sequence={dashboardMetrics.pending_today.sequence}
            total={dashboardMetrics.pending_today.total}
          />
        </div>

        {/* Row 3: Industry Breakdown */}
        <IndustryBreakdown data={dashboardMetrics.by_industry} />
      </div>
    </MainLayout>
  )
}
