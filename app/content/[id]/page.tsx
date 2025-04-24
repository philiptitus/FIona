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
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">{content?.name || "Content Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="mb-2"><b>Type:</b> {content?.type || (content?.campaign ? "Campaign Content" : "-")}</div>
              <div className="mb-2"><b>Content:</b> {content?.content || "-"}</div>
              <div className="mb-2"><b>Uploaded:</b> {content?.created_at || "-"}</div>
              <div className="mb-2"><b>Updated:</b> {content?.updated_at || "-"}</div>
              {content?.campaign && (
                <div className="mb-2"><b>Campaign:</b> <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/campaigns/${content.campaign}`)}>{content.campaign_name || `Campaign #${content.campaign}`}</Button></div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/content/edit/${contentId}`)}>Edit</Button>
              <Button variant="destructive" onClick={async () => {
                await dispatch(handleDeleteContent(contentId))
                router.push("/content")
              }}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
