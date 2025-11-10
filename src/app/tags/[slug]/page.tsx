"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MessageSquare, Eye, TrendingUp, Tag as TagIcon } from "lucide-react"

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
  description: string | null
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

export default function TagPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession()
  const [tag, setTag] = useState<Tag | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError("")

      try {
        // Fetch all tags to find the one with this slug
        const tagsResponse = await fetch("/api/tags")
        if (!tagsResponse.ok) {
          throw new Error("Failed to fetch tags")
        }
        
        const tags = await tagsResponse.json()
        const foundTag = tags.find((t: Tag) => t.slug === params.slug)
        
        if (!foundTag) {
          throw new Error("Tag not found")
        }
        
        setTag(foundTag)

        // Fetch posts with this tag
        const postsResponse = await fetch(`/api/posts?tagId=${foundTag.id}`)
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch posts")
        }

        const postsData = await postsResponse.json()
        setPosts(postsData.posts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tag")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.slug])

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
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (error || !tag) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Tag not found"}</p>
            <Link
              href="/tags"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to tags
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/tags"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 inline-block"
        >
          ← Back to tags
        </Link>

        {/* Tag Header */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50 dark:bg-blue-900/20">
              <TagIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {tag.name}
              </h1>
              {tag.description && (
                <p className="text-zinc-600 dark:text-zinc-400">
                  {tag.description}
                </p>
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                {posts.length} {posts.length === 1 ? "post" : "posts"} tagged with {tag.name}
              </p>
            </div>

            {session && (
              <Link
                href="/posts/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Create Post
              </Link>
            )}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                No posts with this tag yet.
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
                      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
                      {getExcerpt(post.content)}
                    </p>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map(({ tag: postTag }) => (
                          <Link
                            key={postTag.id}
                            href={`/tags/${postTag.slug}`}
                            className={`px-2 py-1 text-xs rounded ${
                              postTag.slug === params.slug
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {postTag.name}
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
                        <span className="text-xs">({post.author.reputation})</span>
                      </Link>

                      {post.category && (
                        <Link
                          href={`/categories/${post.category.slug}`}
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: post.category.color ? `${post.category.color}20` : undefined,
                            color: post.category.color || undefined
                          }}
                        >
                          {post.category.name}
                        </Link>
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
      </div>
    </div>
  )
}
