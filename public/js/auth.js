class AuthManager {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user')) || null;
  }

  async login(email, senha) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      
      if (!response.ok) throw new Error('Credenciais inválidas');
      
      const data = await response.json();
      this.token = data.token;
      this.user = data.user;
      
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Erro no cadastro');
      
      const data = await response.json();
      this.token = data.token;
      this.user = data.user;
      
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      return data;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  isAuthenticated() {
    return this.token !== null;
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }
}

// Instância global
const auth = new AuthManager();

// Formulários de login/cadastro
document.addEventListener('DOMContentLoaded', function() {
  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = this.querySelector('#email').value;
      const senha = this.querySelector('#senha').value;
      
      try {
        await auth.login(email, senha);
        window.location.href = '/vagas.html';
      } catch (error) {
        alert('Erro no login: ' + error.message);
      }
    });
  }

  // Cadastro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const userData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
        skills: formData.get('skills').split(',').map(s => s.trim()),
        experiencia: formData.get('experiencia')
      };
      
      try {
        await auth.register(userData);
        window.location.href = '/vagas.html';
      } catch (error) {
        alert('Erro no cadastro: ' + error.message);
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }

  // Mostrar/ocultar forms baseado na autenticação
  updateAuthUI();
});

function updateAuthUI() {
  const authElements = document.querySelectorAll('[data-auth]');
  authElements.forEach(el => {
    const shouldShow = auth.isAuthenticated() ? 
      el.getAttribute('data-auth') === 'authenticated' :
      el.getAttribute('data-auth') === 'anonymous';
    
    el.style.display = shouldShow ? 'block' : 'none';
  });
}