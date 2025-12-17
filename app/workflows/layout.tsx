import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workflows - Fiona",
  description: "Create and manage AI workflows for smart campaigns",
}

export default function WorkflowsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
