import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(__dirname, '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    // Fix splitting for Windows and trimming keys/values
    envContent.split(/\r?\n/).forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
        }
    });

    console.log("Loaded keys:", Object.keys(env));
    const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error(`Missing credentials in .env.local at ${envPath}`);
        console.log("URL:", supabaseUrl ? "FOUND" : "MISSING");
        console.log("KEY:", supabaseKey ? "FOUND" : "MISSING");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function inspect() {
        console.log("Fetching kireap_tracks...");
        const { data: kireap, error: kErr } = await supabase.from('kireap_tracks').select('*').limit(1);
        if (kErr) console.error("Error fetching kireap_tracks:", kErr);
        else console.log("kireap_tracks sample:", kireap);

        console.log("Fetching team...");
        const { data: team, error: tErr } = await supabase.from('team').select('*').limit(1);
        if (tErr) console.error("Error fetching team:", tErr);
        else console.log("team sample:", team);
    }

    inspect();
} catch (e) {
    console.error("Error reading .env.local:", e);
}
