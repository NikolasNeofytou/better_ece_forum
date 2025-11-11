import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for updating report status
const updateReportSchema = z.object({
  status: z.enum(["REVIEWING", "RESOLVED", "DISMISSED"]),
  action: z.enum(["REMOVE_CONTENT", "NONE"]).optional(),
})

// PATCH /api/reports/[id] - Update report status (moderator/admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const validatedData = updateReportSchema.parse(body)

    // Get the report
    const report = await prisma.report.findUnique({
      where: { id: (await params).id },
      include: {
        post: true,
        comment: true
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id: (await params).id },
      data: {
        status: validatedData.status,
        resolvedAt: validatedData.status === "RESOLVED" || validatedData.status === "DISMISSED" 
          ? new Date() 
          : null
      }
    })

    // If action is REMOVE_CONTENT, mark content as removed
    if (validatedData.action === "REMOVE_CONTENT") {
      if (report.postId) {
        await prisma.post.update({
          where: { id: report.postId },
          data: { isRemoved: true }
        })

        // Log moderation action
        await prisma.moderationLog.create({
          data: {
            action: "REMOVE",
            reason: `Removed due to report: ${report.reason}`,
            targetType: "POST",
            targetId: report.postId,
            moderatorId: session.user.id
          }
        })
      } else if (report.commentId) {
        await prisma.comment.update({
          where: { id: report.commentId },
          data: { isRemoved: true }
        })

        // Log moderation action
        await prisma.moderationLog.create({
          data: {
            action: "REMOVE",
            reason: `Removed due to report: ${report.reason}`,
            targetType: "COMMENT",
            targetId: report.commentId,
            moderatorId: session.user.id
          }
        })
      }
    }

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("Error updating report:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    )
  }
}
