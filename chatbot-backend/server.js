// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());  // Allow cross-origin requests (for development)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// POST endpoint to interact with GPT-4
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const chatbotReply = response.data.choices[0].message.content;
    res.json({ reply: chatbotReply });
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error);
    res.status(500).send("Error fetching response from OpenAI");
  }
});

const corsOptions = {
    origin: 'http://localhost:3000', // Make sure this matches the URL of your frontend
    methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
