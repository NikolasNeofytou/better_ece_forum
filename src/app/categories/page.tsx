"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Folder } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  icon: string | null
  _count: {
    posts: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch("/api/categories")
        
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }

        const data = await response.json()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            Loading categories...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Categories
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Browse posts by category
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              No categories available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: category.color ? `${category.color}20` : "#f4f4f5"
                    }}
                  >
                    {category.icon ? (
                      <span className="text-2xl">{category.icon}</span>
                    ) : (
                      <Folder
                        className="w-6 h-6"
                        style={{ color: category.color || "#71717a" }}
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-lg font-semibold mb-1 group-hover:opacity-80"
                      style={{ color: category.color || undefined }}
                    >
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                        {category.description}
                      </p>
                    )}
                    <div className="text-sm text-zinc-500 dark:text-zinc-500">
                      {category._count.posts} {category._count.posts === 1 ? "post" : "posts"}
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
