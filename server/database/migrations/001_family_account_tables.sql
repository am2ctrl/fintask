-- Migration: Family Account System
-- Description: Creates tables for family groups, members, and deletion requests
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE NEW TABLES
-- ============================================

-- Family Groups table
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'Minha Familia',
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_admin_per_group UNIQUE (admin_user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_groups_admin ON family_groups(admin_user_id);

-- Family Group Members table
CREATE TABLE IF NOT EXISTS family_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'member')),
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),

  CONSTRAINT unique_user_per_group UNIQUE (family_group_id, user_id),
  CONSTRAINT unique_user_single_group UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_group_members_group ON family_group_members(family_group_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_user ON family_group_members(user_id);

-- Deletion Requests table
CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('transaction', 'credit_card')),
  resource_id UUID NOT NULL,
  requested_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  reviewed_by_user_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_group ON deletion_requests(family_group_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_requester ON deletion_requests(requested_by_user_id);

-- ============================================
-- 2. ALTER EXISTING TABLES
-- ============================================

-- Add columns to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS family_group_id UUID REFERENCES family_groups(id);

CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_family_group ON transactions(family_group_id);

-- Add columns to credit_cards table
ALTER TABLE credit_cards
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS family_group_id UUID REFERENCES family_groups(id);

CREATE INDEX IF NOT EXISTS idx_credit_cards_created_by ON credit_cards(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_credit_cards_family_group ON credit_cards(family_group_id);

-- Add columns to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS family_group_id UUID REFERENCES family_groups(id);

CREATE INDEX IF NOT EXISTS idx_categories_family_group ON categories(family_group_id);

-- Add columns to family_members table (existing table for transaction attribution)
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS family_group_id UUID REFERENCES family_groups(id);

CREATE INDEX IF NOT EXISTS idx_family_members_family_group ON family_members(family_group_id);

-- ============================================
-- 3. BACKFILL DATA FOR EXISTING USERS
-- ============================================

-- Create family groups for existing users who have transactions
INSERT INTO family_groups (admin_user_id, name)
SELECT DISTINCT user_id, 'Minha Familia'
FROM transactions
WHERE user_id IS NOT NULL
ON CONFLICT (admin_user_id) DO NOTHING;

-- Also create for users with credit cards but no transactions
INSERT INTO family_groups (admin_user_id, name)
SELECT DISTINCT user_id, 'Minha Familia'
FROM credit_cards
WHERE user_id IS NOT NULL
  AND user_id NOT IN (SELECT admin_user_id FROM family_groups)
ON CONFLICT (admin_user_id) DO NOTHING;

-- Add admins as members of their own groups
INSERT INTO family_group_members (family_group_id, user_id, role, display_name, created_by_user_id)
SELECT
  fg.id,
  fg.admin_user_id,
  'admin',
  COALESCE(au.raw_user_meta_data->>'name', au.email, 'Admin'),
  fg.admin_user_id
FROM family_groups fg
LEFT JOIN auth.users au ON au.id = fg.admin_user_id
ON CONFLICT (user_id) DO NOTHING;

-- Backfill transactions with created_by_user_id and family_group_id
UPDATE transactions t
SET
  created_by_user_id = COALESCE(t.created_by_user_id, t.user_id),
  family_group_id = (SELECT fg.id FROM family_groups fg WHERE fg.admin_user_id = t.user_id)
WHERE (created_by_user_id IS NULL OR family_group_id IS NULL) AND user_id IS NOT NULL;

-- Backfill credit_cards with created_by_user_id and family_group_id
UPDATE credit_cards c
SET
  created_by_user_id = COALESCE(c.created_by_user_id, c.user_id),
  family_group_id = (SELECT fg.id FROM family_groups fg WHERE fg.admin_user_id = c.user_id)
WHERE (created_by_user_id IS NULL OR family_group_id IS NULL) AND user_id IS NOT NULL;

-- Backfill categories with family_group_id
UPDATE categories c
SET family_group_id = (SELECT fg.id FROM family_groups fg WHERE fg.admin_user_id = c.user_id)
WHERE c.user_id IS NOT NULL AND c.family_group_id IS NULL;

-- Backfill family_members (transaction attribution) with family_group_id
UPDATE family_members fm
SET family_group_id = (SELECT fg.id FROM family_groups fg WHERE fg.admin_user_id = fm.user_id)
WHERE fm.family_group_id IS NULL AND fm.user_id IS NOT NULL;

-- ============================================
-- 4. ROW LEVEL SECURITY (Optional but recommended)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own family group
CREATE POLICY "Users can view own family group" ON family_groups
  FOR SELECT USING (
    admin_user_id = auth.uid()
    OR id IN (SELECT family_group_id FROM family_group_members WHERE user_id = auth.uid())
  );

-- Policy: Only admin can update family group
CREATE POLICY "Admin can update family group" ON family_groups
  FOR UPDATE USING (admin_user_id = auth.uid());

-- Policy: Users can see members of their family group
CREATE POLICY "Users can view family members" ON family_group_members
  FOR SELECT USING (
    family_group_id IN (
      SELECT fg.id FROM family_groups fg
      WHERE fg.admin_user_id = auth.uid()
      UNION
      SELECT fgm.family_group_id FROM family_group_members fgm
      WHERE fgm.user_id = auth.uid()
    )
  );

-- Policy: Only admin can manage members
CREATE POLICY "Admin can manage members" ON family_group_members
  FOR ALL USING (
    family_group_id IN (SELECT id FROM family_groups WHERE admin_user_id = auth.uid())
  );

-- Policy: Users can see deletion requests in their family
CREATE POLICY "Users can view deletion requests" ON deletion_requests
  FOR SELECT USING (
    family_group_id IN (
      SELECT fgm.family_group_id FROM family_group_members fgm
      WHERE fgm.user_id = auth.uid()
    )
  );

-- Policy: Users can create deletion requests
CREATE POLICY "Users can create deletion requests" ON deletion_requests
  FOR INSERT WITH CHECK (requested_by_user_id = auth.uid());

-- Policy: Admin can update deletion requests
CREATE POLICY "Admin can update deletion requests" ON deletion_requests
  FOR UPDATE USING (
    family_group_id IN (SELECT id FROM family_groups WHERE admin_user_id = auth.uid())
  );
