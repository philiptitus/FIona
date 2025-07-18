"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HtmlPreview } from "@/components/ui/html-preview"
import { RootState, AppDispatch } from "@/store/store"
import { handleDeleteTemplate, handleFetchTemplates } from "@/store/actions/templateActions"
import { useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"
import { handleGenerateTemplate } from "@/store/actions/templateActions"
import { useToast } from "@/components/ui/use-toast"

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { templates, isLoading } = useSelector((state: RootState) => state.template)
  const tplId = Number(params.id)
  const template = templates.find(t => t.id === tplId)
  const [aiDialogOpen, setAIDialogOpen] = useState(false)
  const [aiDesignContext, setAIDesignContext] = useState("")
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (!template) {
      dispatch(handleFetchTemplates())
    }
  }, [template, dispatch])

  if (!template && !isLoading) {
    // If not found after fetching, redirect to templates list
    router.replace("/templates")
    return null
  }

  const handleAIEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tplId) return
    setAILoading(true)
    setAIError("")
    try {
      const result = await dispatch(handleGenerateTemplate({
        id: tplId,
        ui_change_context: aiDesignContext,
        isDesignEdit: true,
      }))
      if (result && result.payload && result.meta && result.meta.requestStatus === "fulfilled" && result.payload.id) {
        toast({ variant: "success", title: "Template design updated!", description: "Your template design was updated successfully." })
        setAIDesignContext("")
        setAIDialogOpen(false)
        dispatch(handleFetchTemplates())
      } else {
        setAIError(result.payload?.error || "AI could not update the template design.")
      }
    } catch (err) {
      setAIError(err?.message || "An error occurred while updating the template design.")
    } finally {
      setAILoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/templates")}>{"<-"} Back to Templates</Button>
        <Card className="shadow-xl border bg-white dark:bg-zinc-900">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-bold mb-2">Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Email Preview Section */}
            <div className="rounded-lg border bg-gray-50 dark:bg-zinc-800 p-4 mb-6 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-blue-200 dark:bg-blue-900 w-10 h-10 flex items-center justify-center font-bold text-lg text-blue-900 dark:text-blue-100">
                  {template?.name?.[0] || "E"}
                </div>
                <div>
                  <div className="font-semibold text-base text-gray-900 dark:text-gray-100">From: <span className="text-gray-700 dark:text-gray-300">Your Campaign</span></div>
                  <div className="text-xs text-gray-500">To: [Recipient]</div>
                </div>
              </div>
              <div className="mb-2">
                <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">{template?.name || "(No Subject)"}</span>
              </div>
                <HtmlPreview html={template?.html_content || ""} />
            </div>
            {/* Metadata Section */}
            <div className="mb-6 text-sm text-muted-foreground space-y-1">
              <div><b>Type:</b> {template?.type || "-"}</div>
              <div><b>Uploaded:</b> {template?.created_at || "-"}</div>
              <div><b>Updated:</b> {template?.updated_at || "-"}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/templates?edit=${tplId}`)}>Edit</Button>
              <Button variant="secondary" onClick={() => setAIDialogOpen(true)}>Edit with AI</Button>
              <Button variant="destructive" onClick={async () => {
                await dispatch(handleDeleteTemplate(tplId))
                router.push("/templates")
              }}>Delete</Button>
              <Button variant="default" onClick={() => router.push(`/email-sending?type=template&id=${tplId}`)}>
                Send as Email
              </Button>
            </div>
            <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
              <DialogContent className="max-w-3xl w-full">
                <DialogHeader>
                  <DialogTitle>Edit Template Design with AI</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col md:flex-row gap-8" onSubmit={handleAIEdit}>
                  <div className="flex-1 min-w-0">
                    <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-blue-900 text-sm">
                      <b>Note:</b> This prompt is for <b>design changes only</b> (e.g., layout, colors, fonts). <br />
                      <span className="text-blue-700">It will not change the content or words of your template.</span>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Design Context / Prompt</label>
                      <textarea
                        name="ui_change_context"
                        placeholder="Describe the design changes you want (e.g., colors, layout, fonts, etc.)"
                        className="border rounded p-2 min-h-[80px] w-full"
                        value={aiDesignContext}
                        onChange={e => setAIDesignContext(e.target.value)}
                        required
                        disabled={aiLoading}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit" disabled={aiLoading}>{aiLoading ? "Updating..." : "Update Design with AI"}</Button>
                      <Button type="button" variant="outline" onClick={() => { setAIDialogOpen(false); setAIError(""); setAIDesignContext("") }} disabled={aiLoading}>Cancel</Button>
                    </div>
                    {aiError && <div className="text-red-500 text-sm mt-2">{aiError}</div>}
                  </div>
                  {/* Live Email Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 font-semibold text-lg">Live Email Preview</div>
                    <div className="rounded-lg border bg-gray-50 dark:bg-zinc-800 p-6 shadow-inner">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full bg-blue-200 dark:bg-blue-900 w-10 h-10 flex items-center justify-center font-bold text-lg text-blue-900 dark:text-blue-100">
                          {template?.name?.[0] || "E"}
                        </div>
                        <div>
                          <div className="font-semibold text-base text-gray-900 dark:text-gray-100">From: <span className="text-gray-700 dark:text-gray-300">Your Campaign</span></div>
                          <div className="text-xs text-gray-500">To: [Recipient]</div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">{template?.name || "(No Subject)"}</span>
                      </div>
                      <HtmlPreview html={template?.html_content || ""} />
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
