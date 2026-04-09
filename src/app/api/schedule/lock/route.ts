import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  requireRole,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { lockDueEntries } from "@/lib/schedule-engine";

/**
 * POST /api/schedule/lock
 * Run the lock job — lock all entries within the lock-in window. PARENT only.
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

    // Run the lock job
    const lockedCount = await lockDueEntries(familyId);

    return jsonResponse({
      lockedCount,
      message: `Locked ${lockedCount} schedule entries`,
    });
  } catch (error: any) {
    console.error("Error locking schedule entries:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can lock schedule entries", 403);
    }
    return errorResponse(error.message || "Failed to lock schedule entries", 400);
  }
}
