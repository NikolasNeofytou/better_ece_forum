import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for moderation actions
const moderationActionSchema = z.object({
  action: z.enum(["LOCK", "UNLOCK", "PIN", "UNPIN", "REMOVE", "RESTORE"]),
  targetType: z.enum(["POST", "COMMENT"]),
  targetId: z.string(),
  reason: z.string().optional(),
})

// POST /api/moderation - Perform moderation action (moderator/admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = moderationActionSchema.parse(body)

    // Perform moderation action based on target type
    if (validatedData.targetType === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: validatedData.targetId }
      })

      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        )
      }

      // Update post based on action
      const updateData: Record<string, boolean> = {}
      switch (validatedData.action) {
        case "LOCK":
          updateData.isLocked = true
          break
        case "UNLOCK":
          updateData.isLocked = false
          break
        case "PIN":
          updateData.isPinned = true
          break
        case "UNPIN":
          updateData.isPinned = false
          break
        case "REMOVE":
          updateData.isRemoved = true
          break
        case "RESTORE":
          updateData.isRemoved = false
          break
      }

      await prisma.post.update({
        where: { id: validatedData.targetId },
        data: updateData
      })
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: validatedData.targetId }
      })

      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        )
      }

      // Only REMOVE and RESTORE are applicable to comments
      if (validatedData.action !== "REMOVE" && validatedData.action !== "RESTORE") {
        return NextResponse.json(
          { error: "Invalid action for comment" },
          { status: 400 }
        )
      }

      await prisma.comment.update({
        where: { id: validatedData.targetId },
        data: {
          isRemoved: validatedData.action === "REMOVE"
        }
      })
    }

    // Log moderation action
    await prisma.moderationLog.create({
      data: {
        action: validatedData.action,
        reason: validatedData.reason || "",
        targetType: validatedData.targetType,
        targetId: validatedData.targetId,
        moderatorId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: `${validatedData.action} action performed successfully`
    })
  } catch (error) {
    console.error("Error performing moderation action:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to perform moderation action" },
      { status: 500 }
    )
  }
}

// GET /api/moderation - Get moderation logs (moderator/admin only)
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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.moderationLog.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          moderator: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        }
      }),
      prisma.moderationLog.count()
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching moderation logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch moderation logs" },
      { status: 500 }
    )
  }
}
