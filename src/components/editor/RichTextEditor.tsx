"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import Mathematics from "@tiptap/extension-mathematics"
import { common, createLowlight } from "lowlight"
import "katex/dist/katex.min.css"
import { 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Heading2,
  Undo,
  Redo,
  LinkIcon,
  ImageIcon,
  Sigma
} from "lucide-react"
import { useState } from "react"

const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Write your post content...",
  editable = true 
}: RichTextEditorProps) {
  const [showLatexInput, setShowLatexInput] = useState(false)
  const [latexInput, setLatexInput] = useState("")
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-700 underline"
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg"
        }
      }),
      Mathematics,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3"
      }
    }
  })

  if (!editor) {
    return null
  }

  const setLink = () => {
    const url = window.prompt("Enter URL")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("bold") ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("italic") ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("code") ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("heading", { level: 2 }) ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Heading"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("bulletList") ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("orderedList") ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("blockquote") ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("codeBlock") ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
              editor.isActive("link") ? "bg-zinc-200 dark:bg-zinc-700" : ""
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={addImage}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowLatexInput(!showLatexInput)}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
            title="Add LaTeX Math"
          >
            <Sigma className="w-4 h-4" />
          </button>

          <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LaTeX Input Dialog */}
      {showLatexInput && editable && (
        <div className="mb-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
          <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
            Enter LaTeX Formula (use $ for inline, $$ for block):
          </label>
          <input
            type="text"
            value={latexInput}
            onChange={(e) => setLatexInput(e.target.value)}
            placeholder="E.g., $$E = mc^2$$ or $a^2 + b^2 = c^2$"
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm mb-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (latexInput.trim()) {
                  editor?.commands.insertContent(latexInput)
                  setLatexInput("")
                  setShowLatexInput(false)
                }
              }
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (latexInput.trim()) {
                  editor?.commands.insertContent(latexInput)
                  setLatexInput("")
                  setShowLatexInput(false)
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => {
                setLatexInput("")
                setShowLatexInput(false)
              }}
              className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            Examples: $$\int_0^\infty e{`^{-x}`}dx = 1$$, $\sum_{`{i=1}^n i`} = \frac{`{n(n+1)}`}{`{2}`}$
          </div>
        </div>
      )}
      
      <EditorContent editor={editor} />
    </div>
  )
}
