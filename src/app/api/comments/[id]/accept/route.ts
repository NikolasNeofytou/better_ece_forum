import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

// POST /api/comments/[id]/accept - Mark comment as accepted answer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the comment and its associated post
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        post: {
          select: {
            id: true,
            authorId: true
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    // Only post author can accept answers
    if (comment.post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the post author can accept answers" },
        { status: 403 }
      )
    }

    // Cannot accept replies (only top-level comments)
    if (comment.parentId) {
      return NextResponse.json(
        { error: "Cannot accept a reply as answer" },
        { status: 400 }
      )
    }

    // Unmark any previously accepted answer on this post
    await prisma.comment.updateMany({
      where: {
        postId: comment.postId,
        isAccepted: true
      },
      data: {
        isAccepted: false
      }
    })

    // Mark this comment as accepted
    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: {
        isAccepted: true
      },
      include: {
        author: {
          select: {
            id: true
          }
        }
      }
    })

    // Award reputation bonus to answer author (15 points for accepted answer)
    await prisma.user.update({
      where: { id: updatedComment.author.id },
      data: {
        reputation: {
          increment: 15
        }
      }
    })

    return NextResponse.json({
      success: true,
      isAccepted: true
    })
  } catch (error) {
    console.error("Error accepting answer:", error)
    return NextResponse.json(
      { error: "Failed to accept answer" },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id]/accept - Unmark comment as accepted answer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the comment and its associated post
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        post: {
          select: {
            authorId: true
          }
        },
        author: {
          select: {
            id: true
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    // Only post author can unaccept answers
    if (comment.post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the post author can unaccept answers" },
        { status: 403 }
      )
    }

    // Unmark as accepted
    await prisma.comment.update({
      where: { id: params.id },
      data: {
        isAccepted: false
      }
    })

    // Remove reputation bonus from answer author
    await prisma.user.update({
      where: { id: comment.author.id },
      data: {
        reputation: {
          decrement: 15
        }
      }
    })

    return NextResponse.json({
      success: true,
      isAccepted: false
    })
  } catch (error) {
    console.error("Error unaccepting answer:", error)
    return NextResponse.json(
      { error: "Failed to unaccept answer" },
      { status: 500 }
    )
  }
}
