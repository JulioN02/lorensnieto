/* ============================================
   Lorens Nieto — App (Funciones Reutilizables)
   ============================================ */

// ----- Card Renderers -----

/**
 * Renderizar tarjeta de propiedad
 * @param {Object} p
 * @returns {string} HTML
 */
function renderPropertyCard(p) {
  const img = p.media?.[0]?.url
    ? p.media[0].url
    : 'https://placehold.co/600x400/1e3a5f/c9a84c?text=Sin+Imagen';

  const typeLabel = p.type === 'casa_campo' ? 'Casa de Campo' : 'Apartamento';
  const price = API.formatPrice(Number(p.priceNight));
  const detailPage = `property.html?id=${p.id}`;

  return `
    <article class="card">
      <img
        src="${img}"
        alt="${escapeHtml(p.name)}"
        class="card-img"
        loading="lazy"
        onerror="this.src='https://placehold.co/600x400/1e3a5f/c9a84c?text=Sin+Imagen'"
      />
      <div class="card-body">
        <div class="card-tags">
          <span class="card-tag accent">${typeLabel}</span>
          ${p.zone ? `<span class="card-tag">${escapeHtml(p.zone)}</span>` : ''}
          ${p.capacity ? `<span class="card-tag">${p.capacity} pers.</span>` : ''}
        </div>
        <h3 class="card-title">${escapeHtml(p.name)}</h3>
        <p class="card-meta">📍 ${escapeHtml(p.zone)}</p>
        <p class="card-meta">🛏 ${p.rooms ?? '—'} habitaciones · ${p.capacity} personas</p>
        <div class="card-footer">
          <span class="price">${price}/noche</span>
          <a href="${detailPage}" class="btn btn-primary btn-sm">Ver más</a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renderizar tarjeta de servicio
 * @param {Object} s
 * @returns {string} HTML
 */
function renderServiceCard(s) {
  const img = s.media?.[0]?.url
    ? s.media[0].url
    : 'https://placehold.co/600x400/1e3a5f/c9a84c?text=Sin+Imagen';

  const price = API.formatPrice(Number(s.price));
  const detailPage = `service.html?id=${s.id}`;

  const classMap = {
    alimentacion: 'alimentacion',
    limpieza: 'limpieza',
    otros: 'otros',
  };

  const badgeClass = classMap[s.classification] || 'otros';
  const classificationLabel = {
    alimentacion: 'Alimentación',
    limpieza: 'Limpieza',
    otros: 'Otros',
  };

  return `
    <article class="card">
      <img
        src="${img}"
        alt="${escapeHtml(s.name)}"
        class="card-img"
        loading="lazy"
        onerror="this.src='https://placehold.co/600x400/1e3a5f/c9a84c?text=Sin+Imagen'"
      />
      <div class="card-body">
        <div class="card-tags">
          <span class="classification-badge ${badgeClass}">${classificationLabel[s.classification] || s.classification}</span>
          ${s.type ? `<span class="card-tag">${escapeHtml(s.type)}</span>` : ''}
        </div>
        <h3 class="card-title">${escapeHtml(s.name)}</h3>
        <div class="card-footer">
          <span class="price">${price}</span>
          <a href="${detailPage}" class="btn btn-primary btn-sm">Ver más</a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renderizar paginación
 * @param {number} current - página actual
 * @param {number} total - total de páginas
 * @param {function} onPage - callback al hacer clic en página
 * @returns {string} HTML
 */
function renderPagination(current, total, onPage) {
  if (total <= 1) return '';

  let html = '<div class="pagination">';

  // Prev
  html += `<button class="page-btn" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>&laquo; Anterior</button>`;

  // Pages
  const maxVisible = 5;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  if (start > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (start > 2) html += `<span class="ellipsis">...</span>`;
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  if (end < total) {
    if (end < total - 1) html += `<span class="ellipsis">...</span>`;
    html += `<button class="page-btn" data-page="${total}">${total}</button>`;
  }

  // Next
  html += `<button class="page-btn" data-page="${current + 1}" ${current >= total ? 'disabled' : ''}>Siguiente &raquo;</button>`;

  html += '</div>';

  // Attach events after insertion
  setTimeout(() => {
    document.querySelectorAll('.page-btn[data-page]').forEach((btn) => {
      const page = parseInt(btn.dataset.page, 10);
      btn.addEventListener('click', () => {
        if (!btn.disabled && onPage) onPage(page);
      });
    });
  }, 0);

  return html;
}

// ----- Modal -----

/**
 * Mostrar modal overlay
 * @param {string} html - contenido HTML del cuerpo del modal
 * @param {string} title - título del modal
 */
function showModal(html, title = 'Solicitar Información') {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        ${html}
      </div>
    </div>
  `;

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

/**
 * Cerrar modal
 */
function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 300);
  }
  document.body.style.overflow = '';
}

// ----- Toast -----

/**
 * Mostrar notificación temporal
 * @param {string} message
 * @param {'success'|'error'} type
 */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ----- Mobile Menu -----

let mobileMenuInitialized = false;

/**
 * Inicializar menú hamburguesa
 */
function initMobileMenu() {
  if (mobileMenuInitialized) return;
  mobileMenuInitialized = true;

  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.header-nav');

  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
  });

  // Close on link click (mobile)
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
    });
  });
}

// ----- Header / Footer Loaders -----

/**
 * Cargar header en el contenedor #header
 * Opcionalmente marca el link activo según data-page
 */
function loadHeader() {
  const container = document.getElementById('header');
  if (!container) return;

  const currentPage = container.dataset.page || '';

  container.innerHTML = `
    <header class="header">
      <div class="container">
        <a href="index.html" class="header-logo">Lorens <span>Nieto</span></a>

        <button class="hamburger" aria-label="Menú">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav class="header-nav">
          <a href="index.html" class="${currentPage === 'inicio' ? 'active' : ''}">Inicio</a>
          <a href="casas-campo.html" class="${currentPage === 'casas-campo' ? 'active' : ''}">Casas de Campo</a>
          <a href="apartamentos.html" class="${currentPage === 'apartamentos' ? 'active' : ''}">Apartamentos</a>
          <a href="servicios.html" class="${currentPage === 'servicios' ? 'active' : ''}">Servicios</a>
          <a href="https://wa.me/573001234567?text=Hola%2C%20quiero%20informaci%C3%B3n" target="_blank" rel="noopener" class="header-whatsapp">
            💬 WhatsApp
          </a>
        </nav>
      </div>
    </header>
  `;

  initMobileMenu();
}

/**
 * Cargar footer en el contenedor #footer
 */
function loadFooter() {
  const container = document.getElementById('footer');
  if (!container) return;

  container.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>Lorens Nieto</h4>
            <p>Tu mejor opción en casas de campo y apartamentos en Valledupar, Cesar. Encuentra el lugar perfecto para tus momentos especiales.</p>
          </div>
          <div class="footer-col">
            <h4>Enlaces rápidos</h4>
            <a href="index.html">Inicio</a>
            <a href="casas-campo.html">Casas de Campo</a>
            <a href="apartamentos.html">Apartamentos</a>
            <a href="servicios.html">Servicios</a>
          </div>
          <div class="footer-col">
            <h4>Contacto</h4>
            <p>📍 Valledupar, Cesar</p>
            <p>📞 +57 300 123 4567</p>
            <p>✉️ info@lorensnieto.com</p>
            <div class="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="WhatsApp">💬</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Lorens Nieto. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `;
}

// ----- Lead Form in Modal -----

/**
 * Abrir modal con formulario de lead
 * @param {Object} opts - { propertyId, serviceId, propertyName, serviceName, title }
 */
function openLeadForm(opts = {}) {
  const title = opts.title || 'Solicitar Información';
  const entityLabel = opts.propertyName || opts.serviceName || '';

  let html = '';

  if (entityLabel) {
    html += `<p class="mb-2" style="color:var(--text-light);font-size:0.9rem;">Solicitando información sobre: <strong>${escapeHtml(entityLabel)}</strong></p>`;
  }

  html += `
    <form id="leadForm" novalidate>
      <div id="leadFormError" class="form-submit-error"></div>

      <input type="hidden" name="propertyId" value="${opts.propertyId || ''}" />
      <input type="hidden" name="serviceId" value="${opts.serviceId || ''}" />

      <div class="form-group">
        <label>Nombre completo <span class="required">*</span></label>
        <input type="text" name="customerName" required />
        <div class="form-error">Este campo es obligatorio</div>
      </div>

      <div class="form-group">
        <label>Cédula <span class="required">*</span></label>
        <input type="text" name="customerCedula" required />
        <div class="form-error">Este campo es obligatorio</div>
      </div>

      <div class="form-group">
        <label>WhatsApp <span class="required">*</span></label>
        <input type="tel" name="customerPhone" required placeholder="+57 300 123 4567" />
        <div class="form-error">Este campo es obligatorio</div>
      </div>

      <div class="form-group">
        <label>Correo electrónico <span class="required">*</span></label>
        <input type="email" name="customerEmail" required />
        <div class="form-error">Ingresa un correo válido</div>
      </div>

      <div class="form-group">
        <label>Fecha de interés</label>
        <input type="date" name="dateInterest" />
      </div>

      <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">
        Enviar Solicitud
      </button>
    </form>
  `;

  showModal(html, title);

  // Attach form handler
  document.getElementById('leadForm').addEventListener('submit', handleLeadSubmit);
}

/**
 * Manejar envío del formulario de lead
 * @param {Event} e
 */
async function handleLeadSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const errorDiv = document.getElementById('leadFormError');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Reset errors
  form.querySelectorAll('.form-group').forEach((g) => g.classList.remove('error'));
  errorDiv.classList.remove('show');
  errorDiv.textContent = '';

  // Validate required
  let valid = true;
  const required = form.querySelectorAll('[required]');
  required.forEach((field) => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      group.classList.add('error');
      valid = false;
    }
  });

  // Email validation
  const emailField = form.querySelector('[name="customerEmail"]');
  const emailGroup = emailField.closest('.form-group');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailField.value.trim() && !emailRegex.test(emailField.value.trim())) {
    emailGroup.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  // Build payload
  const data = {
    customerName: form.querySelector('[name="customerName"]').value.trim(),
    customerCedula: form.querySelector('[name="customerCedula"]').value.trim(),
    customerPhone: form.querySelector('[name="customerPhone"]').value.trim(),
    customerEmail: form.querySelector('[name="customerEmail"]').value.trim(),
    propertyId: form.querySelector('[name="propertyId"]')?.value || undefined,
    serviceId: form.querySelector('[name="serviceId"]')?.value || undefined,
    dateInterest: form.querySelector('[name="dateInterest"]')?.value || undefined,
    additionalServices: [],
  };

  // Clean up empty values
  if (!data.propertyId) delete data.propertyId;
  if (!data.serviceId) delete data.serviceId;
  if (!data.dateInterest) delete data.dateInterest;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    const result = await API.submitLead(data);

    if (result.success) {
      // Show success
      const body = form.closest('.modal-body');
      body.innerHTML = `
        <div class="form-success">
          <div class="success-icon">✅</div>
          <h4>${result.message || 'Solicitud enviada correctamente'}</h4>
          <p>Gracias por tu interés. Te contactaremos pronto.</p>
        </div>
      `;
      setTimeout(closeModal, 3000);
    } else {
      errorDiv.textContent = result.error || 'Error al enviar la solicitud. Intenta de nuevo.';
      errorDiv.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Solicitud';
    }
  } catch (err) {
    errorDiv.textContent = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
    errorDiv.classList.add('show');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Solicitud';
  }
}

