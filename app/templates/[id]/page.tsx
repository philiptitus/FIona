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
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">{template?.name || "Template"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <HtmlPreview html={template?.html_content || ""} />
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
