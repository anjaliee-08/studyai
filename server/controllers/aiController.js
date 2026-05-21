const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatHistory = require('../models/ChatHistory');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompts for each mode
const systemPrompts = {
  doubt: `You are a helpful study assistant. Answer student doubts clearly and 
          concisely. Use simple language, give examples where needed, and 
          encourage the student.`,

  concept: `You are an expert teacher. Explain concepts in a simple, structured 
            way. Use analogies, bullet points, and examples. Keep explanations 
            beginner-friendly.`,

  debug: `You are an expert programmer and debugger. Analyze the code provided, 
          identify bugs, explain what is wrong, and provide the corrected code 
          with a clear explanation.`,

  summary: `You are a smart note summarizer. Summarize the provided text into 
            clear, concise bullet points. Highlight the most important concepts 
            and key takeaways.`,

  quiz: `You are a quiz generator. Generate 5 multiple choice questions based 
         on the topic provided. Format each question exactly like this:
         Q1. [question]
         A) [option]  B) [option]  C) [option]  D) [option]
         Answer: [correct option letter]`
};

// Ask AI
exports.askAI = async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message) return res.status(400).json({ msg: 'Message is required' });

    const mode = type || 'doubt';
    const systemPrompt = systemPrompts[mode] || systemPrompts.doubt;

    // Get last 6 messages for context
    const history = await ChatHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(6);

    const pastMessages = history.reverse().map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.message }]
    }));

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build full prompt with system instruction + past context
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    // Start chat with history
    const chat = model.startChat({
      history: pastMessages,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    });

    // Send message
    const result = await chat.sendMessage(fullPrompt);
    const aiReply = result.response.text();

    // Save both messages to history
    await ChatHistory.create({
      userId: req.user.id,
      role: 'user',
      message,
      type: mode
    });
    await ChatHistory.create({
      userId: req.user.id,
      role: 'assistant',
      message: aiReply,
      type: mode
    });

    res.json({ reply: aiReply, type: mode });

  } catch (err) {
    console.error('Gemini AI Error:', err.message);
    res.status(500).json({ msg: 'AI service error', error: err.message });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(history.reverse());
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Clear chat history
exports.clearHistory = async (req, res) => {
  try {
    await ChatHistory.deleteMany({ userId: req.user.id });
    res.json({ msg: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};