// ----- Utility -----

/**
 * Escapar HTML para prevenir XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Cargar propiedades destacadas en la landing page
 */
async function loadFeaturedProperties() {
  const casaContainer = document.getElementById('featured-casas');
  const aptoContainer = document.getElementById('featured-apartamentos');

  if (casaContainer) {
    try {
      const res = await API.getProperties({ type: 'casa_campo', limit: 4 });
      if (res.success && res.data.length > 0) {
        casaContainer.innerHTML = res.data.map(renderPropertyCard).join('');
      } else {
        casaContainer.innerHTML = '<p class="text-center text-muted">No hay casas de campo disponibles actualmente.</p>';
      }
    } catch {
      casaContainer.innerHTML = '<p class="text-center text-muted">Error al cargar casas de campo.</p>';
    }
  }

  if (aptoContainer) {
    try {
      const res = await API.getProperties({ type: 'apartamento', limit: 4 });
      if (res.success && res.data.length > 0) {
        aptoContainer.innerHTML = res.data.map(renderPropertyCard).join('');
      } else {
        aptoContainer.innerHTML = '<p class="text-center text-muted">No hay apartamentos disponibles actualmente.</p>';
      }
    } catch {
      aptoContainer.innerHTML = '<p class="text-center text-muted">Error al cargar apartamentos.</p>';
    }
  }
}

