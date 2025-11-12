"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, FileText, ClipboardList, Calendar, User } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Course {
  id: string
  code: string
  name: string
  description: string | null
  semester: string | null
  year: number | null
  instructor: string | null
  _count: {
    resources: number
    assignments: number
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/courses")
      
      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }

      const data = await response.json()
      setCourses(data.courses)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses")
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
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Courses
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Browse course materials, resources, and assignments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.code}`}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-sm font-semibold text-blue-600">
                  {course.code}
                </span>
              </div>
              {course.semester && course.year && (
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  {course.semester} {course.year}
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
              {course.name}
            </h3>

            {course.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                {course.description}
              </p>
            )}

            {course.instructor && (
              <div className="flex items-center gap-1 text-sm text-zinc-500 mb-4">
                <User className="w-4 h-4" />
                {course.instructor}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{course._count.resources} resources</span>
              </div>
              <div className="flex items-center gap-1">
                <ClipboardList className="w-4 h-4" />
                <span>{course._count.assignments} assignments</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            No courses available yet
          </p>
        </div>
      )}
    </div>
  )
}
