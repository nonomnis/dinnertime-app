import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getMemberParticipation } from "@/lib/stats-engine";

/**
 * GET /api/stats/participation
 * Member participation rates.
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

    // Get member participation
    const participation = await getMemberParticipation(familyId);

    // Calculate average participation metrics
    const totalVotes = participation.reduce((sum, m) => sum + m.voteCount, 0);
    const totalFeedback = participation.reduce((sum, m) => sum + m.feedbackCount, 0);
    const avgVotesPerMember = participation.length > 0 ? totalVotes / participation.length : 0;
    const avgFeedbackPerMember = participation.length > 0 ? totalFeedback / participation.length : 0;

    // Sort by vote count (descending)
    participation.sort((a, b) => b.voteCount - a.voteCount);

    return jsonResponse({
      participation,
      count: participation.length,
      averages: {
        votesPerMember: Math.round(avgVotesPerMember * 100) / 100,
        feedbackPerMember: Math.round(avgFeedbackPerMember * 100) / 100,
        totalVotes,
        totalFeedback,
      },
    });
  } catch (error: any) {
    console.error("Error fetching participation stats:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch participation stats", 400);
  }
}
