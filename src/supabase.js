import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://nhuigduybbsfiojrowiw.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odWlnZHV5YmJzZmlvanJvd2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NzgxNjUsImV4cCI6MjA5NzQ1NDE2NX0.ehJ-hvlPoOBSKh1PyQz4V5fwv32xsdotdbba-f6H7ZA"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)