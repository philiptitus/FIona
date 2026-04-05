"use client"

import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { handleFetchPreset, handleUpdatePreset } from "@/store/actions/presetActions"
import { handleFetchMailboxes } from "@/store/actions/mailboxActions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2, Calendar, Mail } from "lucide-react"
import MailLoader from "@/components/MailLoader"

interface EmailSendingPresetFormProps {
  showSectionHeader?: boolean
}

export default function EmailSendingPresetForm({ showSectionHeader = true }: EmailSendingPresetFormProps) {
  const dispatch = useDispatch()
  
  // Redux state
  const { currentPreset, isLoading: presetLoading, error: presetError } = useSelector(
    (state: RootState) => state.preset
  )
  const { mailboxes = [], isLoading: mailboxesLoading } = useSelector(
    (state: RootState) => state.mailbox
  )

  // Local state
  const [selectedMailboxIds, setSelectedMailboxIds] = useState<number[]>([])
  const [contentType, setContentType] = useState<string>("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string>("")
  const [showMailboxSelector, setShowMailboxSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const selectorRef = React.useRef<HTMLDivElement>(null)

  // Load preset and mailboxes on mount
  useEffect(() => {
    dispatch(handleFetchPreset() as any)
    dispatch(handleFetchMailboxes() as any)
  }, [dispatch])

  // Populate form when preset loads
  useEffect(() => {
    if (currentPreset) {
      setSelectedMailboxIds(currentPreset.mailbox_ids || [])
      setContentType(currentPreset.content_type || "")
      setIsScheduled(currentPreset.is_scheduled || false)
      setScheduledDate(currentPreset.scheduled_date || "")
    }
  }, [currentPreset])

  // Close mailbox selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowMailboxSelector(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMailboxToggle = (mailboxId: number) => {
    setSelectedMailboxIds((prev) =>
      prev.includes(mailboxId)
        ? prev.filter((id) => id !== mailboxId)
        : [...prev, mailboxId]
    )
  }

  const handleSavePreset = async () => {
    setSaveError("")
    setSuccessMessage("")
    setIsSaving(true)

    try {
      const presetData = {
        mailbox_ids: selectedMailboxIds,
        content_type: contentType,
        is_scheduled: isScheduled,
        scheduled_date: isScheduled && scheduledDate ? scheduledDate : null,
      }

      const result = await dispatch(handleUpdatePreset(presetData) as any)
      
      if (result) {
        setSuccessMessage("Email sending preset saved successfully!")
        setTimeout(() => setSuccessMessage(""), 4000)
      } else {
        setSaveError("Failed to save preset. Please try again.")
      }
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving.")
    } finally {
      setIsSaving(false)
    }
  }

  const filteredMailboxes = mailboxes.filter((mb: any) =>
    mb.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mb.provider.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (presetLoading || mailboxesLoading) {
    return <MailLoader />
  }

  return (
    <section className="space-y-6">
      {showSectionHeader && (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Sending Preset
            </h2>
            <p className="text-sm text-muted-foreground">
              Save your preferred email sending configuration so you can launch campaigns faster. This preset will be applied automatically when you create new campaigns.
            </p>
          </div>
          <div className="border-b border-slate-200 dark:border-slate-700" />
        </>
      )}

      <div className="space-y-6">
        {/* Alert Messages */}
        {presetError && (
          <Alert variant="destructive" className="border-2 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Preset</AlertTitle>
            <AlertDescription>{presetError}</AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert variant="destructive" className="border-2 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Save Error</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Mailbox Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Default Mailboxes
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Select mailboxes to use by default when sending campaigns
              </p>
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              {selectedMailboxIds.length} selected
            </span>
          </div>

          {mailboxesLoading ? (
            <div className="text-center py-8 text-slate-600">Loading mailboxes...</div>
          ) : mailboxes.length === 0 ? (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">No Mailboxes</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Connect a mailbox first to create a preset
              </AlertDescription>
            </Alert>
          ) : (
            <div className="relative" ref={selectorRef}>
              <button
                onClick={() => setShowMailboxSelector(!showMailboxSelector)}
                className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-left hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex flex-wrap gap-2 items-center min-h-12 group"
              >
                {selectedMailboxIds.length === 0 ? (
                  <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                    Click to select mailboxes…
                  </span>
                ) : (
                  selectedMailboxIds.slice(0, 3).map((mailboxId) => {
                    const mailbox = mailboxes.find((mb: any) => mb.id === mailboxId)
                    return mailbox ? (
                      <Badge
                        key={mailbox.id}
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-0 flex items-center gap-1"
                      >
                        {mailbox.email}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMailboxToggle(mailbox.id)
                          }}
                          className="hover:opacity-70 transition-opacity"
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

              {/* Mailbox Selection Dropdown */}
              {showMailboxSelector && (
                <div className="absolute z-50 top-full mt-2 w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    placeholder="Search mailboxes…"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-600 dark:text-slate-100 bg-slate-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filteredMailboxes.length === 0 ? (
                      <div className="text-center py-4 text-sm text-slate-500">
                        No mailboxes found
                      </div>
                    ) : (
                      filteredMailboxes.map((mb: any) => (
                        <button
                          key={mb.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMailboxToggle(mb.id)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            selectedMailboxIds.includes(mb.id)
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700"
                              : "hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded border-2 flex items-center justify-center text-xs transition-colors ${
                              selectedMailboxIds.includes(mb.id)
                                ? "bg-blue-600 border-blue-600"
                                : "border-slate-400 dark:border-slate-500"
                            }`}
                          >
                            {selectedMailboxIds.includes(mb.id) && (
                              <span className="text-white font-bold">✓</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{mb.email}</div>
                            <div className="text-xs opacity-70">{mb.provider}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
            💡 Tip: Select multiple mailboxes to load-balance your campaigns
          </p>
        </div>

        {/* Content Type Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Default Content Type
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Choose whether to send plain text or styled HTML emails by default
            </p>
          </div>

          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 hover:border-purple-400 dark:hover:border-purple-500 transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Choose content type…</option>
            <option value="content">📝 Plain Text - Simple & Personal</option>
            <option value="template">✨ HTML Template - Styled & Professional</option>
          </select>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 space-y-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">📝 Plain Text</div>
              <ul className="text-muted-foreground space-y-0.5">
                <li>✓ Personal feel</li>
                <li>✓ Higher deliverability</li>
                <li>✓ No formatting</li>
              </ul>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 space-y-1">
              <div className="font-medium text-slate-900 dark:text-slate-100">✨ HTML</div>
              <ul className="text-muted-foreground space-y-0.5">
                <li>✓ Styled design</li>
                <li>✓ Professional look</li>
                <li>✓ Rich formatting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scheduling Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Schedule by Default
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Enable to schedule campaigns for a specific date by default
              </p>
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
              Optional
            </span>
          </div>

          <button
            onClick={() => setIsScheduled(!isScheduled)}
            className="flex items-center gap-3 cursor-pointer group w-full p-2 -m-2 hover:opacity-80 transition-opacity rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <div
              className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                isScheduled
                  ? "bg-blue-600 border-blue-600"
                  : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500"
              }`}
            >
              {isScheduled && <span className="text-white text-sm font-bold">✓</span>}
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Schedule campaigns by default
            </span>
          </button>

          {isScheduled && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Default Schedule Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
                📅 Campaigns will use this date by default when created
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            onClick={handleSavePreset}
            disabled={isSaving || selectedMailboxIds.length === 0 || !contentType}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save Preset
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            <strong>Required:</strong> Select at least one mailbox and choose a content type
          </p>
          <p>
            <strong>Scheduling:</strong> Optional - only enable if you want to schedule campaigns by default
          </p>
        </div>
      </div>

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
        @media (prefers-color-scheme: dark) {
          ::-webkit-scrollbar-thumb {
            background: #475569;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        }
      `}</style>
    </section>
  )
}
