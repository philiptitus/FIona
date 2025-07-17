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

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { templates, isLoading } = useSelector((state: RootState) => state.template)
  const tplId = Number(params.id)
  const template = templates.find(t => t.id === tplId)

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
              <Button variant="destructive" onClick={async () => {
                await dispatch(handleDeleteTemplate(tplId))
                router.push("/templates")
              }}>Delete</Button>
              <Button variant="default" onClick={() => router.push(`/email-sending?type=template&id=${tplId}`)}>
                Send as Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
