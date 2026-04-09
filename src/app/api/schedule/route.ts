import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getWeekDates, getISOWeek } from "@/lib/utils";

/**
 * GET /api/schedule
 * Get schedule entries. Query: week (ISO week string), or month, or startDate+endDate range.
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
    const week = searchParams.get("week");
    const month = searchParams.get("month");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let whereClause: any = { familyId };

    if (week) {
      // ISO week format like "2026-W16"
      whereClause.week = week;
    } else if (month) {
      // Parse month like "2026-04"
      const [year, monthNum] = month.split("-").map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);
      end.setHours(23, 59, 59, 999);
      whereClause.date = {
        gte: start,
        lte: end,
      };
    } else if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      // Default: current week
      const isoWeek = getISOWeek(new Date());
      whereClause.week = isoWeek;
    }

    const entries = await prisma.scheduleEntry.findMany({
      where: whereClause,
      include: {
        foodOption: {
          select: {
            id: true,
            name: true,
            category: true,
            averageRating: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return jsonResponse({
      entries,
      count: entries.length,
    });
  } catch (error: any) {
    console.error("Error fetching schedule:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch schedule", 400);
  }
}
