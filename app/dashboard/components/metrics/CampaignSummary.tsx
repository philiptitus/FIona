import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Gauge, BarChart2, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { BaseChart } from "../charts/BaseChart";
import { DonutChart } from "../charts/DonutChart";
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/store/store"
import { handleFetchScheduledEmails } from "@/store/actions/dispatchActions"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CampaignSummaryProps {
  data: {
    total_campaigns: number;
    active_campaigns: number;
    avg_emails_per_campaign: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export const CampaignSummary = ({ data, loading, error }: CampaignSummaryProps) => {
  return (
    <BaseChart
      title="Campaign Summary"
      description="Overview of your campaigns"
      isLoading={loading}
      error={error}
      className="col-span-1 md:col-span-3"
    >
      <div className="space-y-6">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Campaigns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : data?.total_campaigns || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time campaigns</p>
            </CardContent>
          </Card>

          {/* Active Campaigns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : data?.active_campaigns || 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          {/* Scheduled Emails (replaces Avg. Emails card) */}
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Emails</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* Scheduled emails list area */}
              <ScheduledEmailsPanel loading={loading} />
            </CardContent>
          </Card>
        </div>

        {/* Campaign Activity Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <Gauge className="h-4 w-4 mr-2 text-emerald-500" />
              Campaign Activity
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DonutChart 
              title="Active vs Inactive"
              data={[
                { 
                  name: 'Active', 
                  value: data?.active_campaigns || 0, 
                  color: '#10b981' 
                },
                { 
                  name: 'Inactive', 
                  value: Math.max(0, (data?.total_campaigns || 0) - (data?.active_campaigns || 0)), 
                  color: '#e2e8f0' 
                },
              ]}
              height={200}
              className="border rounded-lg p-4"
            />
            <div className="border rounded-lg p-4 flex flex-col justify-center">
              <div className="text-sm text-muted-foreground mb-2">Average Emails per Campaign</div>
              <div className="text-3xl font-bold">
                {loading ? 
                  <Skeleton className="h-8 w-20" /> : 
                  data?.avg_emails_per_campaign?.toFixed(1) || '0.0'
                }
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Across all campaigns
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseChart>
  );
};

// Inline panel component for scheduled emails
function ScheduledEmailsPanel({ loading: parentLoading }: { loading: boolean }) {
  const dispatch = useDispatch<AppDispatch>()
  const { scheduledEmails, scheduledPagination, isLoading, error } = useSelector((state: RootState) => state.dispatch)
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    // load first page
    dispatch(handleFetchScheduledEmails(1) as any)
    setPage(1)
  }, [dispatch])

  const loadMore = async () => {
    const nextPage = page + 1
    const res = await dispatch(handleFetchScheduledEmails(nextPage) as any)
    if (res && res.success) {
      setPage(nextPage)
    }
  }

  const showLoading = isLoading || parentLoading

  return (
    <div className="flex flex-col gap-2">
      {showLoading && (
        <div className="flex items-center justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      )}

      {!showLoading && scheduledEmails && scheduledEmails.length === 0 && (
        <div className="text-sm text-muted-foreground">No scheduled emails.</div>
      )}

      <div className="space-y-2 max-h-40 overflow-auto">
        {scheduledEmails && scheduledEmails.map((s: any, idx: number) => {
          // Normalize schedule days from various possible shapes
          const daysArray = (() => {
            if (Array.isArray(s.schedule_days) && s.schedule_days.length) return s.schedule_days
            const candidates = [s.schedule_day_1, s.schedule_day_2, s.schedule_day_3, s.day1, s.day2, s.day3]
            return candidates.filter(Boolean)
          })()
          const daysText = (daysArray && daysArray.length) ? daysArray.join(', ') : '-' 
          const key = s.id ?? `${s.campaign}-${idx}`
          return (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Link href={`/campaigns/${s.campaign}`} className="text-sm font-medium text-primary hover:underline">
                  {s.subject || '(no subject)'}
                </Link>
                <div className="text-xs text-muted-foreground">{daysText}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end mt-2">
        {/* Show load more only if there is a next page */}
        {scheduledPagination?.next ? (
          <Button size="sm" onClick={loadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load more'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
