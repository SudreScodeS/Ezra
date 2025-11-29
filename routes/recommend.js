
const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Job = require('../models/Job');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userId = req.body.userId;

    // ✓ LOG 1: Received userId
    console.log("=== RECOMMEND ROUTE STARTED ===");
    console.log("📍 ID recebido pelo recommend:", userId);

    // ✓ Validate ObjectId format
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      console.log("❌ Invalid userId format:", userId);
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // ✓ LOG 2: Querying User
    console.log("🔍 Buscando usuário no banco...");
    const user = await User.findById(userId).select('skills experiencia');

    if (!user) {
      console.log("❌ User not found in database for ID:", userId);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log("✓ User encontrado:", { skills: user.skills, experiencia: user.experiencia });

    // ✓ Validate user data
    if (!user.skills || user.skills.trim() === '') {
      console.warn("⚠️ User has no skills defined, using empty string");
    }
    if (!user.experiencia || user.experiencia.trim() === '') {
      console.warn("⚠️ User has no experience defined, using empty string");
    }

    // ✓ LOG 3: Fetching vacancies
    console.log("🔍 Buscando vagas...");
    const vagas = await Job.find({});
    console.log(`✓ ${vagas.length} vagas encontradas`);

    if (vagas.length === 0) {
      console.warn("⚠️ No vacancies in database!");
      return res.status(404).json({ error: 'Nenhuma vaga disponível no momento' });
    }

    // ✓ Format vacancies
    const vagasFormatadas = vagas.map(v => ({
      titulo: v.titulo || '',
      descricao: v.descricao || '',
      requisitos: Array.isArray(v.requisitos) ? v.requisitos : [v.requisitos || '']
    }));

    console.log("📤 Enviando para Python IA...");
    console.log("   Skills:", user.skills);
    console.log("   Experiencia:", user.experiencia);
    console.log("   Vagas:", vagasFormatadas.length);

    // ✓ Call Python AI Service
    let response;
    try {
      response = await axios.post('http://127.0.0.1:5000/analyze', {
        skills: user.skills,
        experiencia: user.experiencia,
        vagas: vagasFormatadas
      }, {
        timeout: 10000  // 10 seconds timeout
      });

      console.log("✓ Resposta recebida do Python");
      console.log("📥 Response from AI:", response.data);

    } catch (axiosErr) {
      console.error("❌ AXIOS ERROR calling Python service:");
      console.error("   Status:", axiosErr.response?.status);
      console.error("   Message:", axiosErr.message);
      console.error("   Code:", axiosErr.code);  // ECONNREFUSED, ETIMEDOUT, etc.

      if (axiosErr.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'Serviço de IA não está disponível. Certifique-se de que o Python está rodando em http://127.0.0.1:5000'
        });
      }
      if (axiosErr.code === 'ETIMEDOUT') {
        return res.status(504).json({
          error: 'Serviço de IA não respondeu no tempo esperado'
        });
      }

      throw axiosErr;
    }

    console.log("=== RECOMMEND ROUTE SUCCESS ===");
    res.json(response.data);

  } catch (err) {
    console.error('❌ Erro na recomendação:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Erro ao gerar recomendação.' });
  }
});

module.exports = router;
