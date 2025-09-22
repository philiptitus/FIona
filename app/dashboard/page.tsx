"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/main-layout"
import { useDashboardMetrics } from "./hooks/useDashboardMetrics"
import { CampaignSummary } from "./components/metrics/CampaignSummary"
import { EmailPerformance } from "./components/metrics/EmailPerformance"
import { EngagementMetrics } from "./components/metrics/EngagementMetrics"
import { SystemHealth } from "./components/metrics/SystemHealth"

export default function DashboardPage() {
  const { 
    campaignSummary, 
    emailPerformance, 
    engagementMetrics, 
    systemHealth, 
    loading, 
    error 
  } = useDashboardMetrics()

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 px-4 md:px-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your email campaigns.
            </p>
          </div>
          <Button asChild>
            <Link href="/campaigns/new">Create New Campaign</Link>
          </Button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Campaign Summary */}
          <CampaignSummary 
            data={campaignSummary}
            loading={loading}
            error={error}
          />

          {/* Performance Metrics Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Email Performance */}
            <EmailPerformance 
              data={emailPerformance}
              loading={loading}
              error={error}
            />

            {/* Engagement Metrics */}
            <EngagementMetrics 
              data={engagementMetrics}
              loading={loading}
              error={error}
            />
          </div>

          {/* System Health */}
          <SystemHealth 
            data={systemHealth}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </MainLayout>
  )
}
