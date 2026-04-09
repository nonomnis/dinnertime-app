import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/families/[familyId]/members
 * List all family members with their roles
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { familyId } = params;

    // Verify user belongs to family
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return errorResponse("Family not found or access denied", 403);
    }

    // Get all active members
    const members = await prisma.familyMember.findMany({
      where: {
        familyId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return jsonResponse({
      members,
      count: members.length,
    });
  } catch (error: any) {
    console.error("Error fetching members:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch members", 400);
  }
}
