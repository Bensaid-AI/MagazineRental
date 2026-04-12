import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    "https://dckfhbalqpsqkmljprxh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRja2ZoYmFscXBzcWttbGpwcnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDI4ODksImV4cCI6MjA5MTQxODg4OX0.fm7XE1Kel_ZmxtE4RMDlJdDeWQ5Wpg_V6H4Ke5B7Zz8"
);
