"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  MessageSquare, 
  ThumbsUp,
  ArrowLeft,
  Tag
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Stats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalVotes: number
  newUsersThisMonth: number
  newPostsThisMonth: number
  activeUsersToday: number
}

interface TrendingPost {
  id: string
  title: string
  voteCount: number
  viewCount: number
  author: {
    id: string
    name: string | null
    username: string | null
  }
  category: {
    id: string
    name: string
    slug: string
  } | null
  _count: {
    comments: number
    votes: number
  }
}

interface PopularTag {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

export default function AnalyticsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [popularTags, setPopularTags] = useState<PopularTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalytics()
    }
  }, [status])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [statsRes, trendingRes, popularRes] = await Promise.all([
        fetch("/api/analytics/stats"),
        fetch("/api/analytics/trending?days=7"),
        fetch("/api/analytics/popular")
      ])

      if (!statsRes.ok || !trendingRes.ok || !popularRes.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const statsData = await statsRes.json()
      const trendingData = await trendingRes.json()
      const popularData = await popularRes.json()

      setStats(statsData.stats)
      setTrendingPosts(trendingData.posts)
      setPopularTags(popularData.tags)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Analytics Dashboard
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Insights and metrics for the forum (Admin only)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Users"
          value={stats?.totalUsers || 0}
          subValue={`+${stats?.newUsersThisMonth || 0} this month`}
          color="blue"
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          label="Total Posts"
          value={stats?.totalPosts || 0}
          subValue={`+${stats?.newPostsThisMonth || 0} this month`}
          color="green"
        />
        <StatCard
          icon={<MessageSquare className="w-6 h-6" />}
          label="Total Comments"
          value={stats?.totalComments || 0}
          subValue="All time"
          color="purple"
        />
        <StatCard
          icon={<ThumbsUp className="w-6 h-6" />}
          label="Total Votes"
          value={stats?.totalVotes || 0}
          subValue="All time"
          color="orange"
        />
      </div>

      {/* Active Users Today */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Active Users Today
          </h2>
        </div>
        <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {stats?.activeUsersToday || 0}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Users active in the last 24 hours
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trending Posts */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Trending Posts (Last 7 Days)
            </h2>
          </div>
          <div className="space-y-4">
            {trendingPosts.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">No trending posts yet</p>
            ) : (
              trendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-0"
                >
                  <Link
                    href={`/posts/${post.id}`}
                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                  >
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {post.voteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post._count.comments}
                    </span>
                    <span>👁️ {post.viewCount} views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Popular Tags
            </h2>
          </div>
          <div className="space-y-3">
            {popularTags.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">No tags yet</p>
            ) : (
              popularTags.slice(0, 10).map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between"
                >
                  <Link
                    href={`/tags/${tag.slug}`}
                    className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    #{tag.name}
                  </Link>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {tag._count.posts} posts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  subValue: string
  color: "blue" | "green" | "purple" | "orange"
}

function StatCard({ icon, label, value, subValue, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-500">{subValue}</p>
    </div>
  )
}
