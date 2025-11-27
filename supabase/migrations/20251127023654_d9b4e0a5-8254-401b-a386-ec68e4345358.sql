-- Make account_number have a default value so it's optional on insert
-- but still NOT NULL in the database
ALTER TABLE public.profiles
ALTER COLUMN account_number SET DEFAULT '';

-- The trigger will still set the actual value before insert