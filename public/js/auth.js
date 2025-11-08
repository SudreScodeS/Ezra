class AuthManager {
  constructor() {
    this.token = localStorage.getItem("authToken");
    this.nome = localStorage.getItem("userName") || "Visitante";
  }

  async login(email, senha) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha no login");

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userName", data.nome);
    this.token = data.token;
    this.nome = data.nome;

    this.updateUserUI();
    alert(data.message);
  }

  async register(userData) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao cadastrar");

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userName", data.nome);
    this.token = data.token;
    this.nome = data.nome;

    this.updateUserUI();
    alert(data.message);
  }

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    this.token = null;
    this.nome = "Visitante";
    this.updateUserUI();
  }

  updateUserUI() {
    const nomeEl = document.querySelector("#user-nome");
    if (nomeEl) nomeEl.textContent = this.nome.toUpperCase();
  }
}

const auth = new AuthManager();

document.addEventListener("DOMContentLoaded", () => {
  auth.updateUserUI();

  // LOGIN
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;
      try {
        await auth.login(email, senha);
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // CADASTRO
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email-cadastro").value;
      const senha = document.getElementById("senha-cadastro").value;
      const skills = document.getElementById("skills").value;
      const experiencia = document.getElementById("experiencia").value;

      try {
        await auth.register({ nome, email, senha, skills, experiencia });
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // --- POP-UP DE PERFIL ---
  const userNome = document.getElementById("user-nome");
  const logoutBtn = document.getElementById("logout-btn");

  // Abrir pop-up ao clicar no nome
  userNome.addEventListener("click", async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const resposta = await fetch("/api/perfil", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await resposta.json();

      if (resposta.ok) {
        document.getElementById("perfil-nome").textContent = user.nome;
        document.getElementById("perfil-email").textContent = user.email;
        document.getElementById("perfil-skills").textContent =
          user.skills || "Não informado";
        document.getElementById("perfil-experiencia").textContent =
          user.experiencia || "Não informado";

        document.getElementById("perfil-modal").style.display = "flex";
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    }
  });

  // Fechar modal
  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("perfil-modal").style.display = "none";
  });

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("perfil-modal")) {
      document.getElementById("perfil-modal").style.display = "none";
    }
  });

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userName");
  auth.logout();
  document.getElementById("perfil-modal").style.display = "none";
  alert("Você saiu da conta.");
});
});

