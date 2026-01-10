import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

// Types
export type FamilyRole = 'admin' | 'member';

export interface FamilyGroup {
  id: string;
  name: string;
  adminUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyGroupMember {
  id: string;
  familyGroupId: string;
  userId: string;
  role: FamilyRole;
  displayName: string;
  email?: string;
  createdAt: string;
  createdByUserId: string;
}

export interface DeletionRequest {
  id: string;
  familyGroupId: string;
  resourceType: 'transaction' | 'credit_card';
  resourceId: string;
  resourceName?: string;
  requestedByUserId: string;
  requesterName?: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface FamilyAccountResponse {
  group: FamilyGroup;
  members: FamilyGroupMember[];
  currentMember: FamilyGroupMember | null;
  role: FamilyRole | null;
  pendingDeletionCount: number;
}

interface FamilyContextType {
  familyGroup: FamilyGroup | null;
  members: FamilyGroupMember[];
  currentMember: FamilyGroupMember | null;
  role: FamilyRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  pendingDeletionCount: number;
  refetch: () => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { data: familyData, isLoading, refetch } = useQuery<FamilyAccountResponse>({
    queryKey: ["/api/family-account"],
    retry: false,
  });

  const value: FamilyContextType = {
    familyGroup: familyData?.group || null,
    members: familyData?.members || [],
    currentMember: familyData?.currentMember || null,
    role: familyData?.role || null,
    isAdmin: familyData?.role === 'admin',
    isLoading,
    pendingDeletionCount: familyData?.pendingDeletionCount || 0,
    refetch,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error("useFamily must be used within FamilyProvider");
  }
  return context;
}

// Helper hook for checking permissions
export function usePermissions() {
  const { isAdmin, currentMember } = useFamily();

  return {
    canEditTransaction: (createdByUserId?: string | null) => {
      if (isAdmin) return true;
      return createdByUserId === currentMember?.userId;
    },
    canDeleteTransaction: () => isAdmin,
    canEditCard: (createdByUserId?: string | null) => {
      if (isAdmin) return true;
      return createdByUserId === currentMember?.userId;
    },
    canDeleteCard: () => isAdmin,
    canManageCategories: () => isAdmin,
    canManageMembers: () => isAdmin,
    needsDeletionApproval: () => !isAdmin,
  };
}
