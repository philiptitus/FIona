'use client'
import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, Link, Undo, Redo, Underline, AlignLeft, AlignCenter, AlignRight, ListOrdered, Type } from 'lucide-react'

interface CKEditorWrapperProps {
  data: string
  onChange: (data: string) => void
  placeholder?: string
}

export default function CKEditorWrapper({ data, onChange, placeholder }: CKEditorWrapperProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && data !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = data
    }
  }, [data])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  return (
    <div className="border rounded">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Text Formatting */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('bold')}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('italic')}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('underline')}>
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Headings */}
        <select 
          className="text-sm border rounded px-2 py-1"
          onChange={(e) => {
            if (e.target.value) {
              execCommand('formatBlock', e.target.value)
              e.target.value = ''
            }
          }}
        >
          <option value="">Heading</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Normal</option>
        </select>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Alignment */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('justifyLeft')}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('justifyCenter')}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('justifyRight')}>
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Lists */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertUnorderedList')}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertOrderedList')}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Link */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt('Enter URL:')
            if (url) execCommand('createLink', url)
          }}
        >
          <Link className="h-4 w-4" />
        </Button>
        
        {/* Text Color */}
        <input
          type="color"
          className="w-8 h-8 border rounded cursor-pointer"
          onChange={(e) => execCommand('foreColor', e.target.value)}
          title="Text Color"
        />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Undo/Redo */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('undo')}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('redo')}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[200px] focus:outline-none"
        onInput={handleInput}
        data-placeholder={placeholder || 'Write your email content here...'}
        style={{
          minHeight: '200px'
        }}
      />
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] h3 { font-size: 1.2em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] ul, [contenteditable] ol { margin: 0.5em 0; padding-left: 2em; }
      `}</style>
    </div>
  )
}