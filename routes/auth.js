const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Cadastro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, skills, experiencia } = req.body;
    const user = new User({ nome, email, senha, skills, experiencia });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, nome, email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.compareSenha(senha))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, nome: user.nome, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;