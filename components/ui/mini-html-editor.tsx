import React from "react"

interface MiniHtmlEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
}

export const MiniHtmlEditor: React.FC<MiniHtmlEditorProps> = ({ value, onChange, height = 200 }) => {
  return (
    <textarea
      className="font-mono border rounded w-full p-2 bg-background"
      style={{ minHeight: height, fontSize: 14, resize: "vertical" }}
      value={value}
      onChange={e => onChange(e.target.value)}
      spellCheck={false}
    />
  )
}
