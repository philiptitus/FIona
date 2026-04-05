"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Mail, CheckCircle2, AlertTriangle, BarChart3, TrendingUp } from "lucide-react"
import { fetchSendingStats, fetchDetailedStats } from "@/store/actions/mailboxActions"
import { RootState, AppDispatch } from "@/store/store"
import { Alert, AlertDescription } from "@/components/ui/alert"

const DAILY_LIMIT = 500

// Reusable SummaryCard Component
const SummaryCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  variant?: "default" | "success" | "warning" | "danger"
}> = ({ title, value, icon, trend, variant = "default" }) => {
  const getBgColor = () => {
    switch (variant) {
      case "success":
        return "bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800/50"
      case "warning":
        return "bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800/50"
      case "danger":
        return "bg-gradient-to-br from-rose-50/80 to-rose-100/80 dark:from-rose-950/50 dark:to-rose-900/50 border-rose-200 dark:border-rose-800/50"
      default:
        return "bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800/50"
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-emerald-600 dark:text-emerald-400"
      case "warning":
        return "text-amber-600 dark:text-amber-400"
      case "danger":
        return "text-rose-600 dark:text-rose-400"
      default:
        return "text-blue-600 dark:text-blue-400"
    }
  }

  return (
    <Card className={`${getBgColor()} shadow-sm hover:shadow-md transition-shadow duration-300 border`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && <p className="text-xs text-muted-foreground mt-2">{trend}</p>}
          </div>
          <div className={`p-3 rounded-lg bg-white dark:bg-slate-800/50 ${getIconColor()}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// MailboxItem Component
const MailboxItem: React.FC<{
  mailbox: any
  onSelect?: () => void
  isSelected?: boolean
}> = ({ mailbox, onSelect, isSelected }) => {
  const successRate = mailbox.count > 0 
    ? Math.round((mailbox.success / mailbox.count) * 100)
    : 0

  const failureRate = mailbox.count > 0 
    ? Math.round((mailbox.failed / mailbox.count) * 100)
    : 0

  const isInactive = mailbox.count === 0

  return (
    <div
      onClick={onSelect}
      className={`group p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? "bg-primary/5 border-primary shadow-md"
          : "bg-card hover:bg-muted/50 hover:shadow-md border-border"
      } ${isInactive ? "opacity-60" : ""}`}
    >
      {/* Email Header - Separate from stats */}
      <div className="mb-4">
        <p className={`font-mono text-sm font-semibold break-all leading-relaxed ${isInactive ? "text-muted-foreground" : "text-primary"}`}>
          {(mailbox.mailbox_email || mailbox.mailbox__email) || `Mailbox ${mailbox.mailbox_id || mailbox.mailbox__id}`}
        </p>
      </div>

      {/* Sent Count + Success Rate Row */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-2xl font-bold">{mailbox.count}</p>
          <p className="text-xs text-muted-foreground">sent</p>
        </div>
        {mailbox.count > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold">{successRate}%</p>
            <p className="text-xs text-muted-foreground">success</p>
          </div>
        )}
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {mailbox.count > 0 && (
          <>
            <Badge variant="secondary" className="text-xs px-2 py-1 whitespace-nowrap">
              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
              {mailbox.success}
            </Badge>
            {mailbox.failed > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/30 whitespace-nowrap">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {mailbox.failed}
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Progress Bar */}
      {mailbox.count > 0 && (
        <div className="space-y-2">
          <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${successRate}%` }}
            />
            {failureRate > 0 && (
              <div
                className="absolute top-0 h-full bg-gradient-to-r from-rose-500 to-rose-400"
                style={{ left: `${successRate}%`, width: `${failureRate}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {mailbox.success} success
            </span>
            {mailbox.failed > 0 && (
              <span className="flex items-center gap-1">
                {mailbox.failed} failed
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isInactive && (
        <p className="text-xs text-muted-foreground italic">No emails sent yet</p>
      )}
    </div>
  )
}

export default function MailboxStatistics() {
  const dispatch = useDispatch<AppDispatch>()
  const { sendingStats, detailedStats, isLoading, error } = useSelector((state: RootState) => state.mailbox)
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | null>(null)

  useEffect(() => {
    dispatch(fetchSendingStats() as any)
  }, [dispatch])

  useEffect(() => {
    if (selectedMailboxId) {
      dispatch(fetchDetailedStats(selectedMailboxId) as any)
    }
  }, [selectedMailboxId, dispatch])

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="ml-2">{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading && !sendingStats) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-primary mb-3"></div>
        <p className="text-sm text-muted-foreground">Loading statistics...</p>
      </div>
    )
  }

  if (!sendingStats || sendingStats.by_mailbox.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-lg bg-muted mb-4">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base mb-1">No Statistics Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connect a mailbox and send emails to see statistics here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const successRate = sendingStats.total > 0 
    ? Math.round((sendingStats.by_mailbox.reduce((sum, mb) => sum + mb.success, 0) / sendingStats.total) * 100)
    : 0

  const totalFailures = sendingStats.by_mailbox.reduce((sum, mb) => sum + mb.failed, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Mailbox Statistics</h2>
        <p className="text-sm text-muted-foreground">Real-time analytics for your email sending performance</p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Sent"
          value={sendingStats.total.toLocaleString()}
          icon={<Mail className="h-5 w-5" />}
          variant="default"
        />
        <SummaryCard
          title="Active Mailboxes"
          value={sendingStats.mailbox_count}
          icon={<BarChart3 className="h-5 w-5" />}
          variant="default"
        />
        <SummaryCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
        />
        {totalFailures > 0 && (
          <SummaryCard
            title="Failed"
            value={totalFailures}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="danger"
          />
        )}
      </div>

      {/* Mailbox List Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            Mailbox Performance
          </h3>
          <p className="text-sm text-muted-foreground">Individual breakdown of each connected mailbox</p>
        </div>

        {/* Scrollable Mailbox Grid */}
        <div className="h-[600px] overflow-y-auto rounded-xl border bg-card p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sendingStats.by_mailbox.map((mailbox: any) => (
              <MailboxItem
                key={mailbox.mailbox_id || mailbox.mailbox__id}
                mailbox={mailbox}
                isSelected={selectedMailboxId === (mailbox.mailbox_id || mailbox.mailbox__id)}
                onSelect={() => setSelectedMailboxId(mailbox.mailbox_id || mailbox.mailbox__id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats for Selected Mailbox */}
      {selectedMailboxId && sendingStats.by_mailbox.find((mb: any) => (mb.mailbox_id || mb.mailbox__id) === selectedMailboxId) && (
        <DetailedMailboxStats
          mailbox={sendingStats.by_mailbox.find((mb: any) => (mb.mailbox_id || mb.mailbox__id) === selectedMailboxId)!}
          detailedStats={detailedStats}
          isLoading={isLoading}
        />
      )}

      {/* Info Footer */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
            All statistics are updated in real-time and reflect today's sending metrics across your connected mailboxes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Detailed Mailbox Stats Component
const DetailedMailboxStats: React.FC<{
  mailbox: any
  detailedStats: any
  isLoading: boolean
}> = ({ mailbox, detailedStats, isLoading }) => {
  const successRate = mailbox.count > 0 
    ? Math.round((mailbox.success / mailbox.count) * 100)
    : 0

  const failureRate = mailbox.count > 0 
    ? Math.round((mailbox.failed / mailbox.count) * 100)
    : 0

  const getLimitStatus = (sent: number) => {
    const remaining = DAILY_LIMIT - sent
    const percentage = (sent / DAILY_LIMIT) * 100
    
    return {
      remaining: Math.max(0, remaining),
      percentage: Math.min(100, percentage),
      status: percentage >= 95 ? 'critical' : percentage >= 80 ? 'warning' : 'normal',
      isLimitReached: remaining <= 0
    }
  }

  const limitStatus = getLimitStatus(mailbox.count)

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Detailed Performance</CardTitle>
        <CardDescription className="font-mono text-xs">{mailbox.mailbox_email || mailbox.mailbox__email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Limit Alert */}
        {limitStatus.status !== 'normal' && (
          <Alert variant={limitStatus.status === 'critical' ? 'destructive' : 'default'} className={limitStatus.status === 'warning' ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/30' : ''}>
            <AlertTriangle className={`h-4 w-4 ${limitStatus.status === 'critical' ? '' : 'text-amber-600 dark:text-amber-400'}`} />
            <AlertDescription className={`ml-2 ${limitStatus.status === 'critical' ? '' : 'text-amber-800 dark:text-amber-200'}`}>
              {limitStatus.isLimitReached 
                ? `Daily limit of ${DAILY_LIMIT} emails reached for this mailbox`
                : `⚠️ Approaching limit: ${limitStatus.remaining} of ${DAILY_LIMIT} emails remaining`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Daily Limit Progress */}
        <div className="bg-muted/40 rounded-xl p-4 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Daily Sending Limit</p>
              <p className="text-xs text-muted-foreground mt-1">
                {limitStatus.isLimitReached 
                  ? 'Reset tomorrow at midnight' 
                  : `${limitStatus.remaining} remaining`
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{mailbox.count}/{DAILY_LIMIT}</p>
              <p className="text-xs text-muted-foreground">emails</p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress 
              value={limitStatus.percentage} 
              className={`h-2.5 ${
                limitStatus.status === 'critical' 
                  ? '[&>*]:bg-rose-500' 
                  : limitStatus.status === 'warning'
                  ? '[&>*]:bg-amber-500'
                  : '[&>*]:bg-emerald-500'
              }`}
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>0</span>
              <span>{Math.round(limitStatus.percentage)}%</span>
              <span>{DAILY_LIMIT}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/40 rounded-lg p-4 border border-border text-center">
            <p className="text-xs text-muted-foreground font-medium mb-2">Total Sent</p>
            <p className="text-2xl font-bold">{mailbox.count}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800/50 text-center">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-2">Success</p>
            <p className="text-2xl font-bold text-emerald-600">{mailbox.success}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">({successRate}%)</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/20 rounded-lg p-4 border border-rose-200 dark:border-rose-800/50 text-center">
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mb-2">Failed</p>
            <p className="text-2xl font-bold text-rose-600">{mailbox.failed}</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">({failureRate}%)</p>
          </div>
        </div>

        {/* Status Breakdown from Detailed Stats */}
        {detailedStats && detailedStats.by_status && (
          <div>
            <h4 className="font-semibold text-sm mb-3">Status Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {detailedStats.by_status.map((status: any) => (
                <div key={status.status} className="bg-muted/50 rounded-lg p-3 border border-border hover:shadow-sm transition-shadow">
                  <p className="text-xs text-muted-foreground font-medium capitalize mb-1">{status.status}</p>
                  <p className="text-lg font-bold">{status.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Campaigns */}
        {detailedStats && detailedStats.campaigns && detailedStats.campaigns.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3">Active Campaigns</h4>
            <div className="flex flex-wrap gap-2">
              {detailedStats.campaigns.map((campaign: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {campaign.dispatch__campaign__name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
