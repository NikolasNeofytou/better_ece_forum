import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { ResourceType } from "@prisma/client"

// GET /api/resources - Get all course resources
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type") as ResourceType | null
    const courseId = searchParams.get("courseId") as string | null
    const skip = (page - 1) * limit

    const where: {
      isApproved: boolean
      type?: ResourceType
      courseId?: string
    } = {
      isApproved: true
    }

    if (type && Object.values(ResourceType).includes(type)) {
      where.type = type
    }
    if (courseId) {
      where.courseId = courseId
    }

    const [resources, total] = await Promise.all([
      prisma.courseResource.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { year: "desc" },
          { createdAt: "desc" }
        ],
        include: {
          course: {
            select: {
              id: true,
              code: true,
              name: true
            }
          },
          uploader: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        }
      }),
      prisma.courseResource.count({ where })
    ])

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Get resources error:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    )
  }
}

// POST /api/resources - Create new resource (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, type, courseId, content, fileUrl, year, semester } = body

    if (!title || !type || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const resource = await prisma.courseResource.create({
      data: {
        title,
        description,
        type,
        courseId,
        uploaderId: session.user.id,
        content,
        fileUrl,
        year,
        semester,
        isApproved: false // Resources need approval by default
      },
      include: {
        course: true,
        uploader: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({ resource }, { status: 201 })
  } catch (error) {
    console.error("Create resource error:", error)
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    )
  }
}
