import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - Fiona",
  description: "Sign in or register for your Fiona account",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
