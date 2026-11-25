import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { GoogleGenerativeAI } from '@google/generative-ai';

// ES Modules mein __dirname nikalne ka tarika
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dotenv ko batayein ke .env file isi folder mein hai
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://ai-chatbot-blue-six.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env file.");
  process.exit(1);
}

mongoose.connect(URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.log("❌ Connection Error:", err));

// Message Schema
const messageSchema = new mongoose.Schema({
  userId: String,
  text: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

const genAI = new GoogleGenerativeAI(String(process.env.VITE_GEMINI_API));
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });


// Routes
app.post('/api/messages', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const chats = await Message.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message required hai" });
    }

    const safeHistory = Array.isArray(history) ? history : [];

    // Alternating user/model turns ensure karein aur history 'user' se shuru ho
    const normalizedHistory = [];
    for (const item of safeHistory) {
      if (!item || !item.role || !Array.isArray(item.parts) || item.parts.length === 0) {
        continue;
      }
      if (normalizedHistory.length === 0 && item.role !== 'user') {
        continue;
      }
      const last = normalizedHistory[normalizedHistory.length - 1];
      if (last && last.role === item.role) {
        // Same role consecutive aaye toh pichlay turn ke text mein merge kar dein
        last.parts[0].text += `\n${item.parts[0].text || ''}`;
      } else {
        normalizedHistory.push({
          role: item.role,
          parts: [{ text: String(item.parts[0].text || '') }]
        });
      }
    }

    // Chat history ka aakhri turn 'model' hona chahiye kyunki naya 'message' abhi 'user' send karega
    if (normalizedHistory.length > 0 && normalizedHistory[normalizedHistory.length - 1].role === 'user') {
      normalizedHistory.pop();
    }

    const chatSession = model.startChat({ history: normalizedHistory });
    const result = await chatSession.sendMessage(message);
    const aiText = result.response.text();

    res.json({ text: aiText });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      error: "AI respond nahi kar saka",
      details: error?.message || "Unknown error"
    });
  }
});


app.listen(5000, () => console.log(`🚀 Server running on port 5000`));

export default app;