import { supabase } from './src/db/client';

async function testInsert() {
    console.log("Testing database insert with new schema again...");
    const dbPayload = [{ fileUrl: 'https://example.com/test.png', fileType: 'IMAGE' }];
    
    const { data, error } = await supabase
        .from('triage_jobs')
        .insert([{ file_payloads: dbPayload, status: 'PENDING_AI' }])
        .select('id')
        .single();

    if (error) {
        console.error("❌ Database insert error:", JSON.stringify(error, null, 2));
    } else {
        console.log("✅ Database insert successful!", data);
    }
}
testInsert();
