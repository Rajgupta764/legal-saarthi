# Supabase Setup Guide for Legal Saathi

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Project name**: legal-saathi
   - **Database Password**: (save this securely!)
   - **Region**: Select closest to your users (e.g., Mumbai)
4. Click "Create new project" and wait ~2 minutes

## Step 2: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values to your `.env` file:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

```env
# frontend/.env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Run Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New query"
3. Copy-paste the contents of `database/supabase_schema.sql`
4. Click "Run" (or Ctrl/Cmd + Enter)

This will create:
- `profiles` - User profiles
- `document_analyses` - Uploaded document analysis results
- `voice_complaints` - Voice complaints and classifications
- `legal_aid_centers` - Legal aid office directory
- `activity_logs` - User activity tracking

## Step 4: Enable Google Authentication

1. Go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Go to **APIs & Services** → **Credentials**
   - Create **OAuth 2.0 Client ID** (Web application)
   - Add authorized redirect URI:
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
   - Copy **Client ID** and **Client Secret** to Supabase

## Step 5: Set Up Storage (for document uploads)

1. Go to **Storage** in Supabase Dashboard
2. Click "Create a new bucket"
3. Settings:
   - **Name**: `documents`
   - **Public bucket**: OFF
   - **Allowed MIME types**: `image/*,application/pdf`
4. Create bucket

### Storage Policies:
Go to **Storage** → **documents** → **Policies** and add:

```sql
-- Allow users to upload their own documents
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 6: Test Your Setup

1. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open browser at `http://localhost:5173`
3. Click "अभी शुरू करें" → Try signing up
4. Check Supabase Dashboard:
   - **Authentication** → **Users** (should see new user)
   - **Table Editor** → **profiles** (should see profile)

## Environment Variables Summary

```env
# frontend/.env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Optional: Backend API URL (if using separate backend)
VITE_API_URL=http://localhost:5000
```

## Useful Supabase Dashboard Links

- **Table Editor**: View/edit your data
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users
- **Storage**: Manage uploaded files
- **Logs**: Debug issues

## Troubleshooting

### "Invalid API key"
- Check `.env` file has correct keys
- Restart dev server after changing `.env`

### "RLS policy violation"
- Check Row Level Security policies in SQL Editor
- Make sure user is authenticated

### Google login not working
- Verify redirect URL in Google Console matches Supabase
- Check Google OAuth credentials are correct

## Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
