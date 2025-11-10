"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { common, createLowlight } from "lowlight"
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
  ImageIcon
} from "lucide-react"

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
      
      <EditorContent editor={editor} />
    </div>
  )
}
