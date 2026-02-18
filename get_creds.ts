import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(__dirname, '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1]] = match[2].replace(/^"|"$/g, '');
        }
    });

    const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing credentials");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function fetchCreds() {
        console.log("Fetching team...");
        // Fetch a team that hasn't submitted a problem statement yet if possible
        const { data: teams, error } = await supabase
            .from('team')
            .select('name, password, problem_stat')
            .is('problem_stat', null)
            .limit(1);

        if (error) {
            console.error("Error:", error);
        } else if (teams && teams.length > 0) {
            console.log("CREDENTIALS:", JSON.stringify(teams[0]));
        } else {
            console.log("No teams found without problem statement? Fetching any team...");
            const { data: anyTeam } = await supabase.from('team').select('name, password').limit(1);
            console.log("CREDENTIALS:", JSON.stringify(anyTeam?.[0]));
        }
    }

    fetchCreds();
} catch (e) {
    console.error(e);
}
