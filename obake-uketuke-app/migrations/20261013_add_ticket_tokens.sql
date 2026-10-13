BEGIN;

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS ticket_token_hash CHAR(64),
  ADD COLUMN IF NOT EXISTS ticket_token_ciphertext TEXT,
  ADD COLUMN IF NOT EXISTS ticket_token_expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_ticket_token_hash
  ON reservations(ticket_token_hash)
  WHERE ticket_token_hash IS NOT NULL;

COMMIT;

-- Rollback (only after deploying code that no longer reads these columns):
-- DROP INDEX IF EXISTS idx_reservations_ticket_token_hash;
-- ALTER TABLE reservations
--   DROP COLUMN IF EXISTS ticket_token_hash,
--   DROP COLUMN IF EXISTS ticket_token_ciphertext,
--   DROP COLUMN IF EXISTS ticket_token_expires_at;
