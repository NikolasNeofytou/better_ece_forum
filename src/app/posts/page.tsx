"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MessageSquare, Eye, TrendingUp } from "lucide-react"

interface Author {
  id: string
  name: string | null
  username: string | null
  image: string | null
  reputation: number
}

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  title: string
  content: string
  published: boolean
  viewCount: number
  voteCount: number
  createdAt: string
  author: Author
  category: Category | null
  tags: { tag: Tag }[]
  _count: {
    comments: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function PostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/posts?page=${pagination.page}&limit=${pagination.limit}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }

        const data = await response.json()
        setPosts(data.posts)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [pagination.page, pagination.limit])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    })
  }

  const getExcerpt = (html: string, maxLength: number = 200) => {
    // Strip HTML tags
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            Loading posts...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            All Posts
          </h1>
          {session && (
            <Link
              href="/posts/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Create Post
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                No posts yet. Be the first to create one!
              </p>
              {session && (
                <Link
                  href="/posts/new"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Create First Post
                </Link>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Vote/Stats Sidebar */}
                  <div className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <div className="flex flex-col items-center">
                      <TrendingUp className="w-5 h-5 mb-1" />
                      <span className="text-sm font-medium">{post.voteCount}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/posts/${post.id}`}
                      className="block group"
                    >
                      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
                      {getExcerpt(post.content)}
                    </p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map(({ tag }) => (
                          <Link
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            {tag.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <Link
                        href={`/users/${post.author.username || post.author.id}`}
                        className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        {post.author.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.author.image}
                            alt={post.author.name || "User"}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span>{post.author.name || post.author.username || "Anonymous"}</span>
                        <span className="text-xs">({post.author.reputation})</span>
                      </Link>

                      {post.category && (
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: post.category.color ? `${post.category.color}20` : undefined,
                            color: post.category.color || undefined
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post._count.comments}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.viewCount}</span>
                      </div>

                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
