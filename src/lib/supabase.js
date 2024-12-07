import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ldeeavwkdrnqflhhsyyd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZWVhdndrZHJucWZsaGhzeXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NzQyODAsImV4cCI6MjA0OTE1MDI4MH0.Y0i7gPXnx-i4_xWJWNYnlOy0Ac24kZYStGwy1qzOpso'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
