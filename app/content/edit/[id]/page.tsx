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
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/content/${contentId}`)}>{"<-"} Back to Content</Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">Edit Content</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Name</label>
                <Input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Content</label>
                <Textarea name="content" value={form.content} onChange={handleChange} rows={6} />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/content/${contentId}`)}>Cancel</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
