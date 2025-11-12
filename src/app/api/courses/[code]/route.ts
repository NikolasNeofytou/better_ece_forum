import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/courses/[code] - Get course by code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    const course = await prisma.course.findUnique({
      where: { code },
      include: {
        resources: {
          where: {
            isApproved: true
          },
          orderBy: [
            { year: "desc" },
            { createdAt: "desc" }
          ],
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        },
        assignments: {
          where: {
            isPublished: true
          },
          orderBy: {
            dueDate: "asc"
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Get course error:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}
