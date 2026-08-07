// Using global fetch (available in Node 18+)

async function testAPI() {
    console.log("🧬 Starting Neural API Verification...");
    const baseUrl = "http://localhost:3002/api";
    const testEmail = `test_${Date.now()}@hub.ai`;
    const testPass = "password123";

    try {
        // 1. REGISTER
        console.log(`[1/4] Registering: ${testEmail}`);
        const regRes = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPass,
                firstName: "Test",
                lastName: "User",
                occupation: "Researcher"
            })
        });
        const regData = await regRes.json();
        if (!regData.token) throw new Error("Registration failed: " + JSON.stringify(regData));
        console.log("✅ Register SUCCESS");

        const token = regData.token;

        // 2. GET PROFILE
        console.log("[2/4] Fetching Profile...");
        const profRes = await fetch(`${baseUrl}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profData = await profRes.json();
        if (profData.email !== testEmail) throw new Error("Profile fetch failed");
        console.log("✅ Profile Sync SUCCESS");

        // 3. SAVE LIBRARY ITEM
        console.log("[3/4] Testing Library Save...");
        const libRes = await fetch(`${baseUrl}/library/save`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: "Quantum Neural Link",
                type: "lesson_summary",
                content: "Exploring the bridge between entanglement and synapses."
            })
        });
        const libData = await libRes.json();
        if (!libData.success) throw new Error("Library save failed");
        console.log("✅ Library Save SUCCESS");

        // 4. GET LIBRARY ITEMS
        console.log("[4/4] Fetching Library Items...");
        const getRes = await fetch(`${baseUrl}/library`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        const items = await getRes.json();
        if (items.length === 0) throw new Error("Library fetch failed");
        console.log(`✅ Library List SUCCESS: Found ${items.length} items`);

        console.log("\n🚀 NEURAL CORE API: 100% OPERATIONAL");
        process.exit(0);

    } catch (err: any) {
        console.error("\n❌ NEURAL API CRASHED:", err.message);
        process.exit(1);
    }
}

testAPI();
