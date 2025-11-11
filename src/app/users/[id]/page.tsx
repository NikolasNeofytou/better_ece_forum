"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User as UserIcon, Calendar, MessageSquare, FileText, Award } from "lucide-react"

interface User {
  id: string
  name: string | null
  username: string | null
  image: string | null
  bio: string | null
  reputation: number
  role: string
  createdAt: string
  _count: {
    posts: number
    comments: number
  }
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
  category: Category | null
  tags: { tag: Tag }[]
  _count: {
    comments: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  post: {
    id: string
    title: string
  }
}

interface Activity {
  posts?: Post[]
  comments?: Comment[]
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [activity, setActivity] = useState<Activity>({})
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      setError("")

      try {
        const [userResponse, activityResponse] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/users/${params.id}/activity?type=all`)
        ])

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            throw new Error("User not found")
          }
          throw new Error("Failed to fetch user")
        }

        const userData = await userResponse.json()
        setUser(userData)

        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setActivity(activityData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })
  }

  const getExcerpt = (html: string, maxLength: number = 150) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string, label: string }> = {
      ADMIN: { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", label: "Admin" },
      MODERATOR: { color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300", label: "Moderator" },
      USER: { color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300", label: "Member" }
    }
    return badges[role] || badges.USER
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            Loading profile...
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "User not found"}</p>
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

  const roleBadge = getRoleBadge(user.role)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-24 h-24 rounded-full border-4 border-zinc-100 dark:border-zinc-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-zinc-400" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {user.name || user.username || "Anonymous User"}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>

              {user.username && (
                <p className="text-zinc-600 dark:text-zinc-400 mb-3">
                  @{user.username}
                </p>
              )}

              {user.bio && (
                <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Award className="w-4 h-4" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.reputation}</span>
                  <span>reputation</span>
                </div>

                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <FileText className="w-4 h-4" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user._count.posts}</span>
                  <span>{user._count.posts === 1 ? "post" : "posts"}</span>
                </div>

                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user._count.comments}</span>
                  <span>{user._count.comments === 1 ? "comment" : "comments"}</span>
                </div>

                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Tabs */}
        <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-4 px-1 font-medium border-b-2 transition-colors ${
                activeTab === "posts"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Posts ({activity.posts?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`pb-4 px-1 font-medium border-b-2 transition-colors ${
                activeTab === "comments"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Comments ({activity.comments?.length || 0})
            </button>
          </nav>
        </div>

        {/* Activity Content */}
        <div className="space-y-4">
          {activeTab === "posts" && (
            <>
              {!activity.posts || activity.posts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No posts yet
                  </p>
                </div>
              ) : (
                activity.posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
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

                    <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
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

                      <span>{post._count.comments} {post._count.comments === 1 ? "comment" : "comments"}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </article>
                ))
              )}
            </>
          )}

          {activeTab === "comments" && (
            <>
              {!activity.comments || activity.comments.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No comments yet
                  </p>
                </div>
              ) : (
                activity.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6"
                  >
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      Commented on{" "}
                      <Link
                        href={`/posts/${comment.post.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {comment.post.title}
                      </Link>
                    </div>

                    <div
                      className="prose prose-sm prose-zinc dark:prose-invert max-w-none mb-2"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />

                    <div className="text-sm text-zinc-500 dark:text-zinc-500">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
