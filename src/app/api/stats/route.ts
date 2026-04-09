import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getDashboardSummary } from "@/lib/stats-engine";

/**
 * GET /api/stats
 * Get dashboard summary stats.
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

    // Get dashboard summary
    const summary = await getDashboardSummary(familyId);

    return jsonResponse({ summary });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch stats", 400);
  }
}
