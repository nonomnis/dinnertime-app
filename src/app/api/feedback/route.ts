import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { submitFeedback } from "@/lib/vote-engine";
import { z } from "zod";

const submitFeedbackSchema = z.object({
  scheduleEntryId: z.string().min(1, "Schedule entry ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  action: z.enum(["NONE", "VOTE_DOWN", "ENCORE"]).optional(),
  comment: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

/**
 * GET /api/feedback
 * Get pending feedback (meals served in last 48 hours without feedback from this user)
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

    // Get meals served in last 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const entries = await prisma.scheduleEntry.findMany({
      where: {
        familyId,
        date: {
          gte: twoDaysAgo,
          lte: new Date(),
        },
        type: "HOME_COOKED",
      },
      include: {
        foodOption: {
          select: {
            id: true,
            name: true,
            category: true,
            photoUrl: true,
          },
        },
      },
    });

    // Filter to entries without feedback from this user
    const pendingEntries = [];

    for (const entry of entries) {
      const existingFeedback = await prisma.mealFeedback.findUnique({
        where: {
          scheduleEntryId_userId: {
            scheduleEntryId: entry.id,
            userId: user.id,
          },
        },
      });

      if (!existingFeedback) {
        pendingEntries.push(entry);
      }
    }

    return jsonResponse({
      pendingEntries,
      count: pendingEntries.length,
    });
  } catch (error: any) {
    console.error("Error fetching pending feedback:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch pending feedback", 400);
  }
}

/**
 * POST /api/feedback
 * Submit feedback. Calls vote-engine submitFeedback.
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
    const { scheduleEntryId, rating, action, comment, photoUrl } =
      await validateBody(submitFeedbackSchema, body);

    // Submit feedback using vote engine
    await submitFeedback(
      familyId,
      user.id,
      scheduleEntryId,
      rating,
      action || "NONE",
      comment,
      photoUrl
    );

    // Get updated feedback
    const feedback = await prisma.mealFeedback.findUnique({
      where: {
        scheduleEntryId_userId: {
          scheduleEntryId,
          userId: user.id,
        },
      },
      include: {
        scheduleEntry: {
          include: {
            foodOption: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return jsonResponse({
      feedback,
      message: "Feedback submitted successfully",
    }, 201);
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message.includes("Rating must be")) {
      return errorResponse(error.message, 400);
    }
    return errorResponse(error.message || "Failed to submit feedback", 400);
  }
}
