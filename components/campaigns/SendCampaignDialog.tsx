"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Send, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

interface SendCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: any
  selectedMailboxIds: number[]
  onMailboxChange: (ids: number[]) => void
  selectedType: "content" | "template" | ""
  onTypeChange: (type: "content" | "template" | "") => void
  isScheduled: boolean
  onScheduledChange: (scheduled: boolean) => void
  scheduledDate: string
  onScheduledDateChange: (date: string) => void
  isSending: boolean
  sendSuccess: boolean
  sendError: string
  mailboxes: any[]
  isMailboxesLoading: boolean
  onSend: () => void
  sendDisabled: boolean
  sendDisabledReason: string
}

export default function SendCampaignDialog({
  open,
  onOpenChange,
  campaign,
  selectedMailboxIds,
  onMailboxChange,
  selectedType,
  onTypeChange,
  isScheduled,
  onScheduledChange,
  scheduledDate,
  onScheduledDateChange,
  isSending,
  sendSuccess,
  sendError,
  mailboxes,
  isMailboxesLoading,
  onSend,
  sendDisabled,
  sendDisabledReason,
}: SendCampaignDialogProps) {
  const [showMailboxSelector, setShowMailboxSelector] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const selectorRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowMailboxSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl rounded-2xl border-2 shadow-xl flex flex-col max-h-[90vh] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Launch Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-scroll px-6 py-4 space-y-6">
          {!isSending && !sendSuccess && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Ready to send?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Configure your send settings below and launch</p>
                </div>
              </div>
            </div>
          )}

          {isSending ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative h-16 w-16">
                <Loader2 className="animate-spin h-16 w-16 text-blue-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {isScheduled ? 'Scheduling campaign…' : 'Launching campaign…'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isScheduled 
                    ? 'Your campaign will be sent on the scheduled day'
                    : 'Distributing messages across mailboxes'}
                </p>
              </div>
            </div>
          ) : sendSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-fade-in">
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-pop" />
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-green-600">
                  {isScheduled ? 'Campaign Scheduled!' : 'Campaign Launched!'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isScheduled 
                    ? 'Your campaign is queued for the selected day'
                    : 'Your emails are being sent now'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mailbox Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
                    Select Mailboxes
                  </label>
                  <span className="text-xs text-slate-500">Required</span>
                </div>
                
                {isMailboxesLoading ? (
                  <div className="text-center py-8 text-slate-600">Loading mailboxes...</div>
                ) : (
                  <div className="relative" ref={selectorRef}>
                    <button
                      onClick={() => setShowMailboxSelector(!showMailboxSelector)}
                      className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-left hover:border-blue-400 transition-colors flex flex-wrap gap-2 items-center min-h-12"
                    >
                      {selectedMailboxIds.length === 0 ? (
                        <span className="text-slate-500">Click to select mailboxes…</span>
                      ) : (
                        selectedMailboxIds.slice(0, 3).map(mailboxId => {
                          const mailbox = mailboxes.find((mb: any) => mb.id === mailboxId)
                          return mailbox ? (
                            <Badge key={mailbox.id} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-0">
                              {mailbox.email}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onMailboxChange(selectedMailboxIds.filter(id => id !== mailbox.id))
                                }}
                                className="ml-1 hover:opacity-70"
                              >
                                ×
                              </button>
                            </Badge>
                          ) : null
                        })
                      )}
                      {selectedMailboxIds.length > 3 && (
                        <Badge className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-0">
                          +{selectedMailboxIds.length - 3}
                        </Badge>
                      )}
                    </button>
                    
                    {showMailboxSelector && (
                      <div className="absolute z-50 top-full mt-2 w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-3 space-y-2">
                        <input
                          type="text"
                          placeholder="Search mailboxes…"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-600 dark:text-slate-100"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {mailboxes
                            .filter((mb: any) => 
                              mb.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              mb.provider.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((mb: any) => (
                              <button
                                key={mb.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onMailboxChange(
                                    selectedMailboxIds.includes(mb.id)
                                      ? selectedMailboxIds.filter(id => id !== mb.id)
                                      : [...selectedMailboxIds, mb.id]
                                  )
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                  selectedMailboxIds.includes(mb.id)
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className={`h-4 w-4 rounded border-2 flex items-center justify-center text-xs ${
                                  selectedMailboxIds.includes(mb.id)
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-slate-400'
                                }`}>
                                  {selectedMailboxIds.includes(mb.id) && <span className="text-white">✓</span>}
                                </div>
                                <span className="flex-1">
                                  <div className="font-medium">{mb.email}</div>
                                  <div className="text-xs opacity-70">{mb.provider}</div>
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedMailboxIds.length} selected • Emails will be load-balanced across these accounts
                </p>
              </div>

              {/* Content Type Selection */}
              {campaign?.latest_email_content_id || campaign?.latest_email_template_id ? (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">2</span>
                    Content Type
                  </label>
                  <select
                    className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 hover:border-purple-400 transition-colors"
                    value={selectedType}
                    onChange={e => onTypeChange(e.target.value as "content" | "template" | "")}
                  >
                    <option value="">Choose content type…</option>
                    {campaign?.latest_email_content_id && (
                      <option value="content">📝 Plain Text (Personal)</option>
                    )}
                    {campaign?.latest_email_template_id && (
                      <option value="template">✨ HTML Template (Styled)</option>
                    )}
                  </select>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Templates are styled HTML emails; plain text is simple and personal
                  </p>
                </div>
              ) : (
                <Alert variant="destructive" className="border-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Content Available</AlertTitle>
                  <AlertDescription>
                    Add content or a template to this campaign before sending.
                  </AlertDescription>
                </Alert>
              )}

              {/* Scheduling Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">3</span>
                      Schedule Send
                    </label>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">Optional</span>
                  </div>

                  <button
                    onClick={() => onScheduledChange(!isScheduled)}
                    className="flex items-center gap-3 cursor-pointer group w-full p-2 -m-2 hover:opacity-80 transition-opacity"
                  >
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isScheduled
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                    }`}>
                      {isScheduled && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Enable scheduling
                    </span>
                  </button>

                  {isScheduled && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Schedule for which date?
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => onScheduledDateChange(e.target.value)}
                        className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                        📅 Your campaign will be sent on the selected date
                      </p>
                    </div>
                  )}
                </div>

              {sendError && (
                <Alert variant="destructive" className="border-2 animate-fade-in">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{sendError}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        {!isSending && !sendSuccess && (
          <DialogFooter className="border-t border-slate-200 dark:border-slate-700 p-6 space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
              className="border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={onSend}
              disabled={sendDisabled}
              title={sendDisabledReason}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="h-4 w-4" />
              {isScheduled ? 'Schedule for Date' : 'Send Now'}
            </Button>
          </DialogFooter>
        )}

        <style jsx>{`
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
