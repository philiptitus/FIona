'use client'
import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Image, Quote, Code, Minus, RotateCcw, RotateCw,
  Subscript, Superscript, Indent, Outdent, Table
} from 'lucide-react'

interface AdvancedRichTextEditorProps {
  data: string
  onChange: (data: string) => void
  placeholder?: string
}

export default function AdvancedRichTextEditor({ data, onChange, placeholder }: AdvancedRichTextEditorProps) {
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

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3')
    const cols = prompt('Number of columns:', '3')
    if (rows && cols) {
      let table = '<table border="1" style="border-collapse: collapse; width: 100%;">'
      for (let i = 0; i < parseInt(rows); i++) {
        table += '<tr>'
        for (let j = 0; j < parseInt(cols); j++) {
          table += '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>'
        }
        table += '</tr>'
      }
      table += '</table>'
      execCommand('insertHTML', table)
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const changeFontSize = (size: string) => {
    execCommand('fontSize', size)
  }

  const changeFontFamily = (font: string) => {
    execCommand('fontName', font)
  }

  return (
    <div className="border rounded">
      {/* Toolbar */}
      <div className="border-b p-2 bg-gray-50 space-y-2">
        {/* Row 1: Text Formatting */}
        <div className="flex flex-wrap gap-1">
          <select 
            className="text-sm border rounded px-2 py-1"
            onChange={(e) => {
              if (e.target.value) {
                changeFontFamily(e.target.value)
                e.target.value = ''
              }
            }}
          >
            <option value="">Font</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
          </select>

          <select 
            className="text-sm border rounded px-2 py-1"
            onChange={(e) => {
              if (e.target.value) {
                changeFontSize(e.target.value)
                e.target.value = ''
              }
            }}
          >
            <option value="">Size</option>
            <option value="1">8pt</option>
            <option value="2">10pt</option>
            <option value="3">12pt</option>
            <option value="4">14pt</option>
            <option value="5">18pt</option>
            <option value="6">24pt</option>
            <option value="7">36pt</option>
          </select>

          <select 
            className="text-sm border rounded px-2 py-1"
            onChange={(e) => {
              if (e.target.value) {
                execCommand('formatBlock', e.target.value)
                e.target.value = ''
              }
            }}
          >
            <option value="">Format</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
            <option value="p">Paragraph</option>
            <option value="pre">Preformatted</option>
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('underline')}>
            <Underline className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('strikeThrough')}>
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('subscript')}>
            <Subscript className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('superscript')}>
            <Superscript className="h-4 w-4" />
          </Button>

          <input
            type="color"
            className="w-8 h-8 border rounded cursor-pointer"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            title="Text Color"
          />
          <input
            type="color"
            className="w-8 h-8 border rounded cursor-pointer"
            onChange={(e) => execCommand('backColor', e.target.value)}
            title="Background Color"
          />
        </div>

        {/* Row 2: Alignment & Lists */}
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('justifyLeft')}>
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('justifyCenter')}>
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('justifyRight')}>
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('justifyFull')}>
            <AlignJustify className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('indent')}>
            <Indent className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('outdent')}>
            <Outdent className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('insertHorizontalRule')}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'blockquote')}>
            <Quote className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'pre')}>
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Row 3: Insert & Actions */}
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={insertLink}>
            <Link className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertImage}>
            <Image className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertTable}>
            <Table className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('removeFormat')}>
            Clear Format
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('undo')}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => execCommand('redo')}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[300px] focus:outline-none"
        onInput={handleInput}
        data-placeholder={placeholder || 'Write your email content here...'}
        style={{
          minHeight: '300px'
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
        [contenteditable] h4 { font-size: 1.1em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] h5 { font-size: 1em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] h6 { font-size: 0.9em; font-weight: bold; margin: 0.5em 0; }
        [contenteditable] ul, [contenteditable] ol { margin: 0.5em 0; padding-left: 2em; }
        [contenteditable] blockquote { 
          margin: 1em 0; 
          padding: 0.5em 1em; 
          border-left: 4px solid #ccc; 
          background: #f9f9f9; 
        }
        [contenteditable] pre { 
          background: #f4f4f4; 
          padding: 1em; 
          border-radius: 4px; 
          overflow-x: auto; 
          font-family: monospace; 
        }
        [contenteditable] table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        [contenteditable] td, [contenteditable] th { 
          border: 1px solid #ccc; 
          padding: 8px; 
          text-align: left; 
        }
        [contenteditable] hr { margin: 1em 0; border: none; border-top: 1px solid #ccc; }
        [contenteditable] img { max-width: 100%; height: auto; }
      `}</style>
    </div>
  )
}