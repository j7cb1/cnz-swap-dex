'use client'

import Editor from '@monaco-editor/react'
import { cn } from '@/utilities/shadcn'

type JsonEditorProps = {
  value: string
  onChange: (value: string) => void
  height?: string
  readOnly?: boolean
  className?: string
}

export function JsonEditor({
  value,
  onChange,
  height = '200px',
  readOnly = false,
  className,
}: JsonEditorProps) {
  return (
    <div className={cn('border rounded-md overflow-hidden', className)}>
      <Editor
        height={height}
        defaultLanguage="json"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly,
          fontSize: 13,
          lineNumbers: 'off',
          folding: false,
          tabSize: 2,
          automaticLayout: true,
          wordWrap: 'on',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'hidden',
          },
        }}
        theme="vs-dark"
      />
    </div>
  )
}
