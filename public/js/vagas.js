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

  /* ---------------- HEADER SHRINK ---------------- */
  window.addEventListener("scroll", () => {
    const header = document.getElementById("premium-header");
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  /* ---------------- HERO ROLLER ---------------- */
  const rollerText = document.getElementById("roller-text");
  if (rollerText) {
    const words = ["Ezra", "EFICIENTES", "MODERNOS", "PROFISSIONAIS"];
    let index = 0;
    let isChanging = false;

    function changeWord() {
      if (isChanging) return;
      isChanging = true;

      rollerText.classList.remove("fade-in");
      rollerText.classList.add("fade-out");

      setTimeout(() => {
        index = (index + 1) % words.length;
        rollerText.textContent = words[index];
        rollerText.classList.add("fade-in");
        rollerText.classList.remove("fade-out");

        const delay = words[index] === "Ezra" ? 5000 : 2500;

        setTimeout(() => {
          isChanging = false;
          changeWord();
        }, delay);
      }, 800);
    }

    setTimeout(() => {
      rollerText.classList.add("fade-in");
      setTimeout(changeWord, 4000);
    }, 500);
  }

  /* ---------------- ACCOUNT ICON ROLLER ---------------- */
  const accountIcon = document.querySelector(".account-icon a");
  const rollerCadastrar = document.querySelector(".roller-cadastrar");
  const rollerEntrar = document.querySelector(".roller-entrar");
  const roller = document.querySelector(".account-text-roller");

  if (accountIcon && rollerCadastrar && rollerEntrar && roller) {
    let intervalId;
    let showingCadastrar = true;

    function rollText() {
      if (showingCadastrar) {
        rollerCadastrar.style.transform = "translateY(0)";
        rollerEntrar.style.transform = "translateY(100%)";
      } else {
        rollerCadastrar.style.transform = "translateY(-100%)";
        rollerEntrar.style.transform = "translateY(0)";
      }
      showingCadastrar = !showingCadastrar;
    }

    accountIcon.addEventListener("mouseenter", () => {
      roller.style.opacity = 1;
      rollText();
      intervalId = setInterval(rollText, 2000);
    });

    accountIcon.addEventListener("mouseleave", () => {
      clearInterval(intervalId);
      roller.style.opacity = 0;
      rollerCadastrar.style.transform = "translateY(0)";
      rollerEntrar.style.transform = "translateY(100%)";
      showingCadastrar = true;
    });

    rollerCadastrar.style.transform = "translateY(0)";
    rollerEntrar.style.transform = "translateY(100%)";
  }

  /* ---------------- ANIMATION COUNT ---------------- */
  document.querySelectorAll(".impact-number").forEach((el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    if (!isNaN(target)) {
      animateCountUp(el, target);
    }
  });

  function animateCountUp(el, target) {
    let count = 0;
    const speed = Math.ceil(target / 60);

    function update() {
      count += speed;
      if (count > target) count = target;
      el.textContent = "+" + count.toLocaleString();
      if (count < target) requestAnimationFrame(update);
    }
    update();
  }

  /* ---------------- ACESSIBILIDADE ---------------- */
  const popup = document.getElementById("accessibility-popup");
  const openBtn = document.getElementById("accessibility-btn");
  const closeBtn = document.getElementById("close-popup");

  if (popup && openBtn && closeBtn) {
    openBtn.addEventListener("click", () => popup.classList.remove("hidden"));
    closeBtn.addEventListener("click", () => popup.classList.add("hidden"));

    popup.addEventListener("click", (e) => {
      if (e.target === popup) popup.classList.add("hidden");
    });
  }

  /* ---------------- PERFIL MODAL ---------------- */
  const userNome = document.getElementById("user-nome");
  const logoutBtn = document.getElementById("logout-btn");

  if (userNome) {
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
          document.getElementById("perfil-skills").textContent = user.skills || "Não informado";
          document.getElementById("perfil-experiencia").textContent = user.experiencia || "Não informado";

          document.getElementById("perfil-modal").style.display = "flex";
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.logout();
      document.getElementById("perfil-modal").style.display = "none";
      alert("Você saiu da conta.");
    });
  }

  const closeModal = document.getElementById("close-modal");
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      document.getElementById("perfil-modal").style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    const modal = document.getElementById("perfil-modal");
    if (e.target === modal) modal.style.display = "none";
  });
});

