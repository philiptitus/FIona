"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RootState, AppDispatch } from "@/store/store"
import { handleFetchContentById, handleDeleteContent } from "@/store/actions/contentActions"
import { useEffect } from "react"

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  // Use correct state property: contents (not items)
  const { contents, isLoading } = useSelector((state: RootState) => state.content)
  const contentId = Number(params.id)
  const content = contents.find((item) => item.id === contentId)

  useEffect(() => {
    if (!content) {
      dispatch(handleFetchContentById(contentId))
    }
  }, [content, dispatch, contentId])

  if (!content && !isLoading) {
    router.replace("/content")
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/content")}>{"<-"} Back to Content Library</Button>
        <Card className="shadow-xl border bg-white dark:bg-zinc-900">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl font-bold mb-2">Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Email Preview Section */}
            <div className="rounded-lg border bg-gray-50 dark:bg-zinc-800 p-6 mb-6 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-blue-200 dark:bg-blue-900 w-10 h-10 flex items-center justify-center font-bold text-lg text-blue-900 dark:text-blue-100">
                  {content?.name?.[0] || "E"}
                </div>
                <div>
                  <div className="font-semibold text-base text-gray-900 dark:text-gray-100">From: <span className="text-gray-700 dark:text-gray-300">Your Campaign</span></div>
                  <div className="text-xs text-gray-500">To: [Recipient]</div>
                </div>
              </div>
              <div className="mb-2">
                <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">{content?.name || "(No Subject)"}</span>
              </div>
              <div className="whitespace-pre-line text-gray-800 dark:text-gray-200 text-base min-h-[120px] border-t pt-4">
                {content?.content || <span className="italic text-muted-foreground">No content</span>}
              </div>
            </div>
            {/* Metadata Section */}
            <div className="mb-6 text-sm text-muted-foreground space-y-1">
              <div><b>Type:</b> {content?.type || (content?.campaign ? "Campaign Content" : "-")}</div>
              <div><b>Uploaded:</b> {content?.created_at || "-"}</div>
              <div><b>Updated:</b> {content?.updated_at || "-"}</div>
              {content?.campaign && (
                <div><b>Campaign:</b> <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/campaigns/${content.campaign}`)}>{content.campaign_name || `Campaign #${content.campaign}`}</Button></div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/content/edit/${contentId}`)}>Edit</Button>
              <Button variant="destructive" onClick={async () => {
                await dispatch(handleDeleteContent(contentId))
                router.push("/content")
              }}>Delete</Button>
              <Button variant="default" onClick={() => router.push(`/email-sending?type=content&id=${contentId}`)}>
                Send as Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
