import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrshtxvtpocvpjznqfnr.supabase.co'; 

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyc2h0eHZ0cG9jdnBqem5xZm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODM2ODMsImV4cCI6MjA4OTY1OTY4M30.BZlcXoPjWHcGEkq428sR8Gs9u8j-KDJvYUMSXc8-aFE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);