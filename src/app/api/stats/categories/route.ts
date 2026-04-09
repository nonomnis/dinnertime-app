import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getCategoryDistribution } from "@/lib/stats-engine";

/**
 * GET /api/stats/categories
 * Category distribution. Query: days.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    // Get user's family
    const membership = await prisma.familyMember.findFirst({
      where: {
        userId: user.id,
        family: { isActive: true },
      },
    });

    if (!membership) {
      return errorResponse("User not in an active family", 403);
    }

    const familyId = membership.familyId;

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const days = searchParams.get("days");

    const dayLimit = days ? parseInt(days) : 30;

    // Get category distribution
    const distribution = await getCategoryDistribution(familyId, dayLimit);

    return jsonResponse({
      distribution,
      count: distribution.length,
      period: `${dayLimit} days`,
    });
  } catch (error: any) {
    console.error("Error fetching category stats:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch category stats", 400);
  }
}
