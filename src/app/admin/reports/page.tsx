"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Flag, ChevronLeft, ChevronRight, Check, X, Eye } from "lucide-react"

interface Report {
  id: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  reporter: {
    id: string
    name: string | null
    username: string | null
  }
  post: {
    id: string
    title: string
    author: {
      name: string | null
      username: string | null
    }
  } | null
  comment: {
    id: string
    content: string
    author: {
      name: string | null
      username: string | null
    }
  } | null
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("PENDING")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?status=${selectedStatus}&page=${page}&limit=10`)
      
      if (!res.ok) {
        throw new Error("Failed to fetch reports")
      }

      const data = await res.json()
      setReports(data.reports)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedStatus, page])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchReports()
    }
  }, [session, fetchReports])

  const handleResolve = async (reportId: string, action: "RESOLVED" | "DISMISSED") => {
    setProcessingId(reportId)
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action })
      })

      if (res.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error("Error updating report:", error)
    } finally {
      setProcessingId(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
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
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Flag className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Content Reports
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Review and manage user-reported content
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status)
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <Flag className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            No {selectedStatus.toLowerCase()} reports found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                      {report.reason}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    Reported by{" "}
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {report.reporter.name || report.reporter.username}
                    </span>
                  </p>
                  {report.description && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                      {report.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Reported Content */}
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 mb-4">
                {report.post && (
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
                      REPORTED POST
                    </div>
                    <Link
                      href={`/posts/${report.post.id}`}
                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {report.post.title}
                    </Link>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      by {report.post.author.name || report.post.author.username}
                    </p>
                  </div>
                )}
                {report.comment && (
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
                      REPORTED COMMENT
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3">
                      {report.comment.content}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      by {report.comment.author.name || report.comment.author.username}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedStatus === "PENDING" || selectedStatus === "REVIEWING" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(report.id, "RESOLVED")}
                    disabled={processingId === report.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, "DISMISSED")}
                    disabled={processingId === report.id}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Dismiss
                  </button>
                  {report.post && (
                    <Link
                      href={`/posts/${report.post.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Post
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-sm text-zinc-500 dark:text-zinc-500">
                  Status: {report.status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
