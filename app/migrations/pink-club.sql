CREATE TABLE IF NOT EXISTS granny_backups (
 owner_hash text PRIMARY KEY, key_hash text NOT NULL UNIQUE, envelope text NOT NULL,
 recipes jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
-- next statement
CREATE TABLE IF NOT EXISTS granny_tickets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_hash text NOT NULL,
 fingerprint text NOT NULL, recipe jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_hash,fingerprint)
);
-- next statement
CREATE TABLE IF NOT EXISTS granny_ticket_opens (
 ticket_id uuid NOT NULL REFERENCES granny_tickets(id), viewer_hash text NOT NULL,
 opened_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(ticket_id,viewer_hash)
);
-- next statement
CREATE TABLE IF NOT EXISTS granny_month_entries (
 month date NOT NULL, ticket_id uuid NOT NULL REFERENCES granny_tickets(id),
 entered_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(month,ticket_id)
);
-- next statement
CREATE TABLE IF NOT EXISTS granny_month_picks (
 month date NOT NULL, slot smallint NOT NULL CHECK(slot BETWEEN 1 AND 3), ticket_id uuid NOT NULL,
 PRIMARY KEY(month,slot), UNIQUE(month,ticket_id),
 FOREIGN KEY(month,ticket_id) REFERENCES granny_month_entries(month,ticket_id)
);
-- next statement
CREATE TABLE IF NOT EXISTS granny_month_votes (
 month date NOT NULL, viewer_hash text NOT NULL, ticket_id uuid NOT NULL,
 PRIMARY KEY(month,viewer_hash), FOREIGN KEY(month,ticket_id) REFERENCES granny_month_picks(month,ticket_id)
);
