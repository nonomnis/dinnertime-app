import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getVoteTallies } from "@/lib/vote-engine";

/**
 * GET /api/votes/[entryId]/tally
 * Get vote tallies for a specific schedule entry. Returns sorted list of food options with vote counts.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { entryId } = params;

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

    // Verify entry belongs to family
    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.familyId !== familyId) {
      return errorResponse("Schedule entry not found or access denied", 404);
    }

    // Get vote tallies
    const tallies = await getVoteTallies(familyId, entryId);

    return jsonResponse({
      entryId,
      tallies,
      winner: tallies.length > 0 ? tallies[0] : null,
      totalVotes: tallies.reduce((sum, t) => sum + t.voteCount, 0),
    });
  } catch (error: any) {
    console.error("Error fetching vote tally:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch vote tally", 400);
  }
}
