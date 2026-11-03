const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Test the chatbot server
app.get("/", (req, res) => {
  res.send("Your Facebook Chatbot is running!");
});

// Facebook webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// Receive Facebook messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  if (req.body.object !== "page") return;

  for (const entry of req.body.entry || []) {
    for (const event of entry.messaging || []) {
      if (event.message && event.message.text) {
        const senderId = event.sender.id;
        const message = event.message.text;

        await sendMessage(senderId, "Hello! Welcome. How can I help you today?");
      }
    }
  }
});

// Send automatic replies
async function sendMessage(senderId, message) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: senderId },
          message: { text: message }
        })
      }
    );

    console.log("Facebook response:", await response.text());
  } catch (error) {
    console.error("Message error:", error);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Chatbot running on port " + PORT));
