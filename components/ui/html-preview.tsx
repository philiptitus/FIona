import React from "react"

interface HtmlPreviewProps {
  html: string
}

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ html }) => {
  return (

    <div
      className="bg-background p-0"
      style={{ maxHeight: 400, overflow: "auto" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />


  )
}
