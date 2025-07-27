

fetch('http://localhost/notebooklm-clone/backend/chat.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ question: "What is AI?" })
})
  .then(async res => {
    const text = await res.text(); // Get raw text
    console.log("RAW RESPONSE:", text); // Print raw response for debugging

    try {
      const json = JSON.parse(text); // Try parsing
      console.log("✅ Parsed JSON:", json);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err.message);
    }
  })
  .catch(err => console.error("❌ Request failed:", err));
