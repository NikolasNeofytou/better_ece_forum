import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for creating a report
const createReportSchema = z.object({
  reason: z.string().min(3, "Reason must be at least 3 characters").max(200),
  description: z.string().max(2000).optional(),
  targetType: z.enum(["post", "comment"]),
  targetId: z.string(),
})

// POST /api/reports - Create a new report
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createReportSchema.parse(body)

    // Verify target exists
    if (validatedData.targetType === "post") {
      const post = await prisma.post.findUnique({
        where: { id: validatedData.targetId },
        select: { id: true }
      })

      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        )
      }
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: validatedData.targetId },
        select: { id: true }
      })

      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        )
      }
    }

    // Check if user already reported this content
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        ...(validatedData.targetType === "post"
          ? { postId: validatedData.targetId }
          : { commentId: validatedData.targetId }
        )
      }
    })

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 409 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reason: validatedData.reason,
        description: validatedData.description,
        reporterId: session.user.id,
        ...(validatedData.targetType === "post"
          ? { postId: validatedData.targetId }
          : { commentId: validatedData.targetId }
        )
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}

// GET /api/reports - Get reports (moderator/admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is moderator or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "MODERATOR" && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Moderator access required" },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "PENDING"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: {
          status: status as "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED"
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true
                }
              }
            }
          },
          comment: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true
                }
              }
            }
          }
        }
      }),
      prisma.report.count({
        where: {
          status: status as "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED"
        }
      })
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}
