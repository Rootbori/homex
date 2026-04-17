-- Rename customer_profiles table to user_profiles
ALTER TABLE customer_profiles RENAME TO user_profiles;

-- Rename columns in leads table
ALTER TABLE leads RENAME COLUMN customer_user_id TO user_id;

-- Rename columns in jobs table
ALTER TABLE jobs RENAME COLUMN customer_user_id TO user_id;

-- Rename columns in reviews table
ALTER TABLE reviews RENAME COLUMN customer_user_id TO user_id;

-- Rename indexes for consistency
ALTER INDEX idx_lead_customer_user RENAME TO idx_lead_user;
ALTER INDEX idx_job_customer_user RENAME TO idx_job_user;
ALTER INDEX idx_review_customer_user RENAME TO idx_review_user;
ALTER INDEX idx_customer_profile_store RENAME TO idx_user_profile_store;
ALTER INDEX idx_customer_profile_user RENAME TO idx_user_profile_user;

-- Update constraint name if needed
ALTER TABLE user_profiles RENAME CONSTRAINT uq_customer_profiles_store_user TO uq_user_profiles_store_user;
