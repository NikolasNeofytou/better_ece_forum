"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { 
  BookOpen, 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User,
  ClipboardList,
  ArrowLeft
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface CourseResource {
  id: string
  title: string
  description: string | null
  type: string
  year: number | null
  semester: string | null
  viewCount: number
  downloadCount: number
  createdAt: string
  uploader: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string | null
  maxPoints: number | null
}

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  semester: string | null
  year: number | null
  instructor: string | null
  resources: CourseResource[]
  assignments: Assignment[]
}

const resourceTypeLabels: Record<string, string> = {
  NOTES: "Notes",
  PAST_PAPER: "Past Paper",
  SOLUTION: "Solution",
  SLIDES: "Slides",
  TEXTBOOK: "Textbook",
  REFERENCE: "Reference",
  OTHER: "Other"
}

const resourceTypeColors: Record<string, string> = {
  NOTES: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  PAST_PAPER: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  SOLUTION: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  SLIDES: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  TEXTBOOK: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  REFERENCE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
}

export default function CoursePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"resources" | "assignments">("resources")

  useEffect(() => {
    if (code) {
      fetchCourse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/courses/${code}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch course")
      }

      const data = await response.json()
      setCourse(data.course)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error || "Course not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Link
        href="/courses"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <span className="font-mono text-sm font-semibold text-blue-600">
                {course.code}
              </span>
              {course.semester && course.year && (
                <span className="text-sm text-zinc-500 ml-2">
                  • {course.semester} {course.year}
                </span>
              )}
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          {course.name}
        </h1>

        {course.description && (
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {course.description}
          </p>
        )}

        {course.instructor && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <User className="w-4 h-4" />
            <span>{course.instructor}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("resources")}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "resources"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resources ({course.resources.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "assignments"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Assignments ({course.assignments.length})
            </div>
          </button>
        </div>
      </div>

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <div className="space-y-4">
          {course.resources.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <FileText className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">
                No resources available yet
              </p>
            </div>
          ) : (
            course.resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${resourceTypeColors[resource.type]}`}>
                        {resourceTypeLabels[resource.type] || resource.type}
                      </span>
                      {resource.year && resource.semester && (
                        <span className="text-xs text-zinc-500">
                          {resource.semester} {resource.year}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                        {resource.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {resource.viewCount} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {resource.downloadCount} downloads
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {resource.uploader.name || resource.uploader.username}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {course.assignments.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <ClipboardList className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">
                No assignments available yet
              </p>
            </div>
          ) : (
            course.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {assignment.title}
                  </h3>
                  {assignment.maxPoints && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-sm font-medium">
                      {assignment.maxPoints} points
                    </span>
                  )}
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {assignment.description}
                </p>

                {assignment.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
