import React from "react"

interface HtmlPreviewProps {
  html: string
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ html }) => {
  return (
    <div
      className="border rounded p-4 bg-background"
      style={{ minHeight: 120, maxHeight: 400, overflow: "auto" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
