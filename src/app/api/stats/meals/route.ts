import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getMealStats } from "@/lib/stats-engine";

/**
 * GET /api/stats/meals
 * Meal frequency and rating stats. Query: days (30/90/365), foodOptionId (optional for single meal).
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
    const foodOptionId = searchParams.get("foodOptionId");

    // Filter stats by days if provided
    let stats = await getMealStats(familyId, foodOptionId || undefined);

    if (days) {
      const dayLimit = parseInt(days);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayLimit);

      // Filter to meals served within the day range
      stats = stats.filter((s) => {
        if (s.lastServed) {
          return new Date(s.lastServed) >= cutoffDate;
        }
        return true;
      });
    }

    // Sort by average rating (descending)
    stats.sort((a, b) => b.averageRating - a.averageRating);

    return jsonResponse({
      stats,
      count: stats.length,
      period: days ? `${days} days` : "all time",
    });
  } catch (error: any) {
    console.error("Error fetching meal stats:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch meal stats", 400);
  }
}