/* Google Translate callback */
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "pt",
      includedLanguages: "en,es,fr,de",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    "google_translate_element"
  );
}
function updateLoginDisplay() {
  const nome = localStorage.getItem("userName");
  const userNomeEl = document.getElementById("user-nome");
  const roller = document.getElementById("login-roller");
  const icon = document.getElementById("account-icon-user");
  const link = document.getElementById("account-link");

  if (nome) {
    // Usuário logado → mostrar nome
    userNomeEl.textContent = nome.toUpperCase();
    userNomeEl.style.display = "inline";
    roller.style.display = "none";     // Esconde "Cadastrar / Entrar"
    icon.style.display = "none";       // Esconde o ícone
    link.href = "#";                   // Evita redirecionar para cadastro
  } else {
    // Usuário deslogado → mostrar opções de login
    userNomeEl.style.display = "none";
    roller.style.display = "inline-block";
    icon.style.display = "inline";
    link.href = "cadastro.html";
  }
}

// Chama ao carregar a página
document.addEventListener("DOMContentLoaded", updateLoginDisplay);

// Chama sempre que logar ou deslogar
auth.updateUserUI = function () {
  const nomeEl = document.querySelector("#user-nome");
  if (nomeEl) nomeEl.textContent = this.nome.toUpperCase();
  updateLoginDisplay();
};

rollerCadastrar.style.transform = "translateY(0)";
rollerEntrar.style.transform = "translateY(100%)";

function animateCountUp(el, target) {
  let count = 0;
  const speed = Math.ceil(target / 60);
  function update() {
    count += speed;
    if (count > target) count = target;
    el.textContent = "+" + count.toLocaleString();
    if (count < target) requestAnimationFrame(update);
  }
  update();
}
document.querySelectorAll(".impact-number").forEach((el) => {
  const target = parseInt(el.getAttribute("data-count"), 10);
  animateCountUp(el, target);
});

// Simple testimonial carousel
let testimonialIndex = 0;
const testimonials = document.querySelectorAll(".testimonial-card");
function showTestimonial(idx) {
  testimonials.forEach((card, i) => {
    card.style.display = i === idx ? "flex" : "none";
  });
}
showTestimonial(testimonialIndex);
setInterval(() => {
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
  showTestimonial(testimonialIndex);
}, 4000);

