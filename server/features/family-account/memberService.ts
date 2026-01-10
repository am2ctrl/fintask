import { supabase } from "../../core/infrastructure/supabase";
import { storage } from "../../core/infrastructure/supabaseStorage";

export interface CreateMemberInput {
  email: string;
  password: string;
  displayName: string;
  familyGroupId: string;
  adminUserId: string;
}

export interface ResetPasswordInput {
  memberId: string;
  newPassword: string;
  adminUserId: string;
}

const MAX_FAMILY_MEMBERS = 5; // 1 admin + 4 members

/**
 * Creates a new member account using Supabase Admin API.
 * The admin creates the credentials directly.
 */
export async function createMemberAccount(input: CreateMemberInput) {
  const { email, password, displayName, familyGroupId, adminUserId } = input;

  // Validate: Check member count
  const memberCount = await storage.countFamilyGroupMembers(familyGroupId);
  if (memberCount >= MAX_FAMILY_MEMBERS) {
    throw new Error(`Limite maximo de ${MAX_FAMILY_MEMBERS} membros atingido`);
  }

  // Validate: Check if email already exists
  const { data: existingUser } = await supabase.auth.admin.listUsers();
  const emailExists = existingUser?.users?.some(u => u.email === email);
  if (emailExists) {
    throw new Error("Este email ja esta em uso");
  }

  // Create user using Supabase Admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm since admin creates
    user_metadata: {
      name: displayName,
      family_group_id: familyGroupId,
      created_by: adminUserId,
    },
  });

  if (authError) {
    throw new Error(`Erro ao criar conta: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error("Erro ao criar conta: usuario nao retornado");
  }

  // Add to family_group_members table
  try {
    const member = await storage.addFamilyGroupMember({
      familyGroupId,
      userId: authData.user.id,
      role: "member",
      displayName,
      createdByUserId: adminUserId,
    });

    return member;
  } catch (error) {
    // Rollback: delete the auth user if member creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }
}

/**
 * Resets a member's password. Only admin can do this.
 */
export async function resetMemberPassword(input: ResetPasswordInput) {
  const { memberId, newPassword, adminUserId } = input;

  // Get member info
  const members = await storage.getFamilyGroupMembers(
    (await storage.getFamilyGroupByUserId(adminUserId))?.id || ""
  );

  const member = members.find(m => m.id === memberId);
  if (!member) {
    throw new Error("Membro nao encontrado");
  }

  // Verify admin owns this member's family group
  const familyGroup = await storage.getFamilyGroupById(member.familyGroupId);
  if (!familyGroup || familyGroup.adminUserId !== adminUserId) {
    throw new Error("Acesso nao autorizado");
  }

  // Cannot reset admin's own password this way
  if (member.role === "admin") {
    throw new Error("Nao e possivel redefinir a senha do administrador por este metodo");
  }

  // Reset password using admin API
  const { error } = await supabase.auth.admin.updateUserById(member.userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(`Erro ao redefinir senha: ${error.message}`);
  }

  return { success: true };
}

/**
 * Removes a member from the family group.
 * Also deletes their auth account.
 */
export async function removeMember(memberId: string, adminUserId: string) {
  // Get member info
  const familyGroup = await storage.getFamilyGroupByUserId(adminUserId);
  if (!familyGroup) {
    throw new Error("Grupo familiar nao encontrado");
  }

  const members = await storage.getFamilyGroupMembers(familyGroup.id);
  const member = members.find(m => m.id === memberId);

  if (!member) {
    throw new Error("Membro nao encontrado");
  }

  // Verify admin owns this member's family group
  if (familyGroup.adminUserId !== adminUserId) {
    throw new Error("Acesso nao autorizado");
  }

  // Cannot remove self (admin)
  if (member.role === "admin") {
    throw new Error("Nao e possivel remover o administrador do grupo");
  }

  // Remove from family_group_members
  await storage.removeFamilyGroupMember(memberId);

  // Delete the auth user
  const { error } = await supabase.auth.admin.deleteUser(member.userId);
  if (error) {
    console.error("Error deleting user from auth:", error);
    // Don't throw - member was already removed from group
  }

  return { success: true };
}
