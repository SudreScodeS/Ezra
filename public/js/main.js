// Navegação responsiva
document.addEventListener('DOMContentLoaded', function() {
  // Skip link para acessibilidade
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Pular para conteúdo principal';
  document.body.prepend(skipLink);

  // Menu mobile (simplificado - mostra/oculta)
  const nav = document.querySelector('nav');
  const menuToggle = document.createElement('button');
  menuToggle.textContent = 'Menu';
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-controls', 'main-nav');
  menuToggle.className = 'menu-toggle';
  
  nav.id = 'main-nav';
  nav.parentNode.insertBefore(menuToggle, nav);
  nav.classList.add('nav-hidden');
  
  menuToggle.addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('nav-hidden');
  });

  // Fechar menu ao clicar em link (mobile)
  nav.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && window.innerWidth < 768) {
      nav.classList.add('nav-hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// CSS adicional para menu mobile
const mobileStyle = document.createElement('style');
mobileStyle.textContent = `
  .menu-toggle {
    display: none;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.375rem;
    margin: 0.5rem;
  }
  
  .nav-hidden {
    display: none;
  }
  
  @media (max-width: 768px) {
    .menu-toggle {
      display: block;
    }
    
    nav ul {
      flex-direction: column;
    }
  }
`;
document.head.appendChild(mobileStyle);