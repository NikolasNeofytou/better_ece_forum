"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Eye, TrendingUp, Search, Filter, X, Calendar } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

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
    votes: number
  }
}

export default function AdvancedSearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "recent")
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "")
  const [tagSlug, setTagSlug] = useState(searchParams.get("tag") || "")
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "")
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "")
  
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    // Load categories and tags
    loadFilters()
  }, [])

  useEffect(() => {
    // Perform search when params change
    const params = Object.fromEntries(searchParams.entries())
    if (Object.keys(params).length > 0) {
      performSearch()
    }
  }, [searchParams])

  const loadFilters = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/tags")
      ])

      if (categoriesRes.ok) {
        const catData = await categoriesRes.json()
        setCategories(catData.categories || [])
      }

      if (tagsRes.ok) {
        const tagData = await tagsRes.json()
        setTags(tagData.tags || [])
      }
    } catch (error) {
      console.error("Error loading filters:", error)
    }
  }

  const performSearch = async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("q", searchQuery)
      if (sortBy) params.append("sortBy", sortBy)
      if (categoryId) params.append("categoryId", categoryId)
      if (tagSlug) params.append("tag", tagSlug)
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)
      params.append("page", "1")
      params.append("limit", "10")

      const response = await fetch(`/api/search/advanced?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to search")
      }

      const data = await response.json()
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error searching:", error)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (searchQuery) params.append("q", searchQuery)
    if (sortBy) params.append("sortBy", sortBy)
    if (categoryId) params.append("categoryId", categoryId)
    if (tagSlug) params.append("tag", tagSlug)
    if (dateFrom) params.append("dateFrom", dateFrom)
    if (dateTo) params.append("dateTo", dateTo)

    router.push(`/search/advanced?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSortBy("recent")
    setCategoryId("")
    setTagSlug("")
    setDateFrom("")
    setDateTo("")
    router.push("/search/advanced")
  }

  const activeFiltersCount = [categoryId, tagSlug, dateFrom, dateTo].filter(Boolean).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Advanced Search
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Find exactly what you&apos;re looking for with powerful filters
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4 mb-8">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {activeFiltersCount > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="recent">Most Recent</option>
                  <option value="votes">Most Votes</option>
                  <option value="views">Most Views</option>
                  <option value="comments">Most Comments</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Tag
                </label>
                <select
                  value={tagSlug}
                  onChange={(e) => setTagSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">All Tags</option>
                  {tags.slice(0, 50).map((tag) => (
                    <option key={tag.id} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Date To */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Results */}
        <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : posts.length > 0 ? (
            <>
              <p className="mb-4">Found {pagination.total} results</p>
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                      {post.content.replace(/<[^>]*>/g, "").substring(0, 200)}...
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {post.voteCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post._count.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.viewCount}
                      </span>
                      {post.category && (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: post.category.color
                              ? `${post.category.color}20`
                              : "#3b82f620",
                            color: post.category.color || "#3b82f6"
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                      <span className="text-xs">
                        by {post.author.name || post.author.username}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">
                No results found. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
