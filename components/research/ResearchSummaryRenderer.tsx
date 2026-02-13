"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy } from "lucide-react"

function isPrimitive(value: any) {
  return value === null || ["string", "number", "boolean"].includes(typeof value)
}

function safeText(text: any) {
  if (text === null || text === undefined) return ""
  return String(text)
}

// Basic sanitization: parse as DOM and strip script/style and event handler attributes
function sanitizeHtml(html: string) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const scripts = doc.querySelectorAll("script,style")
    scripts.forEach((n) => n.remove())

    // Remove any attributes starting with on* and javascript: href/src
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
    const toRemoveAttrs: Array<{ el: Element; name: string }>[] = []
    while (walker.nextNode()) {
      const el = walker.currentNode as Element
      Array.from(el.attributes).forEach((attr) => {
        const n = attr.name.toLowerCase()
        const v = attr.value || ""
        if (n.startsWith("on") || v.trim().toLowerCase().startsWith("javascript:")) {
          el.removeAttribute(attr.name)
        }
      })
    }

    return doc.body.innerHTML
  } catch (e) {
    return ""
  }
}

function primitiveRenderer(key: string | null, value: any) {
  const text = safeText(value)
  // If it looks like HTML, sanitize and render
  const looksLikeHtml = /<[^>]+>/.test(text)
  if (looksLikeHtml) {
    const sanitized = sanitizeHtml(text)
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
  }
  return <div className="text-sm text-muted-foreground">{text}</div>
}

export default function ResearchSummaryRenderer({ data }: { data: any }) {
  const [showRaw, setShowRaw] = useState(false)

  const compactPreview = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2)
    } catch (e) {
      return String(data)
    }
  }, [data])

  if (!data) return null

  const renderValue = (key: string | null, value: any, depth = 0) => {
    if (isPrimitive(value)) {
      return (
        <div className="mb-2" key={String(key) + String(depth)}>
          {key && <div className="text-xs font-semibold text-muted-foreground">{key.toUpperCase()}</div>}
          {primitiveRenderer(key, value)}
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div className="mb-2" key={String(key) + String(depth)}>
          {key && <div className="text-xs font-semibold text-muted-foreground">{key.toUpperCase()}</div>}
          <ul className="list-disc pl-5 text-sm space-y-1">
            {value.map((item: any, idx: number) => (
              <li key={idx}>
                {isPrimitive(item) ? safeText(item) : renderObject(null, item, depth + 1)}
              </li>
            ))}
          </ul>
        </div>
      )
    }

    return renderObject(key, value, depth)
  }

  const renderObject = (key: string | null, obj: any, depth = 0) => {
    const entries = Object.entries(obj || {})
    if (entries.length === 0) return null
    return (
      <div className="mb-3" key={String(key) + String(depth)}>
        {key && <div className="text-xs font-semibold text-muted-foreground mb-1">{key.toUpperCase()}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entries.map(([k, v]) => (
            <Card key={k} className="p-2">
              <CardHeader className="p-0 pb-1">
                <CardTitle className="text-sm font-medium">{k}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-1">
                {renderValue(k, v, depth + 1)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="text-sm text-muted-foreground">Research Summary</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(compactPreview)}>
            <Copy className="mr-2 h-4 w-4" /> Copy JSON
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowRaw(s => !s)}>
            {showRaw ? "Hide Raw" : "View Raw"}
          </Button>
        </div>
      </div>

      {showRaw ? (
        <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded">{compactPreview}</pre>
      ) : (
        <div>
          {isPrimitive(data) ? primitiveRenderer(null, data) : renderObject(null, data)}
        </div>
      )}
    </div>
  )
}
