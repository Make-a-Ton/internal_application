'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Using a new client for server actions to ensure fresh state and proper environment variable usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Using service role key to bypass RLS for server-side operations
const supabase = createClient(supabaseUrl, supabaseKey);

export async function submitProblemStatement(teamId: string, track: string, problemStatement: string, description: string) {

    // Check if problem statement is already submitted
    const { data: team, error: checkError } = await supabase
        .from('team')
        .select('problem_stat')
        .eq('id', teamId)
        .single();

    if (checkError) {
        console.error('Error verifying team status:', checkError);
        return { success: false, error: 'Failed to verify team status' };
    }

    if (team?.problem_stat) {
        return { success: false, error: 'Problem statement already submitted' };
    }

    const { error } = await supabase
        .from('team')
        .update({
            track,
            problem_stat: problemStatement,
            prob_desc: description
        })
        .eq('id', teamId);

    if (error) {
        console.error('Error updating problem statement:', error);
        return { success: false, error: error.message || 'Failed to submit problem statement' };
    }

    revalidatePath('/dashboard');
    return { success: true };
}


export async function getKireapTracks() {
    try {
        const { data, error } = await supabase
            .from('kireap_tracks')
            .select('*');

        if (error) {
            console.error('Error fetching Kireap tracks:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Unexpected error fetching Kireap tracks:', err);
        return [];
    }
}
