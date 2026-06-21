import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mraumelxfzanzsrxkpzv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYXVtZWx4ZnphbnpzcnhrcHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDc5NDYsImV4cCI6MjA5NTk4Mzk0Nn0.QA_LaEmlp9vR60-ITDwAl-2Fz7Vt4Ye09Y5WTpGGvHs'

console.log('Supabase URL:', SUPABASE_URL)
console.log('Supabase KEY:', SUPABASE_ANON_KEY?.slice(0, 20))

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)