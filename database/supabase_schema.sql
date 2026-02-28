-- =====================================================
-- LEGAL SAATHI - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- =====================================================

-- 1. PROFILES TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  district TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);


-- 2. DOCUMENT ANALYSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT, -- 'legal_notice', 'agreement', 'court_order', etc.
  original_text TEXT,
  simplified_text TEXT,
  key_points JSONB, -- Array of important points
  important_dates JSONB, -- Array of dates with descriptions
  recommended_actions JSONB, -- Array of suggested next steps
  document_url TEXT, -- Supabase storage URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;

-- Document analyses policies
CREATE POLICY "Users can view their own documents" 
  ON public.document_analyses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
  ON public.document_analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON public.document_analyses FOR DELETE 
  USING (auth.uid() = user_id);


-- 3. VOICE COMPLAINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.voice_complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  transcript TEXT NOT NULL,
  legal_category TEXT, -- 'land_dispute', 'family_law', 'criminal', etc.
  sub_category TEXT,
  suggested_steps JSONB, -- Array of next steps
  required_documents JSONB, -- Array of documents needed
  urgency_level TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.voice_complaints ENABLE ROW LEVEL SECURITY;

-- Voice complaints policies
CREATE POLICY "Users can view their own complaints" 
  ON public.voice_complaints FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own complaints" 
  ON public.voice_complaints FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints" 
  ON public.voice_complaints FOR UPDATE 
  USING (auth.uid() = user_id);


-- 4. LEGAL AID CENTERS TABLE (Admin managed)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.legal_aid_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  timings TEXT,
  services JSONB, -- Array of services offered
  google_maps_link TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (public read access)
ALTER TABLE public.legal_aid_centers ENABLE ROW LEVEL SECURITY;

-- Legal aid centers policies (public read)
CREATE POLICY "Anyone can view legal aid centers" 
  ON public.legal_aid_centers FOR SELECT 
  TO authenticated, anon
  USING (is_active = true);


-- 5. USER ACTIVITY LOG (for analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'document_upload', 'voice_complaint', 'search_legal_aid'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Activity logs policies
CREATE POLICY "Users can view their own activity" 
  ON public.activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for voice_complaints
CREATE TRIGGER update_voice_complaints_updated_at
  BEFORE UPDATE ON public.voice_complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================================================
-- AUTO-CREATE PROFILE TRIGGER
-- =====================================================
-- This trigger automatically creates a profile when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Sample legal aid centers
INSERT INTO public.legal_aid_centers (name, address, district, state, pincode, phone, services, google_maps_link) VALUES
('जिला विधिक सेवा प्राधिकरण लखनऊ', 'कलेक्ट्रेट परिसर, हजरतगंज', 'लखनऊ', 'उत्तर प्रदेश', '226001', '0522-2627552', '["मुफ्त कानूनी सलाह", "मुकदमा सहायता", "लोक अदालत"]', 'https://maps.google.com/?q=DLSA+Lucknow'),
('जिला विधिक सेवा प्राधिकरण वाराणसी', 'जिला न्यायालय परिसर, सिगरा', 'वाराणसी', 'उत्तर प्रदेश', '221002', '0542-2501665', '["मुफ्त कानूनी सलाह", "महिला सहायता", "SC/ST सहायता"]', 'https://maps.google.com/?q=DLSA+Varanasi'),
('जिला विधिक सेवा प्राधिकरण पटना', 'पटना उच्च न्यायालय परिसर', 'पटना', 'बिहार', '800001', '0612-2504456', '["मुफ्त कानूनी सलाह", "वरिष्ठ नागरिक सहायता"]', 'https://maps.google.com/?q=DLSA+Patna');


-- =====================================================
-- STORAGE BUCKET (Run separately in Storage settings)
-- =====================================================
-- Go to Storage in Supabase Dashboard and create:
-- Bucket name: documents
-- Public: false
-- Allowed MIME types: image/*, application/pdf


-- =====================================================
-- ENABLE GOOGLE AUTH (Do in Dashboard)
-- =====================================================
-- 1. Go to Authentication > Providers
-- 2. Enable Google
-- 3. Add your Google OAuth credentials
-- 4. Set redirect URL in Google Console: 
--    https://YOUR_PROJECT.supabase.co/auth/v1/callback