/**
 * Cargar servicios destacados en la landing page
 */
async function loadFeaturedServices() {
  const container = document.getElementById('featured-services');
  if (!container) return;

  try {
    // Try to get one of each classification
    const promises = ['alimentacion', 'limpieza', 'otros'].map((c) =>
      API.getServices({ classification: c, limit: 1 })
    );
    const results = await Promise.all(promises);
    const services = [];

    results.forEach((res) => {
      if (res.success && res.data.length > 0) {
        services.push(res.data[0]);
      }
    });

    // If we didn't get 3, fill with any services
    if (services.length < 3) {
      const res = await API.getServices({ limit: 3 });
      if (res.success) {
        res.data.forEach((s) => {
          if (!services.find((x) => x.id === s.id)) {
            services.push(s);
          }
        });
      }
    }

    if (services.length > 0) {
      container.innerHTML = services.map(renderServiceCard).join('');
    } else {
      container.innerHTML = '<p class="text-center text-muted">No hay servicios disponibles actualmente.</p>';
    }
  } catch {
    container.innerHTML = '<p class="text-center text-muted">Error al cargar servicios.</p>';
  }
}

// ----- Gallery -----

/**
 * Inicializar galería de imágenes (thumbnails)
 */
function initGallery() {
  const mainImg = document.getElementById('gallery-main');
  const thumbs = document.querySelectorAll('.detail-thumb');

  if (!mainImg || thumbs.length === 0) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      // Update main image
      mainImg.src = thumb.dataset.full || thumb.src;
      mainImg.alt = thumb.alt;

      // Update active thumb
      thumbs.forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

// ============================================
// INIT on DOM ready
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();

  // Load featured content on landing page
  if (document.getElementById('featured-casas')) {
    loadFeaturedProperties();
  }
  if (document.getElementById('featured-services')) {
    loadFeaturedServices();
  }
});
