"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, Edit, Trash2, Reply } from "lucide-react"

interface Author {
  id: string
  name: string | null
  username: string | null
  image: string | null
  reputation: number
}

interface Comment {
  id: string
  content: string
  voteCount: number
  createdAt: string
  updatedAt: string
  author: Author
  _count: {
    replies: number
  }
}

interface CommentItemProps {
  comment: Comment
  postId: string
  onReply?: (commentId: string) => void
  onEdit?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
  depth?: number
}

export function CommentItem({ 
  comment, 
  postId, 
  onReply, 
  onEdit, 
  onDelete,
  depth = 0 
}: CommentItemProps) {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<Comment[]>([])
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)

  const isAuthor = session?.user?.id === comment.author.id
  const maxDepth = 5 // Maximum nesting depth

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    })
  }

  const handleSaveEdit = async () => {
    if (editContent.trim() === comment.content.trim()) {
      setIsEditing(false)
      return
    }

    if (onEdit) {
      onEdit(comment.id, editContent.trim())
      setIsEditing(false)
    }
  }

  const loadReplies = async () => {
    if (replies.length > 0) {
      setShowReplies(!showReplies)
      return
    }

    setIsLoadingReplies(true)
    try {
      const response = await fetch(`/api/comments?postId=${postId}&parentId=${comment.id}`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data)
        setShowReplies(true)
      }
    } catch (error) {
      console.error("Error loading replies:", error)
    } finally {
      setIsLoadingReplies(false)
    }
  }

  return (
    <div className={`${depth > 0 ? "ml-8 mt-3" : ""}`}>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          {comment.author.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.author.image}
              alt={comment.author.name || "User"}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                {comment.author.name || comment.author.username || "Anonymous"}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                ({comment.author.reputation})
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                •
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-500">
                {formatDate(comment.createdAt)}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-xs text-zinc-500 dark:text-zinc-500 italic">
                  (edited)
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                    className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-sm prose-zinc dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            )}

            <div className="flex items-center gap-3 mt-3 text-sm">
              {!isEditing && depth < maxDepth && onReply && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}

              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this comment?")) {
                          onDelete(comment.id)
                        }
                      }}
                      className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </>
              )}

              {comment._count.replies > 0 && (
                <button
                  onClick={loadReplies}
                  disabled={isLoadingReplies}
                  className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {showReplies ? "Hide" : "Show"} {comment._count.replies}{" "}
                    {comment._count.replies === 1 ? "reply" : "replies"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render nested replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
