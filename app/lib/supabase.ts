import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables. URL:', !!supabaseUrl, 'Key:', !!supabaseAnonKey);
}

// In Next.js dev, this might be called multiple times.
// We catch errors to prevent build-time crashes if URL is empty.
let supabaseClient;
try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
    console.error('Supabase client creation failed:', e);
}

export const supabase = supabaseClient!;

// PIN Mappings
export const PIN_AUTH_MAPPING: Record<string, { email: string; password: string; role: 'admin' | 'judge' | 'participant' }> = {
    '0000': { email: 'admin@makeaton.com', password: 'admin-password-123', role: 'admin' },
    '1001': { email: 'judge1@makeaton.com', password: 'judge1-password-123', role: 'judge' },
    '1002': { email: 'judge2@makeaton.com', password: 'judge2-password-123', role: 'judge' },
    '1003': { email: 'judge3@makeaton.com', password: 'judge3-password-123', role: 'judge' },
    'guest': { email: 'team@makeaton.com', password: 'team-password-123', role: 'participant' }
};

export const getAuthForPin = (pin: string) => {
    return PIN_AUTH_MAPPING[pin] || null;
};
