class Chatbot {
  constructor() {
    this.history = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotForm = document.getElementById('chatbot-form');

    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      chatbotContainer.classList.toggle('chatbot-hidden');
    });

    chatbotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('chatbot-input');
      const message = input.value.trim();
      
      if (!message) return;

      this.addMessage(message, 'user');
      input.value = '';

      try {
        const response = await fetch('/api/chatbot/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history: this.history })
        });

        if (!response.ok) throw new Error('Erro no chatbot');

        const data = await response.json();
        this.history = data.history;
        this.addMessage(data.response, 'bot');
      } catch (error) {
        this.addMessage('Desculpe, estou com problemas técnicos. Tente novamente mais tarde.', 'bot');
      }
    });
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-${sender}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Inicializar chatbot
document.addEventListener('DOMContentLoaded', () => {
  new Chatbot();
});