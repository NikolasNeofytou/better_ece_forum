import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

// GET /api/recommendations - Get personalized post recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")
    const postId = searchParams.get("postId") // For related posts

    // If getting related posts for a specific post
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          category: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      })

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 })
      }

      // Find related posts based on:
      // 1. Same category
      // 2. Shared tags
      // 3. Exclude current post

      const tagIds = post.tags.map(pt => pt.tag.id)

      const relatedPosts = await prisma.post.findMany({
        where: {
          published: true,
          isRemoved: false,
          id: { not: postId },
          OR: [
            {
              categoryId: post.categoryId
            },
            {
              tags: {
                some: {
                  tagId: {
                    in: tagIds
                  }
                }
              }
            }
          ]
        },
        take: limit,
        orderBy: [
          { voteCount: "desc" },
          { viewCount: "desc" }
        ],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true,
              votes: true
            }
          }
        }
      })

      return NextResponse.json({
        posts: relatedPosts,
        type: "related",
        basedOn: {
          postId: post.id,
          categoryId: post.categoryId,
          tags: post.tags.map(pt => pt.tag.name)
        }
      })
    }

    // If user is logged in, provide personalized recommendations
    if (session?.user) {
      // Get user's activity - posts they've voted on and categories they engage with
      const userActivity = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          votes: {
            where: {
              postId: { not: null }
            },
            include: {
              post: {
                include: {
                  category: true,
                  tags: {
                    include: {
                      tag: true
                    }
                  }
                }
              }
            },
            take: 20
          },
          posts: {
            include: {
              category: true,
              tags: {
                include: {
                  tag: true
                }
              }
            },
            take: 10
          }
        }
      })

      if (!userActivity) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Extract categories and tags user engages with
      const engagedCategories = new Set<string>()
      const engagedTags = new Set<string>()

      userActivity.votes.forEach(vote => {
        if (vote.post?.categoryId) {
          engagedCategories.add(vote.post.categoryId)
        }
        vote.post?.tags.forEach(pt => {
          engagedTags.add(pt.tag.id)
        })
      })

      userActivity.posts.forEach(post => {
        if (post.categoryId) {
          engagedCategories.add(post.categoryId)
        }
        post.tags.forEach(pt => {
          engagedTags.add(pt.tag.id)
        })
      })

      // Get recommended posts based on user's interests
      const recommendations = await prisma.post.findMany({
        where: {
          published: true,
          isRemoved: false,
          authorId: { not: session.user.id }, // Exclude own posts
          OR: [
            {
              categoryId: {
                in: Array.from(engagedCategories)
              }
            },
            {
              tags: {
                some: {
                  tagId: {
                    in: Array.from(engagedTags)
                  }
                }
              }
            }
          ]
        },
        take: limit,
        orderBy: [
          { voteCount: "desc" },
          { createdAt: "desc" }
        ],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              reputation: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true,
              votes: true
            }
          }
        }
      })

      return NextResponse.json({
        posts: recommendations,
        type: "personalized",
        basedOn: {
          categoriesCount: engagedCategories.size,
          tagsCount: engagedTags.size
        }
      })
    }

    // For non-logged-in users, return trending posts
    const trendingPosts = await prisma.post.findMany({
      where: {
        published: true,
        isRemoved: false,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      take: limit,
      orderBy: [
        { voteCount: "desc" },
        { viewCount: "desc" }
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            reputation: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    return NextResponse.json({
      posts: trendingPosts,
      type: "trending"
    })
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
}
