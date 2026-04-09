import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const joinFamilySchema = z.object({
  code: z.string().min(1, "Invite code is required"),
});

/**
 * POST /api/families/[familyId]/join
 * Join family via invite code. Validates code, creates FamilyMember as MEMBER role.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { familyId } = params;

    const body = await req.json();
    const { code } = await validateBody(joinFamilySchema, body);

    // Find and validate invite
    const invite = await prisma.invite.findUnique({
      where: { code },
    });

    if (!invite) {
      return errorResponse("Invalid invite code", 404);
    }

    if (invite.familyId !== familyId) {
      return errorResponse("Invite code does not match this family", 400);
    }

    if (invite.status !== "PENDING") {
      return errorResponse("This invite is no longer valid", 400);
    }

    if (new Date() > invite.expiresAt) {
      return errorResponse("This invite has expired", 400);
    }

    // Check if user already a member
    const existingMembership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      return errorResponse("You are already a member of this family", 400);
    }

    // Create membership as MEMBER
    const member = await prisma.familyMember.create({
      data: {
        familyId,
        userId: user.id,
        role: "MEMBER",
      },
    });

    // Update invite status to ACCEPTED
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    // Update family member count
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: { where: { isActive: true } },
      },
    });

    if (family) {
      await prisma.family.update({
        where: { id: familyId },
        data: { memberCount: family.members.length },
      });
    }

    return jsonResponse({
      member,
      message: "Successfully joined family",
    }, 201);
  } catch (error: any) {
    console.error("Error joining family:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to join family", 400);
  }
}
