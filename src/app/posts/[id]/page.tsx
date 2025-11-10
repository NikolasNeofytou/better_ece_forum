"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Eye, Edit, Trash2 } from "lucide-react"
import { CommentItem } from "@/components/comments/CommentItem"
import { CommentForm } from "@/components/comments/CommentForm"
import { VoteButtons } from "@/components/voting/VoteButtons"

interface Author {
  id: string
  name: string | null
  username: string | null
  image: string | null
  reputation: number
  role: string
}

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
  icon: string | null
}

interface Tag {
  id: string
  name: string
  slug: string
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

interface Post {
  id: string
  title: string
  content: string
  published: boolean
  viewCount: number
  voteCount: number
  createdAt: string
  updatedAt: string
  author: Author
  category: Category | null
  tags: { tag: Tag }[]
  comments: Comment[]
  _count: {
    comments: number
  }
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null)

  const refreshComments = async () => {
    if (!post) return
    
    try {
      const response = await fetch(`/api/posts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    } catch (error) {
      console.error("Error refreshing comments:", error)
    }
  }

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/posts/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Post not found")
          }
          throw new Error("Failed to fetch post")
        }

        const data = await response.json()
        setPost(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      router.push("/posts")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete post")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            Loading post...
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Post not found"}</p>
            <Link
              href="/posts"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to posts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isAuthor = session?.user?.id === post.author.id

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/posts"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 inline-block"
        >
          ← Back to all posts
        </Link>

        {/* Post Header */}
        <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="flex gap-6">
              {/* Vote Buttons */}
              <div className="flex-shrink-0">
                <VoteButtons
                  targetType="post"
                  targetId={post.id}
                  initialVoteCount={post.voteCount}
                />
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                {post.title}
              </h1>
              
              {isAuthor && (
                <div className="flex gap-2">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Edit post"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                    title="Delete post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              <Link
                href={`/users/${post.author.username || post.author.id}`}
                className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {post.author.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author.image}
                    alt={post.author.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{post.author.name || post.author.username || "Anonymous"}</div>
                  <div className="text-xs">{post.author.reputation} reputation</div>
                </div>
              </Link>

              {post.category && (
                <Link
                  href={`/categories/${post.category.slug}`}
                  className="px-3 py-1 rounded text-sm font-medium hover:opacity-80"
                  style={{
                    backgroundColor: post.category.color ? `${post.category.color}20` : undefined,
                    color: post.category.color || undefined
                  }}
                >
                  {post.category.name}
                </Link>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount} views</span>
                </div>

                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post._count.comments} comments</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Post Content */}
            <div 
              className="prose prose-zinc dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Footer */}
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-500">
              <div>Posted {formatDate(post.createdAt)}</div>
              {post.updatedAt !== post.createdAt && (
                <div>Last edited {formatDate(post.updatedAt)}</div>
              )}
            </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Comments ({post._count.comments})
          </h2>

          {/* Comment Form */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Add a Comment
            </h3>
            <CommentForm 
              postId={post.id} 
              onSuccess={refreshComments}
            />
          </div>

          {/* Reply Form (if replying to a comment) */}
          {replyToCommentId && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Reply to Comment
              </h3>
              <CommentForm 
                postId={post.id} 
                parentId={replyToCommentId}
                onSuccess={() => {
                  refreshComments()
                  setReplyToCommentId(null)
                }}
                onCancel={() => setReplyToCommentId(null)}
                placeholder="Write your reply..."
              />
            </div>
          )}

          {/* Comments List */}
          {post.comments.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  onReply={(commentId) => setReplyToCommentId(commentId)}
                  onEdit={async (commentId, content) => {
                    try {
                      const response = await fetch(`/api/comments/${commentId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content })
                      })
                      if (response.ok) {
                        refreshComments()
                      }
                    } catch (error) {
                      console.error("Error editing comment:", error)
                    }
                  }}
                  onDelete={async (commentId) => {
                    try {
                      const response = await fetch(`/api/comments/${commentId}`, {
                        method: "DELETE"
                      })
                      if (response.ok) {
                        refreshComments()
                      }
                    } catch (error) {
                      console.error("Error deleting comment:", error)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
