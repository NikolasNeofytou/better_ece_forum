import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for banning users
const banUserSchema = z.object({
  userId: z.string(),
  reason: z.string().min(10, "Ban reason must be at least 10 characters"),
  duration: z.number().optional(), // Duration in days, undefined = permanent
})

// POST /api/moderation/ban - Ban a user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = banUserSchema.parse(body)

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Cannot ban admins
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot ban administrators" },
        { status: 403 }
      )
    }

    // Calculate expiration date
    const expiresAt = validatedData.duration 
      ? new Date(Date.now() + validatedData.duration * 24 * 60 * 60 * 1000)
      : null

    // Create ban record
    const ban = await prisma.ban.create({
      data: {
        userId: validatedData.userId,
        reason: validatedData.reason,
        expiresAt,
        isPermanent: !validatedData.duration
      }
    })

    // Update user status
    await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        isBanned: true,
        bannedUntil: expiresAt
      }
    })

    // Log moderation action
    await prisma.moderationLog.create({
      data: {
        action: "BAN",
        reason: validatedData.reason,
        targetType: "USER",
        targetId: validatedData.userId,
        moderatorId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      ban,
      message: `User banned ${validatedData.duration ? `for ${validatedData.duration} days` : "permanently"}`
    }, { status: 201 })
  } catch (error) {
    console.error("Error banning user:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to ban user" },
      { status: 500 }
    )
  }
}

// DELETE /api/moderation/ban - Unban a user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    // Update user status
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedUntil: null
      }
    })

    // Log moderation action
    await prisma.moderationLog.create({
      data: {
        action: "UNBAN",
        reason: "Ban lifted by administrator",
        targetType: "USER",
        targetId: userId,
        moderatorId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "User unbanned successfully"
    })
  } catch (error) {
    console.error("Error unbanning user:", error)
    return NextResponse.json(
      { error: "Failed to unban user" },
      { status: 500 }
    )
  }
}
