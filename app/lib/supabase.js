import { createClient } from '@supabase/supabase-js';

// Use direct constants for reliability if the environment loading is failing
const SUPABASE_URL = 'https://ddpyqiuphhuecnhmfsjn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcHlxaXVwaGh1ZWNuaG1mc2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTcyNzEsImV4cCI6MjA4OTU3MzI3MX0.6mqISaD-_bTVE7fhEa3IPENJjSp1SnopjleoXu2Tt1s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
