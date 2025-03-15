// supabase.js
const { createClient } = require("@supabase/supabase-js");

// Use environment variables for the URL and the anon key
const SUPABASE_URL = "https://hwqkmfzdpsmyeuabszuy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cWttZnpkcHNteWV1YWJzenV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3OTg3MzksImV4cCI6MjA1NzM3NDczOX0.FIPhPECUpXISJ4Gpmxjy47n_9RKmoliAwdDTTzjPlQc";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase credentials are missing.");
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = { supabase };
