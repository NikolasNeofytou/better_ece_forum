import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for voting
const voteSchema = z.object({
  value: z.number().int().min(-1).max(1), // -1 for downvote, 0 for remove, 1 for upvote
  targetType: z.enum(["post", "comment"]),
  targetId: z.string(),
})

// POST /api/votes - Create or update a vote
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
    const validatedData = voteSchema.parse(body)

    // Check if user is trying to vote on their own content
    if (validatedData.targetType === "post") {
      const post = await prisma.post.findUnique({
        where: { id: validatedData.targetId },
        select: { authorId: true }
      })

      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        )
      }

      if (post.authorId === session.user.id) {
        return NextResponse.json(
          { error: "Cannot vote on your own post" },
          { status: 403 }
        )
      }
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: validatedData.targetId },
        select: { authorId: true }
      })

      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        )
      }

      if (comment.authorId === session.user.id) {
        return NextResponse.json(
          { error: "Cannot vote on your own comment" },
          { status: 403 }
        )
      }
    }

    // Check for existing vote
    const whereClause = {
      userId: session.user.id,
      ...(validatedData.targetType === "post" 
        ? { postId: validatedData.targetId }
        : { commentId: validatedData.targetId }
      )
    }

    const existingVote = await prisma.vote.findFirst({
      where: whereClause
    })

    const oldValue = existingVote?.value || 0
    const newValue = validatedData.value

    if (validatedData.value === 0) {
      // Remove vote
      if (existingVote) {
        await prisma.vote.delete({
          where: { id: existingVote.id }
        })
      }
    } else if (existingVote) {
      // Update existing vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { value: validatedData.value }
      })
    } else {
      // Create new vote
      const voteData = {
        userId: session.user.id,
        value: validatedData.value,
        ...(validatedData.targetType === "post"
          ? { postId: validatedData.targetId }
          : { commentId: validatedData.targetId }
        )
      }
      await prisma.vote.create({
        data: voteData
      })
    }

    // Update vote count on target
    const voteDelta = newValue - oldValue

    if (validatedData.targetType === "post") {
      const updatedPost = await prisma.post.update({
        where: { id: validatedData.targetId },
        data: {
          voteCount: {
            increment: voteDelta
          }
        },
        select: {
          voteCount: true,
          authorId: true
        }
      })

      // Update author reputation (post votes are worth 5 points)
      await prisma.user.update({
        where: { id: updatedPost.authorId },
        data: {
          reputation: {
            increment: voteDelta * 5
          }
        }
      })

      return NextResponse.json({
        success: true,
        voteCount: updatedPost.voteCount,
        userVote: newValue
      })
    } else {
      const updatedComment = await prisma.comment.update({
        where: { id: validatedData.targetId },
        data: {
          voteCount: {
            increment: voteDelta
          }
        },
        select: {
          voteCount: true,
          authorId: true
        }
      })

      // Update author reputation (comment votes are worth 2 points)
      await prisma.user.update({
        where: { id: updatedComment.authorId },
        data: {
          reputation: {
            increment: voteDelta * 2
          }
        }
      })

      return NextResponse.json({
        success: true,
        voteCount: updatedComment.voteCount,
        userVote: newValue
      })
    }
  } catch (error) {
    console.error("Error voting:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    )
  }
}

// GET /api/votes - Get user's vote on a target
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ userVote: 0 })
    }

    const searchParams = request.nextUrl.searchParams
    const targetType = searchParams.get("targetType")
    const targetId = searchParams.get("targetId")

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "Missing targetType or targetId" },
        { status: 400 }
      )
    }

    const vote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        ...(targetType === "post"
          ? { postId: targetId }
          : { commentId: targetId }
        )
      },
      select: {
        value: true
      }
    })

    return NextResponse.json({
      userVote: vote?.value || 0
    })
  } catch (error) {
    console.error("Error fetching vote:", error)
    return NextResponse.json(
      { error: "Failed to fetch vote" },
      { status: 500 }
    )
  }
}
