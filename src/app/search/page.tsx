"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Eye, TrendingUp, Search } from "lucide-react"

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

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = searchParams.get("q") || ""
  
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (queryParam && queryParam.length >= 2) {
      performSearch(queryParam, 1)
    }
  }, [queryParam])

  const performSearch = async (query: string, page: number) => {
    if (query.trim().length < 2) {
      setError("Search query must be at least 2 characters")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to search")
      }

      const data = await response.json()
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search posts")
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

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
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    })
  }

  const getExcerpt = (html: string, maxLength: number = 200) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, "gi")
    return text.replace(regex, "<mark class='bg-yellow-200 dark:bg-yellow-900/50'>$1</mark>")
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Search Posts
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for posts..."
                className="w-full pl-12 pr-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {queryParam && (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {isLoading ? "Searching..." : `Found ${pagination.total} result${pagination.total !== 1 ? "s" : ""} for "${queryParam}"`}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Search Results */}
        {!isLoading && queryParam && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  No posts found matching &quot;{queryParam}&quot;
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  Try different keywords or browse <Link href="/posts" className="text-blue-600 dark:text-blue-400 hover:underline">all posts</Link>
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="w-5 h-5 mb-1" />
                        <span className="text-sm font-medium">{post.voteCount}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/posts/${post.id}`}
                        className="block group"
                      >
                        <h2 
                          className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2"
                          dangerouslySetInnerHTML={{ __html: highlightText(post.title, queryParam) }}
                        />
                      </Link>

                      <p 
                        className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightText(getExcerpt(post.content), queryParam) }}
                      />

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
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => performSearch(queryParam, pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => performSearch(queryParam, pagination.page + 1)}
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
