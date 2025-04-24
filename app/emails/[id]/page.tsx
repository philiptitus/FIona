"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RootState, AppDispatch } from "@/store/store"
import { handleDeleteEmail, handleFetchEmails } from "@/store/actions/emailActions"
import { useEffect } from "react"

export default function EmailDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { emails, isLoading } = useSelector((state: RootState) => state.emails)
  const emailId = Number(params.id)
  const email = emails.find(e => e.id === emailId)

  useEffect(() => {
    if (!email) {
      dispatch(handleFetchEmails())
    }
  }, [email, dispatch])

  if (!email && !isLoading) {
    // If not found after fetching, redirect to emails list
    router.replace("/emails")
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/emails")}>{"<-"} Back to Emails</Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">{email?.organization_name || "Email"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="mb-2"><b>Email:</b> {email?.email}</div>
              <div className="mb-2"><b>Context:</b> {email?.context || "-"}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/emails?edit=${emailId}`)}>Edit</Button>
              <Button variant="destructive" onClick={async () => {
                await dispatch(handleDeleteEmail(emailId))
                router.push("/emails")
              }}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
