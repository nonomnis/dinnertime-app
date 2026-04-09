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

const updateMemberSchema = z.object({
  role: z.enum(["PARENT", "MEMBER"]).optional(),
  displayName: z.string().optional(),
  dietaryTags: z.array(z.string()).optional(),
});

/**
 * PATCH /api/families/[familyId]/members/[userId]
 * Update member (role, displayName, dietaryTags). PARENT only for role changes.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { familyId: string; userId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { familyId, userId } = params;

    // Verify current user is PARENT
    const currentMembership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!currentMembership) {
      return errorResponse("Family not found or access denied", 403);
    }

    const body = await req.json();
    const updates = await validateBody(updateMemberSchema, body);

    // If updating role, require PARENT
    if (updates.role) {
      await requireRole(currentMembership.id, "PARENT");
    }

    // Get target member
    const targetMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!targetMember) {
      return errorResponse("Member not found", 404);
    }

    const member = await prisma.familyMember.update({
      where: { id: targetMember.id },
      data: {
        ...(updates.role && { role: updates.role }),
        ...(updates.displayName && { displayName: updates.displayName }),
        ...(updates.dietaryTags && { dietaryTags: updates.dietaryTags }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return jsonResponse({ member, message: "Member updated successfully" });
  } catch (error: any) {
    console.error("Error updating member:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can change roles", 403);
    }
    return errorResponse(error.message || "Failed to update member", 400);
  }
}

/**
 * DELETE /api/families/[familyId]/members/[userId]
 * Remove member from family. PARENT only. Can't remove yourself if you're the only parent.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { familyId: string; userId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { familyId, userId } = params;

    // Verify current user is PARENT
    const currentMembership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!currentMembership) {
      return errorResponse("Family not found or access denied", 403);
    }

    await requireRole(currentMembership.id, "PARENT");

    // Get target member
    const targetMember = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (!targetMember) {
      return errorResponse("Member not found", 404);
    }

    // Check if target is the only PARENT and trying to remove themselves
    if (userId === user.id && targetMember.role === "PARENT") {
      const parentCount = await prisma.familyMember.count({
        where: {
          familyId,
          role: "PARENT",
          isActive: true,
        },
      });

      if (parentCount === 1) {
        return errorResponse("Cannot remove the only PARENT member from the family", 400);
      }
    }

    // Soft delete (deactivate)
    await prisma.familyMember.update({
      where: { id: targetMember.id },
      data: { isActive: false },
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

    return jsonResponse({ message: "Member removed from family" });
  } catch (error: any) {
    console.error("Error removing member:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can remove members", 403);
    }
    return errorResponse(error.message || "Failed to remove member", 400);
  }
}
