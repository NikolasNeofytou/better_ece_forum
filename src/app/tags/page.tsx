"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Tag as TagIcon } from "lucide-react"

interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  _count: {
    posts: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      setError("")

      try {
        const url = searchQuery 
          ? `/api/tags?search=${encodeURIComponent(searchQuery)}`
          : "/api/tags"
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error("Failed to fetch tags")
        }

        const data = await response.json()
        setTags(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tags")
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchTags()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Tags
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Browse posts by tag
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
            className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-zinc-600 dark:text-zinc-400">
              Loading tags...
            </div>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              {searchQuery ? "No tags found matching your search." : "No tags available yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 hover:shadow-md transition-shadow flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {tag.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {tag._count.posts} {tag._count.posts === 1 ? "post" : "posts"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/posts"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Back to all posts
          </Link>
        </div>
      </div>
    </div>
  )
}
