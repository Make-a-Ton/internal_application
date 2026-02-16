import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const { judgeName, pin } = await req.json();

    if (!judgeName || !pin) {
        return NextResponse.json({ success: false, error: "Missing name or PIN" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("judges")
        .select("id, name")
        .ilike("name", judgeName)
        .eq("pin", pin)
        .maybeSingle();

    if (error || !data) {
        return NextResponse.json({ success: false, error: "Invalid judge name or PIN" }, { status: 401 });
    }

    return NextResponse.json({ success: true, judge: { id: data.id, name: data.name } });
}
