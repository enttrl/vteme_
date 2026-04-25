// 1) В Supabase открой: Project Settings → API
// 2) Замени значения ниже на свои Project URL и anon public key.
const SUPABASE_URL = 'https://tphqdjeordubhobwoouo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHFkamVvcmR1YmhvYndvb3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzI2OTcsImV4cCI6MjA5MjM0ODY5N30.yAGVQnL4g5Eqex0PEJm3fGtoqyYaf3eA070FaelF2Hw';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
