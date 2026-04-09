import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
  requireRole,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { generateYearSchedule } from "@/lib/schedule-engine";
import { z } from "zod";

const generateScheduleSchema = z.object({
  weeks: z.number().int().min(1).max(52).optional(),
});

/**
 * POST /api/schedule/generate
 * Generate schedule. Calls schedule-engine generateYearSchedule. PARENT only.
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

    const body = await req.json();
    const { weeks } = await validateBody(generateScheduleSchema, body);

    const numWeeks = weeks || 52;

    // Generate schedule using the schedule engine
    const entries = await generateYearSchedule(familyId, new Date());

    return jsonResponse({
      entries: entries.slice(0, numWeeks * 7),
      count: Math.min(entries.length, numWeeks * 7),
      message: `Generated schedule for ${numWeeks} weeks`,
    }, 201);
  } catch (error: any) {
    console.error("Error generating schedule:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can generate schedules", 403);
    }
    return errorResponse(error.message || "Failed to generate schedule", 400);
  }
}
