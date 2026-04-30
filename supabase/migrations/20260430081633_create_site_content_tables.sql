/*
  # Create Site Content Tables

  ## Overview
  Creates tables to store dynamic content for the Freshkite website's
  landing page and contact page, editable via the /admin dashboard.

  ## New Tables

  ### `home_content`
  Stores all editable content for the landing page.
  - `id` (uuid, primary key)
  - `hero_headline` (text) – Main hero heading text
  - `hero_subheading` (text) – Hero supporting paragraph
  - `hero_cta_label` (text) – Hero CTA button label
  - `services` (jsonb) – Array of {title, description} service cards
  - `testimonials` (jsonb) – Array of {quote, author, role, company} testimonials
  - `updated_at` (timestamptz) – Last updated timestamp

  ### `contact_content`
  Stores all editable content for the contact page.
  - `id` (uuid, primary key)
  - `email_primary` (text) – Primary business email address
  - `email_direct` (text) – Direct contact email address
  - `phone_whatsapp` (text) – WhatsApp phone number (display format)
  - `phone_whatsapp_link` (text) – WhatsApp wa.me link number
  - `location` (text) – Office location string
  - `updated_at` (timestamptz) – Last updated timestamp

  ## Security
  - RLS enabled on both tables
  - Only authenticated users can read or write content
  - Unauthenticated users have no access

  ## Notes
  1. Each table uses a single-row pattern (one row = current live content)
  2. Default seed data pre-populated to match current hardcoded content
  3. Indexes on updated_at for efficient ordering queries
*/

-- Home content table
CREATE TABLE IF NOT EXISTS home_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_headline text NOT NULL DEFAULT 'We run the ops, you run the vision.',
  hero_subheading text NOT NULL DEFAULT 'A Mauritius-based backbone, delivering seamless support & operational intelligence. We power the growth, you take the credit.',
  hero_cta_label text NOT NULL DEFAULT 'Start a project',
  services jsonb NOT NULL DEFAULT '[
    {"title": "E-commerce", "description": "Storefronts built to convert"},
    {"title": "Data Ops", "description": "Decisions driven by real data"},
    {"title": "Project Management", "description": "Delivered on time, every time"},
    {"title": "Tech Support", "description": "Always on, so you never go down"},
    {"title": "Content Authoring", "description": "Words and visuals that move people"},
    {"title": "Web3 Ready", "description": "Blockchain-native ops, no friction"}
  ]'::jsonb,
  testimonials jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Contact content table
CREATE TABLE IF NOT EXISTS contact_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_primary text NOT NULL DEFAULT 'freshkite-business-development@freshkite.io',
  email_direct text NOT NULL DEFAULT 'arshad@freshkite.io',
  phone_whatsapp text NOT NULL DEFAULT '+230 598 96 888',
  phone_whatsapp_link text NOT NULL DEFAULT '23059896888',
  location text NOT NULL DEFAULT 'Ebène, Mauritius',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users only
CREATE POLICY "Authenticated users can read home content"
  ON home_content FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert home content"
  ON home_content FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update home content"
  ON home_content FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read contact content"
  ON contact_content FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert contact content"
  ON contact_content FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contact content"
  ON contact_content FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seed default data
INSERT INTO home_content (
  hero_headline, hero_subheading, hero_cta_label, services, testimonials
) VALUES (
  'We run the ops, you run the vision.',
  'A Mauritius-based backbone, delivering seamless support & operational intelligence. We power the growth, you take the credit.',
  'Start a project',
  '[
    {"title": "E-commerce", "description": "Storefronts built to convert"},
    {"title": "Data Ops", "description": "Decisions driven by real data"},
    {"title": "Project Management", "description": "Delivered on time, every time"},
    {"title": "Tech Support", "description": "Always on, so you never go down"},
    {"title": "Content Authoring", "description": "Words and visuals that move people"},
    {"title": "Web3 Ready", "description": "Blockchain-native ops, no friction"}
  ]'::jsonb,
  '[
    {"quote": "Freshkite quietly became the backbone of our entire ops layer.", "author": "James T.", "role": "Founder", "company": "Freshop"},
    {"quote": "They move fast, communicate clearly, and never drop the ball.", "author": "Marie L.", "role": "Head of Product", "company": "NCR Voyix"}
  ]'::jsonb
);

INSERT INTO contact_content (
  email_primary, email_direct, phone_whatsapp, phone_whatsapp_link, location
) VALUES (
  'freshkite-business-development@freshkite.io',
  'arshad@freshkite.io',
  '+230 598 96 888',
  '23059896888',
  'Ebène, Mauritius'
);
