BEGIN;
DROP INDEX IF EXISTS idx_reservations_ticket_token_hash;
ALTER TABLE reservations
  DROP COLUMN IF EXISTS ticket_token_hash,
  DROP COLUMN IF EXISTS ticket_token_ciphertext,
  DROP COLUMN IF EXISTS ticket_token_expires_at;
COMMIT;
