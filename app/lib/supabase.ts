import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to map PINs to Supabase Auth users (Hackathon Pattern)
// In a real app, use Edge Functions or custom auth.
// User must create these accounts in Supabase Auth dashboard.
export const PIN_AUTH_MAPPING: Record<string, { email: string; password: string; role: 'admin' | 'judge' | 'participant' }> = {
    // Admin
    '0000': { email: 'admin@makeaton.com', password: 'admin-password-123', role: 'admin' },

    // Judges
    '1001': { email: 'judge1@makeaton.com', password: 'judge1-password-123', role: 'judge' },
    '1002': { email: 'judge2@makeaton.com', password: 'judge2-password-123', role: 'judge' },
    '1003': { email: 'judge3@makeaton.com', password: 'judge3-password-123', role: 'judge' },

    // Default Participant (Team Rygtus)
    'guest': { email: 'team@makeaton.com', password: 'team-password-123', role: 'participant' }
};

export const getAuthForPin = (pin: string) => {
    return PIN_AUTH_MAPPING[pin] || null;
};
