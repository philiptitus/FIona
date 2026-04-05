"use client"

import { Card } from "@/components/ui/card"
import { Clock, Zap } from "lucide-react"

interface PendingCardProps {
  scheduled: number
  sequence: number
  total: number
}

export default function PendingCard({ scheduled, sequence, total }: PendingCardProps) {
  const hasActivity = total > 0

  return (
    <Card
      className={`p-6 rounded-2xl border-2 shadow-md transition-all duration-300 ${
        hasActivity
          ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg hover:scale-105"
          : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200"
      }`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">Pending Today</h3>
        <p className="text-sm text-slate-600 mt-1">Emails scheduled to send</p>
      </div>

      {hasActivity ? (
        <>
          <div className="mb-6">
            <p className={`text-5xl font-bold tracking-tight ${hasActivity ? "text-amber-900" : "text-slate-900"}`}>
              {total.toLocaleString()}
            </p>
            <p className="text-sm text-amber-700 mt-2 font-medium">emails waiting to be sent</p>
          </div>

          <div className="space-y-3 pt-6 border-t border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Scheduled</p>
                  <p className="text-lg font-bold text-slate-900">{scheduled.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Zap className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Sequence</p>
                  <p className="text-lg font-bold text-slate-900">{sequence.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-amber-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-sm font-medium text-amber-800">Active queue</p>
            </div>
          </div>
        </>
      ) : (
        <div className="py-8 text-center">
          <div className="inline-flex p-4 bg-slate-200 rounded-full mb-4">
            <Clock className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-lg font-semibold text-slate-600">No Pending Emails</p>
          <p className="text-sm text-slate-500 mt-2">Your queue is empty for today</p>
        </div>
      )}
    </Card>
  )
}
