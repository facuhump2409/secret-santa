-- Migration script for Supabase
-- Run this in your Supabase SQL Editor

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id BIGSERIAL PRIMARY KEY,
  participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  gift_description TEXT NOT NULL,
  gift_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clues table
CREATE TABLE IF NOT EXISTS clues (
  id BIGSERIAL PRIMARY KEY,
  participant_id BIGINT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  clue_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gifts_participant_id ON gifts(participant_id);
CREATE INDEX IF NOT EXISTS idx_clues_participant_id ON clues(participant_id);

-- Enable Row Level Security (RLS) - optional, adjust based on your needs
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your security needs)
-- If using service role key, these policies won't be enforced
CREATE POLICY "Allow all operations on participants" ON participants
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on gifts" ON gifts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on clues" ON clues
  FOR ALL USING (true) WITH CHECK (true);

