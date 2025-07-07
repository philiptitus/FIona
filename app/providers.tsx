"use client"

import type { ReactNode } from "react"
import { Provider } from "react-redux"
import { store } from "@/store/store"
import { AuthProvider } from "react-oidc-context"

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_FvSLormyO",
  client_id: "3cv6n93ibe6f3sfltfjrtf8j17",
  redirect_uri: typeof window !== 'undefined' ? window.location.origin + '/' : 'https://fiona.mrphilip.cv/',
  response_type: "code",
  scope: "phone openid email",
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider {...cognitoAuthConfig}>
      <Provider store={store}>{children}</Provider>
    </AuthProvider>
  )
}
