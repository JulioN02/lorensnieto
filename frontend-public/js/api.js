/* ============================================
   Lorens Nieto — API Client
   ============================================ */

const API = {
  BASE: window.location.port === '3001' ? 'http://localhost:3000/api/public' : '/api/public',

  /**
   * Obtener listado paginado de propiedades
   * @param {Object} params - { type, zone, capacity, search, page, limit }
   * @returns {Promise<Object>} { success, data[], pagination }
   */
  async getProperties(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${this.BASE}/properties?${query}`);
    return res.json();
  },

  /**
   * Obtener detalle de una propiedad
   * @param {string} id
   * @returns {Promise<Object>} { success, data }
   */
  async getProperty(id) {
    const res = await fetch(`${this.BASE}/properties/${encodeURIComponent(id)}`);
    return res.json();
  },

  /**
   * Obtener listado paginado de servicios
   * @param {Object} params - { classification, search, page, limit }
   * @returns {Promise<Object>} { success, data[], pagination }
   */
  async getServices(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${this.BASE}/services?${query}`);
    return res.json();
  },

  /**
   * Obtener detalle de un servicio
   * @param {string} id
   * @returns {Promise<Object>} { success, data }
   */
  async getService(id) {
    const res = await fetch(`${this.BASE}/services/${encodeURIComponent(id)}`);
    return res.json();
  },

  /**
   * Enviar solicitud (lead)
   * @param {Object} data - { customerName, customerCedula, customerPhone, customerEmail, propertyId?, serviceId?, dateInterest?, additionalServices? }
   * @returns {Promise<Object>} { success, data, message? }
   */
  async submitLead(data) {
    const res = await fetch(`${this.BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Formatear precio en COP
   * @param {number} amount
   * @returns {string}
   */
  formatPrice(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Formatear fecha en español
   * @param {string} dateStr
   * @returns {string}
   */
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
};
