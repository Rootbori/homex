CREATE TABLE IF NOT EXISTS auth_signup_sessions (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(80) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  store_id BIGINT REFERENCES stores(id),
  account_type VARCHAR(32) NOT NULL,
  provider VARCHAR(32) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_signup_session_user ON auth_signup_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_signup_session_store ON auth_signup_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_auth_signup_session_expires ON auth_signup_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_signup_session_consumed ON auth_signup_sessions(consumed_at);
