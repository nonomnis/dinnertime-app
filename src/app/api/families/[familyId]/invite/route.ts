import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
  requireRole,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const createInviteSchema = z.object({
  email: z.string().email().optional(),
});

/**
 * POST /api/families/[familyId]/invite
 * Generate invite. Creates Invite record with unique code, expires in 7 days. PARENT only.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { familyId } = params;

    // Verify user is PARENT
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return errorResponse("Family not found or access denied", 403);
    }

    await requireRole(membership.id, "PARENT");

    const body = await req.json();
    const { email } = await validateBody(createInviteSchema, body);

    // Generate unique invite code
    const code = crypto.randomBytes(12).toString("hex");

    // Create invite (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.invite.create({
      data: {
        familyId,
        createdById: user.id,
        code,
        email: email || undefined,
        expiresAt,
      },
    });

    // Generate invite link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/join?code=${code}`;

    return jsonResponse({
      invite,
      inviteLink,
      message: "Invite created successfully",
    }, 201);
  } catch (error: any) {
    console.error("Error creating invite:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can create invites", 403);
    }
    return errorResponse(error.message || "Failed to create invite", 400);
  }
}

/**
 * GET /api/families/[familyId]/invite
 * List pending invites for family. PARENT only.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { familyId } = params;

    // Verify user is PARENT
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return errorResponse("Family not found or access denied", 403);
    }

    await requireRole(membership.id, "PARENT");

    // Get pending invites
    const invites = await prisma.invite.findMany({
      where: {
        familyId,
        status: "PENDING",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add invite links
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const invitesWithLinks = invites.map((inv) => ({
      ...inv,
      inviteLink: `${baseUrl}/join?code=${inv.code}`,
    }));

    return jsonResponse({ invites: invitesWithLinks, count: invitesWithLinks.length });
  } catch (error: any) {
    console.error("Error fetching invites:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can view invites", 403);
    }
    return errorResponse(error.message || "Failed to fetch invites", 400);
  }
}
