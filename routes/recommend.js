const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Job = require('../models/Job');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).select('skills experiencia');

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const vagas = await Job.find({});
    const vagasFormatadas = vagas.map(v => ({
      titulo: v.titulo,
      descricao: v.descricao,
      requisitos: v.requisitos
    }));

    // Envia tudo para a IA Python
    const response = await axios.post('http://127.0.0.1:5000/analyze', {
      skills: user.skills,
      experiencia: user.experiencia,
      vagas: vagasFormatadas
    });

    res.json(response.data);
  } catch (err) {
    console.error('Erro na recomendação:', err);
    res.status(500).json({ error: 'Erro ao gerar recomendação.' });
  }
});

module.exports = router;
