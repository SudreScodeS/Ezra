const express = require('express');
const Job = require('../models/Job');
const Interaction = require('../models/Interaction');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-exp' });

// Listar vagas com filtros
router.get('/', async (req, res) => {
  try {
    const { skill, localizacao } = req.query;
    let query = {};
    if (skill) query.requisitos = { $in: [new RegExp(skill, 'i')] };
    if (localizacao) query.localizacao = localizacao;
    const jobs = await Job.find(query);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recomendar vagas (usando IA)
router.get('/recommend', async (req, res) => {
  try {
    const user = req.user;  // Do middleware auth
    const userProfile = await User.findById(user.id).select('skills experiencia');
    
    // Prompt para Gemini
    const prompt = `Recomende 3 vagas baseadas no perfil: Skills: ${userProfile.skills.join(', ')}, Experiência: ${userProfile.experiencia}. Vagas disponíveis: [liste vagas fictícias ou reais do DB]. Retorne em JSON: [{titulo, descricao, match_score}].`;
    
    const result = await model.generateContent(prompt);
    const recommendations = JSON.parse(result.response.text());  // Parse JSON da resposta
    
    // Salvar interação
    recommendations.forEach(rec => {
      new Interaction({ userId: user.id, vagaId: null, interacao: `recomendou: ${rec.titulo}` }).save();
    });
    
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;