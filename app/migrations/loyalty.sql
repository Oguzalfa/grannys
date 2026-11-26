CREATE TABLE loyalty_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  reward_lira integer NOT NULL CHECK (reward_lira BETWEEN 1 AND 10000)
);
-- next statement
CREATE TABLE loyalty_cards (
  owner_hash text PRIMARY KEY,
  stamps integer NOT NULL DEFAULT 0 CHECK (stamps >= 0)
);
-- next statement
CREATE TABLE loyalty_receipts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_day date NOT NULL DEFAULT (now() AT TIME ZONE 'Europe/Istanbul')::date,
  receipt_ref text NOT NULL,
  category text NOT NULL CHECK (category IN ('waffle','bowl','box','kumpir')),
  kind text NOT NULL CHECK (kind IN ('visit','reward')),
  code text NOT NULL UNIQUE DEFAULT upper(left(replace(gen_random_uuid()::text,'-',''),16)),
  issued_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  owner_hash text REFERENCES loyalty_cards(owner_hash),
  reward_lira integer NOT NULL,
  UNIQUE (business_day,receipt_ref)
);
-- next statement
CREATE TABLE loyalty_rewards (
  code text PRIMARY KEY DEFAULT upper(left(replace(gen_random_uuid()::text,'-',''),16)),
  owner_hash text NOT NULL REFERENCES loyalty_cards(owner_hash),
  earned_on bigint NOT NULL UNIQUE REFERENCES loyalty_receipts(id),
  redeemed_on bigint UNIQUE REFERENCES loyalty_receipts(id),
  amount integer NOT NULL
);
-- next statement
CREATE INDEX loyalty_receipts_card_idx ON loyalty_receipts(owner_hash,claimed_at);
-- next statement
CREATE INDEX loyalty_rewards_card_idx ON loyalty_rewards(owner_hash) WHERE redeemed_on IS NULL;
-- next statement
CREATE FUNCTION granny_claim(p_code text,p_owner text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE receipt loyalty_receipts%ROWTYPE; balance integer;
BEGIN
 SELECT * INTO receipt FROM loyalty_receipts WHERE code=p_code AND kind='visit' FOR UPDATE;
 IF NOT FOUND THEN RETURN 'invalid'; END IF;
 IF receipt.owner_hash=p_owner THEN RETURN 'already'; END IF;
 IF receipt.owner_hash IS NOT NULL THEN RETURN 'used'; END IF;
 IF receipt.issued_at < now()-interval '48 hours' THEN RETURN 'expired'; END IF;
 INSERT INTO loyalty_cards(owner_hash,stamps) VALUES(p_owner,1)
 ON CONFLICT(owner_hash) DO UPDATE SET stamps=loyalty_cards.stamps+1 RETURNING stamps INTO balance;
 UPDATE loyalty_receipts SET owner_hash=p_owner,claimed_at=now() WHERE id=receipt.id;
 IF balance%4=0 THEN
   INSERT INTO loyalty_rewards(owner_hash,earned_on,amount) VALUES(p_owner,receipt.id,receipt.reward_lira);
 END IF;
 RETURN 'ok';
END $$;
-- next statement
CREATE FUNCTION granny_redeem(p_code text,p_receipt text,p_category text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE gift loyalty_rewards%ROWTYPE; used_id bigint;
BEGIN
 IF p_category NOT IN ('waffle','bowl') THEN RETURN 'category'; END IF;
 SELECT * INTO gift FROM loyalty_rewards WHERE code=p_code FOR UPDATE;
 IF NOT FOUND THEN RETURN 'invalid'; END IF;
 IF gift.redeemed_on IS NOT NULL THEN
   IF EXISTS(SELECT 1 FROM loyalty_receipts WHERE id=gift.redeemed_on AND receipt_ref=p_receipt AND category=p_category AND business_day=(now() AT TIME ZONE 'Europe/Istanbul')::date) THEN RETURN 'already'; END IF;
   RETURN 'used';
 END IF;
 INSERT INTO loyalty_receipts(receipt_ref,category,kind,owner_hash,claimed_at,reward_lira)
 VALUES(p_receipt,p_category,'reward',gift.owner_hash,now(),gift.amount)
 ON CONFLICT (business_day,receipt_ref) DO NOTHING RETURNING id INTO used_id;
 IF used_id IS NULL THEN RETURN 'receipt'; END IF;
 UPDATE loyalty_rewards SET redeemed_on=used_id WHERE code=p_code;
 RETURN 'ok';
END $$;
