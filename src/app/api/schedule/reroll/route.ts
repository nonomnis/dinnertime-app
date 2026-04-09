import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  requireRole,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { rerollUnlockedWeeks } from "@/lib/schedule-engine";

/**
 * POST /api/schedule/reroll
 * Re-generate unlocked future schedule entries. PARENT only.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    // Get user's family and verify PARENT
    const membership = await prisma.familyMember.findFirst({
      where: {
        userId: user.id,
        family: { isActive: true },
      },
    });

    if (!membership) {
      return errorResponse("User not in an active family", 403);
    }

    await requireRole(membership.id, "PARENT");

    const familyId = membership.familyId;

    // Re-generate schedule from now
    const entries = await rerollUnlockedWeeks(familyId, new Date());

    return jsonResponse({
      entries,
      count: entries.length,
      message: "Schedule rerolled successfully",
    });
  } catch (error: any) {
    console.error("Error rerolling schedule:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can reroll schedules", 403);
    }
    return errorResponse(error.message || "Failed to reroll schedule", 400);
  }
}
