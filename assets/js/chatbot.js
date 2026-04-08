// ==========================================================================
// chatbot.js — Widget flotante del chatbot
// todoseguros.pro
// ==========================================================================

const WORKER_URL = 'https://todoseguros-bot.josemmolera.workers.dev';

class ChatbotWidget {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.greeting = '¡Hola! Soy tu Asistente de Seguros 👋 ¿En qué tipo de seguro puedo ayudarte hoy?';
    this.init();
  }

  init() {
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.innerHTML = this.getWidgetHTML();
    document.body.appendChild(widget);
    this.bindEvents();

    setTimeout(() => {
      this.addMessage('bot', this.greeting);
    }, 3000);
  }

  getWidgetHTML() {
    return `
      <button id="chatbot-toggle" aria-label="Abrir chat de ayuda">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                fill="currentColor"/>
        </svg>
        <span class="chatbot-badge" id="chatbot-badge">1</span>
      </button>
      <div id="chatbot-panel" class="chatbot-panel chatbot-panel--hidden" role="dialog" aria-label="Chat de ayuda" aria-modal="true" aria-hidden="true">
        <div class="chatbot-header">
          <div class="chatbot-avatar">TS</div>
          <div>
            <div class="chatbot-title">Asistente TodoSeguros</div>
            <div class="chatbot-status">● En línea</div>
          </div>
          <button id="chatbot-close" aria-label="Cerrar chat">✕</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages" aria-live="polite"></div>
        <div class="chatbot-input-area">
          <input type="text" id="chatbot-input" placeholder="Escribe tu pregunta..." maxlength="300" autocomplete="off">
          <button id="chatbot-send" aria-label="Enviar mensaje">→</button>
        </div>
        <div class="chatbot-footer">Impulsado por IA · Respuestas orientativas</div>
      </div>
    `;
  }

  async sendMessage(text) {
    const sanitized = text.trim().substring(0, 300);
    if (!sanitized) return;

    this.addMessage('user', sanitized);
    this.messages.push({ role: 'user', content: sanitized });
    this.setTyping(true);

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: this.messages.slice(-6),
          lang: 'es'
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply = data.reply || 'No pude procesar tu consulta. Inténtalo de nuevo.';

      this.messages.push({ role: 'assistant', content: reply });
      this.addMessage('bot', reply);
    } catch {
      this.addMessage('bot', 'Error de conexión. Inténtalo de nuevo.');
    } finally {
      this.setTyping(false);
    }
  }

  addMessage(role, text) {
    const container = document.getElementById('chatbot-messages');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `chatbot-msg chatbot-msg--${role}`;
    el.textContent = text;
    container.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth' });
  }

  setTyping(active) {
    const existing = document.getElementById('chatbot-typing');
    if (active && !existing) {
      const el = document.createElement('div');
      el.id = 'chatbot-typing';
      el.className = 'chatbot-msg chatbot-msg--bot chatbot-typing';
      el.innerHTML = '<span></span><span></span><span></span>';
      const container = document.getElementById('chatbot-messages');
      if (container) {
        container.appendChild(el);
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!active && existing) {
      existing.remove();
    }
  }

  bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const send = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    if (toggle) toggle.addEventListener('click', () => this.toggle());
    if (close) close.addEventListener('click', () => this.close());
    if (send) {
      send.addEventListener('click', () => {
        if (input) {
          this.sendMessage(input.value);
          input.value = '';
        }
      });
    }
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage(input.value);
          input.value = '';
        }
      });
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    const panel = document.getElementById('chatbot-panel');
    const badge = document.getElementById('chatbot-badge');
    const input = document.getElementById('chatbot-input');
    if (panel) {
      panel.classList.remove('chatbot-panel--hidden');
      panel.setAttribute('aria-hidden', 'false');
    }
    if (badge) badge.style.display = 'none';
    setTimeout(() => { if (input) input.focus(); }, 100);
  }

  close() {
    this.isOpen = false;
    const panel = document.getElementById('chatbot-panel');
    const toggle = document.getElementById('chatbot-toggle');
    if (panel) {
      panel.classList.add('chatbot-panel--hidden');
      panel.setAttribute('aria-hidden', 'true');
    }
    if (toggle) toggle.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => new ChatbotWidget());
