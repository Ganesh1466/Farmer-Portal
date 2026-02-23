
// Simulate the checkProfileCompletion function from AuthContext.js
const checkProfileCompletion = (currentUser) => {
    if (!currentUser) return false;
    // Check for essential fields
    const requiredFields = ['name', 'phone', 'state', 'district', 'village'];

    console.log("Checking user:", currentUser.id);

    for (const field of requiredFields) {
        const val = currentUser[field];
        // Check if value is null, undefined, or empty string (trimmed)
        if (!val || val.toString().trim() === '') {
            console.log(`  - Missing or empty field: ${field} (Value: ${val})`);
            return false;
        }
    }
    console.log("  - Profile Complete!");
    return true;
};

// Test Cases
const testCases = [
    {
        id: "Empty User",
        user: {}
    },
    {
        id: "Partial User 1",
        user: { name: "John", phone: "1234567890" } // Missing address
    },
    {
        id: "Partial User 2",
        user: { name: "John", phone: "1234567890", state: "MH", district: "Pune" } // Missing village
    },
    {
        id: "Full User",
        user: { name: "John", phone: "1234567890", state: "MH", district: "Pune", village: "Kothrud" }
    },
    {
        id: "Whitespace User",
        user: { name: "John", phone: "   ", state: "MH", district: "Pune", village: "Kothrud" } // Invalid phone
    },
    {
        id: "Null Field User",
        user: { name: "John", phone: null, state: "MH", district: "Pune", village: "Kothrud" }
    }
];

console.log("--- STARTING PROFILE CHECK TESTS ---\n");

testCases.forEach(test => {
    const result = checkProfileCompletion(test.user);
    console.log(`Test '${test.id}': ${result ? "PASS" : "FAIL"}`);
    console.log("-----------------------------------");
});