async function buscarVagasIA() {
  const resultadoEl = document.getElementById("resultadoIA");
  resultadoEl.innerHTML = "<p>Buscando vagas...</p>";

  const token = localStorage.getItem("authToken");

  console.log("=== FRONTEND: Iniciando busca de vagas com IA ===");
  console.log("Token disponível:", !!token);

  // Constrói headers usando token se existir
  const baseHeaders = { "Content-Type": "application/json" };
  const headersWithToken = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;

  // Primeiro: tenta obter userId, preferindo token, mas enviando cookies também (credentials: 'include')
  let resUser;
  try {
    console.log("📡 Chamando /api/getUserId...");
    resUser = await fetch("/api/getUserId", {
      method: "GET",
      headers: headersWithToken,
      credentials: "include", // garante envio de cookies de sessão
    });
    console.log("✓ /api/getUserId respondeu com status:", resUser.status);
  } catch (err) {
    console.error("❌ Erro de rede em /api/getUserId:", err.message);
    resultadoEl.innerHTML = `<p style="color:red;">Erro de rede ao verificar sessão: ${err.message}</p>`;
    return;
  }

  // Se deu 401 e havia token, pode ser que o token esteja inválido → limpar token e tentar com apenas cookie
  if (resUser.status === 401 && token) {
    console.warn("⚠️ Token inválido (401), tentando apenas com cookies...");
    localStorage.removeItem("authToken");
    try {
      resUser = await fetch("/api/getUserId", {
        method: "GET",
        headers: baseHeaders,
        credentials: "include",
      });
      console.log("✓ Retry /api/getUserId respondeu com status:", resUser.status);
    } catch (err) {
      console.error("❌ Erro de rede em retry /api/getUserId:", err.message);
      resultadoEl.innerHTML = `<p style="color:red;">Erro de rede ao verificar sessão: ${err.message}</p>`;
      return;
    }
  }

  if (resUser.status === 401) {
    console.error("❌ Não autenticado (401)");
    resultadoEl.innerHTML = `<p style="color:red;">Você precisa estar logado para usar a IA de vagas!</p>`;
    return;
  }

  if (!resUser.ok) {
    const errData = await resUser.json().catch(() => ({}));
    console.error("❌ Erro ao obter usuário:", errData.error || resUser.statusText);
    resultadoEl.innerHTML = `<p style="color:red;">Erro ao obter usuário: ${errData.error || resUser.statusText}</p>`;
    return;
  }

  const userData = await resUser.json();
  const { userId } = userData;

  console.log("✓ userId obtido:", userId);
  console.log("   (Comprimento esperado: 24, Atual:", userId?.length || "undefined", ")");

  // Chama recomendação, enviando token se existir e cookies também
  let res;
  try {
    console.log("📤 Chamando /api/recommend com userId:", userId);
    res = await fetch("/api/recommend", {
      method: "POST",
      headers: token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders,
      credentials: "include",
      body: JSON.stringify({ userId }),
    });
    console.log("✓ /api/recommend respondeu com status:", res.status);
  } catch (err) {
    console.error("❌ Erro de rede em /api/recommend:", err.message, "Code:", err.code);
    resultadoEl.innerHTML = `<p style="color:red;">Erro de rede ao buscar recomendações: ${err.message}</p>`;
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("❌ /api/recommend respondeu com erro:", data.error || res.statusText);
    resultadoEl.innerHTML = `<p style="color:red;">❌ ${data.error || "Erro ao buscar recomendações."}</p>`;
    return;
  }

  if (data.error) {
    resultadoEl.innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
    return;
  }

  // Render with beautiful styling
  resultadoEl.innerHTML = `
    <h3>✨ Resultados da IA</h3>
    <p>${data.explicacao || ""}</p>
    <ul>
      ${(data.recomendacoes || [])
      .map(
        (v, index) => `
            <li data-compatibility="${v.compatibilidade}% compatível">
              <strong>${index + 1}. ${v.titulo}</strong>
              <p><strong>Compatibilidade:</strong> <span style="color: var(--gold); font-weight: 700;">${v.compatibilidade}%</span></p>
              <p>${v.descricao}</p>
              ${v.requisitos && v.requisitos.length > 0 ? `
                <p><strong>Requisitos:</strong> ${v.requisitos.join(', ')}</p>
              ` : ''}
            </li>
          `
      )
      .join("")}
    </ul>
  `;
}


// const btn = document.getElementById("chatbotBtn");
// const box = document.getElementById("chatbotBox");
// const chatArea = document.getElementById("chatArea");
// const input = document.getElementById("chatInput");
// const send = document.getElementById("sendChat");
// let history = [];

// btn.onclick = () =>
//   (box.style.display = box.style.display === "none" ? "block" : "none");

// async function sendMessage() {
//   const message = input.value.trim();
//   if (!message) return;
//   chatArea.innerHTML += `<div><strong>Você:</strong> ${message}</div>`;
//   input.value = "";

//   const res = await fetch("/api/chatbot/ask", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message, history }),
//   });
//   const data = await res.json();
//   chatArea.innerHTML += `<div><strong>Ezra IA:</strong> ${data.response}</div>`;
//   chatArea.scrollTop = chatArea.scrollHeight;
//   history = data.history;
// }

// send.onclick = sendMessage;
// input.addEventListener("keypress", (e) => {
//   if (e.key === "Enter") sendMessage();
// });
