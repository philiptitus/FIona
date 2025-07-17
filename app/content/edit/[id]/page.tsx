"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RootState, AppDispatch } from "@/store/store"
import { useEffect, useState } from "react"
import { handleUpdateContent, handleFetchContents } from "@/store/actions/contentActions"

export default function EditContentPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const contentId = Number(params.id)
  const { contents, isLoading } = useSelector((state: RootState) => state.content)
  const content = contents.find((c) => c.id === contentId)

  const [form, setForm] = useState({
    name: content?.name || "",
    content: content?.content || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!content) {
      dispatch(handleFetchContents())
    } else {
      setForm({ name: content.name, content: content.content })
    }
  }, [content, contentId, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await dispatch(handleUpdateContent({ id: contentId, contentData: form }))
    setIsSubmitting(false)
    router.push(`/content/${contentId}`)
  }

  if (!content && !isLoading) {
    router.replace("/content")
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/content/${contentId}`)}>{"<-"} Back to Content</Button>
        <Card className="shadow-xl border bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">Edit Email Content</CardTitle>
          </CardHeader>
          <div className="flex flex-col md:flex-row gap-8 p-6">
            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="flex-1 min-w-0">
              <div className="mb-4">
                <label className="block mb-1 font-medium">Subject (Name)</label>
                <Input name="name" value={form.name} onChange={handleChange} required autoFocus />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Body (Content)</label>
                <Textarea name="content" value={form.content} onChange={handleChange} rows={8} className="resize-vertical" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/content/${contentId}`)}>Cancel</Button>
              </div>
            </form>
            {/* Live Email Preview */}
            <div className="flex-1 min-w-0">
              <div className="mb-2 font-semibold text-lg">Live Email Preview</div>
              <div className="rounded-lg border bg-gray-50 dark:bg-zinc-800 p-6 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-blue-200 dark:bg-blue-900 w-10 h-10 flex items-center justify-center font-bold text-lg text-blue-900 dark:text-blue-100">
                    {form.name?.[0] || "E"}
                  </div>
                  <div>
                    <div className="font-semibold text-base text-gray-900 dark:text-gray-100">From: <span className="text-gray-700 dark:text-gray-300">Your Campaign</span></div>
                    <div className="text-xs text-gray-500">To: [Recipient]</div>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">{form.name || "(No Subject)"}</span>
                </div>
                <div className="whitespace-pre-line text-gray-800 dark:text-gray-200 text-base min-h-[120px] border-t pt-4">
                  {form.content || <span className="italic text-muted-foreground">No content</span>}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
