import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getOpenVotingSlots, castVote } from "@/lib/vote-engine";
import { z } from "zod";

const castVoteSchema = z.object({
  scheduleEntryId: z.string().min(1, "Schedule entry ID is required"),
  foodOptionId: z.string().min(1, "Food option ID is required"),
});

/**
 * GET /api/votes
 * Get open voting slots for the current family (beyond lock-in window)
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

    // Get open voting slots
    const slots = await getOpenVotingSlots(familyId);

    return jsonResponse({
      slots,
      count: slots.length,
    });
  } catch (error: any) {
    console.error("Error fetching voting slots:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch voting slots", 400);
  }
}

/**
 * POST /api/votes
 * Cast a vote. One vote per user per slot (upsert).
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { scheduleEntryId, foodOptionId } = await validateBody(castVoteSchema, body);

    // Cast vote
    await castVote(familyId, user.id, scheduleEntryId, foodOptionId);

    // Get updated vote tallies for this entry
    const votes = await prisma.vote.findMany({
      where: {
        scheduleEntryId,
        familyId,
      },
      include: {
        foodOption: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group by food option
    const tallies = new Map<string, any>();
    for (const vote of votes) {
      const key = vote.foodOptionId;
      if (!tallies.has(key)) {
        tallies.set(key, {
          foodOptionId: vote.foodOptionId,
          foodOptionName: vote.foodOption.name,
          voteCount: 0,
          voters: [],
        });
      }
      const tally = tallies.get(key);
      tally.voteCount += 1;
      tally.voters.push(vote.user.name || vote.user.id);
    }

    const tallyArray = Array.from(tallies.values()).sort((a, b) => b.voteCount - a.voteCount);

    return jsonResponse({
      message: "Vote cast successfully",
      tallies: tallyArray,
    }, 201);
  } catch (error: any) {
    console.error("Error casting vote:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message.includes("locked")) {
      return errorResponse(error.message, 400);
    }
    if (error.message.includes("lock-in window")) {
      return errorResponse(error.message, 400);
    }
    return errorResponse(error.message || "Failed to cast vote", 400);
  }
}
