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
    const popup = document.querySelector(".user-popup");
    if (nomeEl) nomeEl.textContent = this.nome.toUpperCase();

    if (popup) popup.style.display = "none";
  }
}

const auth = new AuthManager();

// Inicialização
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

  // POP-UP PERFIL
  const userInfo = document.getElementById("user-info");
  if (userInfo) {
    userInfo.addEventListener("mouseenter", () => {
      const popup = document.querySelector(".user-popup");
      if (popup) popup.style.display = "block";
    });

    userInfo.addEventListener("mouseleave", () => {
      const popup = document.querySelector(".user-popup");
      if (popup) popup.style.display = "none";
    });
  }

  // BOTÃO LOGOUT
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => auth.logout());
});
