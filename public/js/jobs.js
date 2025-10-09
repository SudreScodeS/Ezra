class JobsManager {
  constructor() {
    this.currentFilters = {};
  }

  async loadJobs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/jobs?${queryParams}`);
      
      if (!response.ok) throw new Error('Erro ao carregar vagas');
      
      return await response.json();
    } catch (error) {
      console.error('Erro:', error);
      return [];
    }
  }

  async getRecommendedJobs() {
    if (!auth.isAuthenticated()) {
      alert('Faça login para ver recomendações personalizadas');
      return [];
    }

    try {
      const response = await fetch('/api/jobs/recommend', {
        headers: auth.getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Erro ao carregar recomendações');
      
      return await response.json();
    } catch (error) {
      console.error('Erro:', error);
      return [];
    }
  }

  renderJobs(jobs, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = jobs.map(job => `
      <article class="job-card" aria-labelledby="job-${job._id}">
        <h3 id="job-${job._id}">${job.titulo}</h3>
        <p><strong>Localização:</strong> ${job.localizacao}</p>
        <p><strong>Salário:</strong> ${job.salario}</p>
        <p><strong>Requisitos:</strong> ${job.requisitos.join(', ')}</p>
        <p>${job.descricao}</p>
        <button class="btn" onclick="applyJob('${job._id}')">Candidatar-se</button>
      </article>
    `).join('');
  }

  setupFilters() {
    const filterForm = document.getElementById('job-filters');
    if (!filterForm) return;

    filterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(filterForm);
      this.currentFilters = Object.fromEntries(formData.entries());
      
      const jobs = await this.loadJobs(this.currentFilters);
      this.renderJobs(jobs, 'jobs-container');
    });
  }
}

// Instância global
const jobsManager = new JobsManager();

// Carregar vagas ao abrir a página
document.addEventListener('DOMContentLoaded', async function() {
  if (window.location.pathname.includes('vagas.html')) {
    jobsManager.setupFilters();
    
    // Carregar todas as vagas inicialmente
    const jobs = await jobsManager.loadJobs();
    jobsManager.renderJobs(jobs, 'jobs-container');

    // Botão de recomendações
    const recommendBtn = document.getElementById('recommend-btn');
    if (recommendBtn) {
      recommendBtn.addEventListener('click', async () => {
        const recommendedJobs = await jobsManager.getRecommendedJobs();
        jobsManager.renderJobs(recommendedJobs, 'jobs-container');
      });
    }
  }
});

// Função para candidatar-se (simulada)
function applyJob(jobId) {
  if (!auth.isAuthenticated()) {
    alert('Faça login para se candidatar');
    window.location.href = '/cadastro.html';
    return;
  }
  alert(`Candidatura enviada para a vaga ${jobId}!`);
}