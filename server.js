require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const recommendRoutes = require('./routes/recommend');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar MongoDB:', err));


const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  skills: { type: String },
  experiencia: { type: String },
  criadoEm: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nome, email, senha, skills, experiencia } = req.body;

    // Verifica se o e-mail já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado!" });
    }

    // Cria o hash da senha
    const hashedSenha = await bcrypt.hash(senha, 10);

    // Cria o usuário
    const newUser = new User({
      nome,
      email,
      senha: hashedSenha,
      skills,
      experiencia,
    });

    await newUser.save();

    // Gera o token para login automático
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Retorna o nome e token igual o login faz
    res.status(201).json({
      message: `🎉 Conta criada com sucesso! Bem-vindo(a), ${newUser.nome}!`,
      token,
      nome: newUser.nome
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ error: "Erro no servidor ao cadastrar." });
  }
});


app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado!" });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta!" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: `👋 Bem-vindo(a), ${user.nome}!`,
      token,
      nome: user.nome
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro no servidor ao logar." });
  }
});

app.get("/api/perfil", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-senha");
    if (!user) return res.status(404).json({ error: "Usuário não encontrado!" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar perfil." });
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-1.5-flash";

app.post("/api/chatbot", async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    res.json({ resposta: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no chatbot." });
  }
});

app.use('/api/recommend', recommendRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
