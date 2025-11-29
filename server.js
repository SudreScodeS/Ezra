require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const recommendRoutes = require("./routes/recommend");
const User = require("./models/User");
const Job = require("./models/Job");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "http://localhost:3000", // SEU SITE
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.set("trust proxy", 1);

app.use(express.json());
app.use(
  session({
    secret: "minha-chave-super-secreta",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb+srv://beni_db_user:MfHg59W.u85..dR@clustergood.7xzlpal.mongodb.net/?retryWrites=true&w=majority&appName=ClusterGood", // <--- AQUI VOCÊ COLOCA SUA URL
      ttl: 60 * 60, // 1 hora
    }),
    cookie: {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      sameSite: "lax"
    },
  })
);
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB conectado com sucesso!"))
  .catch((err) => console.error("Erro ao conectar MongoDB:", err));

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
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
      nome: newUser.nome,
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

    req.session.user = {
      id: user._id.toString(),
      nome: user.nome,
      email: user.email
    };


    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: `👋 Bem-vindo(a), ${user.nome}!`,
      token,
      nome: user.nome,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro no servidor ao logar." });
  }
});

app.get("/api/perfil", async (req, res) => {
  try {
    // Verifica se o usuário está logado na sessão
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Busca o usuário no banco
    const user = await User.findById(req.session.user.id).select("-senha");

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado!" });
    }

    res.json(user);

  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
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

app.get("/api/getUserId", (req, res) => {
  // 1: Prioridade para sessão
  if (req.session.user) {
    return res.json({ userId: req.session.user.id });
  }

  // 2: Token (Authorization: Bearer xxx)
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.json({ userId: decoded.id });
    } catch (err) {
      return res.status(401).json({ error: "Token inválido" });
    }
  }

  // Sem nada → não autenticado
  return res.status(401).json({ error: "Não autenticado" });
});


app.use("/api/recommend", recommendRoutes);


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


