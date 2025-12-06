"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, TrendingUp, Mail, CheckCircle2, AlertTriangle, BarChart3, Zap } from "lucide-react"
import { fetchSendingStats, fetchDetailedStats } from "@/store/actions/mailboxActions"
import { RootState, AppDispatch } from "@/store/store"
import { Alert, AlertDescription } from "@/components/ui/alert"

const DAILY_LIMIT = 500

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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading && !sendingStats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!sendingStats) {
    return null
  }

  const successRate = sendingStats.total > 0 
    ? Math.round((sendingStats.by_mailbox.reduce((sum, mb) => sum + mb.success, 0) / sendingStats.total) * 100)
    : 0

  // Helper function to get limit status
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

  return (
    <div className="space-y-6">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sent Today</p>
                <p className="text-3xl font-bold">{sendingStats.total.toLocaleString()}</p>
              </div>
              <Mail className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                <p className="text-3xl font-bold">{successRate}%</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Mailboxes</p>
                <p className="text-3xl font-bold">{sendingStats.mailbox_count}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mailboxes Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mailbox Performance
          </CardTitle>
          <CardDescription>
            Detailed breakdown of sending statistics per mailbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={`mailbox-${sendingStats.by_mailbox[0]?.mailbox__id}`} className="w-full">
            <TabsList className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))` }}>
              {sendingStats.by_mailbox.map((mailbox) => (
                <TabsTrigger
                  key={`mailbox-${mailbox.mailbox__id}`}
                  value={`mailbox-${mailbox.mailbox__id}`}
                  onClick={() => setSelectedMailboxId(mailbox.mailbox__id)}
                  className="text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1">
                    <span className="hidden sm:inline">
                      {mailbox.mailbox__email ? mailbox.mailbox__email.split('@')[0] : `Mailbox ${mailbox.mailbox__id}`}
                    </span>
                    <span className="sm:hidden">MB {mailbox.mailbox__id}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {mailbox.count}
                    </Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {sendingStats.by_mailbox.map((mailbox) => {
              const successRate = mailbox.count > 0 
                ? Math.round((mailbox.success / mailbox.count) * 100)
                : 0
              
              const limitStatus = getLimitStatus(mailbox.count)

              return (
                <TabsContent key={`content-${mailbox.mailbox__id}`} value={`mailbox-${mailbox.mailbox__id}`} className="space-y-4 mt-6">
                  {/* Daily Limit Warning */}
                  {limitStatus.status !== 'normal' && (
                    <Alert variant={limitStatus.status === 'critical' ? 'destructive' : 'default'} className={limitStatus.status === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : ''}>
                      <AlertTriangle className={`h-4 w-4 ${limitStatus.status === 'critical' ? '' : 'text-yellow-600'}`} />
                      <AlertDescription className={limitStatus.status === 'critical' ? '' : 'text-yellow-800 dark:text-yellow-200'}>
                        {limitStatus.isLimitReached 
                          ? `Daily limit of ${DAILY_LIMIT} emails reached for this mailbox. You cannot send more today.`
                          : `⚠️ Approaching daily limit! Only ${limitStatus.remaining} emails remaining out of ${DAILY_LIMIT}.`
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Daily Limit Progress */}
                  <div className="bg-muted/50 rounded-lg p-4 border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Daily Sending Limit
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {limitStatus.isLimitReached 
                            ? 'Limit reached - reset tomorrow' 
                            : `${limitStatus.remaining} of ${DAILY_LIMIT} emails available today`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{mailbox.count}</p>
                        <p className="text-xs text-muted-foreground">sent today</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress 
                        value={limitStatus.percentage} 
                        className={`h-3 ${
                          limitStatus.status === 'critical' 
                            ? '[&>*]:bg-red-500' 
                            : limitStatus.status === 'warning'
                            ? '[&>*]:bg-yellow-500'
                            : '[&>*]:bg-green-500'
                        }`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span className="font-medium">{Math.round(limitStatus.percentage)}%</span>
                        <span>{DAILY_LIMIT}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Sent</p>
                        <p className="text-2xl font-bold">{mailbox.count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Success</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-bold text-green-600">{mailbox.success}</p>
                          <span className="text-xs text-green-600">({successRate}%)</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Failed</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-bold text-red-600">{mailbox.failed}</p>
                          <span className="text-xs text-red-600">({Math.round((mailbox.failed / mailbox.count) * 100)}%)</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-xs font-mono truncate">{mailbox.mailbox__email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Success Rate</span>
                        <span className="text-xs font-bold">{successRate}%</span>
                      </div>
                      <Progress value={successRate} className="h-2" />
                    </div>
                  </div>

                  {/* Detailed Stats if available */}
                  {detailedStats && selectedMailboxId === mailbox.mailbox__id && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3 text-sm">Status Breakdown</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {detailedStats.by_status.map((status) => (
                          <div key={status.status} className="bg-muted/50 rounded p-3 border">
                            <p className="text-xs text-muted-foreground capitalize mb-1">{status.status}</p>
                            <p className="text-lg font-bold">{status.count}</p>
                          </div>
                        ))}
                      </div>

                      {detailedStats.campaigns && detailedStats.campaigns.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2 text-sm">Active Campaigns</h4>
                          <div className="flex flex-wrap gap-2">
                            {detailedStats.campaigns.map((campaign, idx) => (
                              <Badge key={idx} variant="outline">
                                {campaign.dispatch__campaign__name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>

          {/* Quick Stats Grid */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-semibold mb-4 text-sm">All Mailboxes Overview</h4>
            <div className="space-y-3">
              {sendingStats.by_mailbox.map((mailbox) => {
                const successRate = mailbox.count > 0 
                  ? Math.round((mailbox.success / mailbox.count) * 100)
                  : 0

                return (
                  <div key={mailbox.mailbox__id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedMailboxId(mailbox.mailbox__id)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{mailbox.mailbox__email || `Mailbox ${mailbox.mailbox__id}`}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mailbox.success} succeeded · {mailbox.failed} failed
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="text-lg font-bold">{mailbox.count}</p>
                        <p className="text-xs text-muted-foreground">emails</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {successRate >= 95 && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {successRate >= 80 && successRate < 95 && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {successRate < 80 && <AlertCircle className="h-5 w-5 text-red-500" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
            Statistics are updated in real-time and show today's sending metrics across all your connected mailboxes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
