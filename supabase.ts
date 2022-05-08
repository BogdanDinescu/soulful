import AsyncStorage from '@react-native-async-storage/async-storage'
import {createClient} from '@supabase/supabase-js'

const supabaseUrl = 'https://yvrlgdkkplgkzcbnxnba.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cmxnZGtrcGxna3pjYm54bmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTIwNDIwOTMsImV4cCI6MTk2NzYxODA5M30.zzi0Qh4hIA2QwTNjrIDPXBbku3uQh-Kr8JRySOTYRoo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    localStorage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
})