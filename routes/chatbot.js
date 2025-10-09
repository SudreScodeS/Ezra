const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Rota para enviar mensagem ao chatbot
router.post('/ask', async (req, res) => {
  try {
    const { message, history = [] } = req.body;  // History para contexto
    
    const chat = model.startChat({
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: 1, threshold: 3 },  // Harassment: BLOCK_MEDIUM_AND_ABOVE
      ],
    });
    
    const result = await chat.sendMessage(`Pergunta sobre mercado de trabalho: ${message}`);
    const response = result.response.text();
    
    // Adicionar à history (retornar para frontend manter estado)
    const newHistory = [...history, { role: 'user', text: message }, { role: 'model', text: response }];
    
    res.json({ response, history: newHistory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;