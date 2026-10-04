const config = window.HOTEL_CONFIG || {};
const apiBaseUrl = typeof config.apiBaseUrl === "string" ? config.apiBaseUrl.replace(/\/+$/, "") : "";
const state = {
  categories: [],
  services: [],
  promotions: [],
  products: [],
  page: 1,
  totalPages: 0,
  total: 0,
  catalogRequestId: 0,
  details: new Map(),
  cart: new Map(),
  searchTimer: null,
  toastTimer: null
};

const elements = {
  filters: document.querySelector("#filters"),
  search: document.querySelector("#search-input"),
  category: document.querySelector("#category-filter"),
  guests: document.querySelector("#guest-filter"),
  sort: document.querySelector("#sort-filter"),
  catalogStatus: document.querySelector("#catalog-status"),
  categoriesError: document.querySelector("#categories-error"),
  roomGrid: document.querySelector("#room-grid"),
  emptyState: document.querySelector("#empty-state"),
  apiError: document.querySelector("#api-error"),
  apiErrorMessage: document.querySelector("#api-error-message"),
  pagination: document.querySelector("#pagination"),
  serviceGrid: document.querySelector("#service-grid"),
  servicesError: document.querySelector("#services-error"),
  offerList: document.querySelector("#offer-list"),
  offersError: document.querySelector("#offers-error"),
  cartDrawer: document.querySelector("#cart-drawer"),
  cartBackdrop: document.querySelector("#drawer-backdrop"),
  cartContent: document.querySelector("#cart-content"),
  cartSummary: document.querySelector("#cart-summary"),
  cartTotal: document.querySelector("#cart-total"),
  detailDialog: document.querySelector("#detail-dialog"),
  detailContent: document.querySelector("#detail-content"),
  bookingDialog: document.querySelector("#booking-dialog"),
  bookingForm: document.querySelector("#booking-form"),
  bookingError: document.querySelector("#booking-error"),
  bookingConfirmation: document.querySelector("#booking-confirmation"),
  bookingGuests: document.querySelector("#booking-guests"),
  checkIn: document.querySelector("#check-in"),
  checkOut: document.querySelector("#check-out"),
  bookingCost: document.querySelector("#booking-cost"),
  toast: document.querySelector("#toast-message")
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0
  }).format(value);
}

function safeImageUrl(value) {
  try {
    const imageUrl = new URL(value);
    if (imageUrl.protocol === "https:" && imageUrl.hostname === "images.unsplash.com") {
      return imageUrl.href;
    }
  } catch {
    return "./assets/room-placeholder.svg";
  }

  return "./assets/room-placeholder.svg";
}

async function requestJson(path) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { Accept: "application/json" }
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con la API. Comprueba su disponibilidad y vuelve a intentarlo.");
    }
    throw error;
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`La API respondió con un formato no válido (HTTP ${response.status}).`);
    }
    throw error;
  }

  if (!response.ok) {
    throw new Error(body?.detail || body?.error || `La solicitud falló (HTTP ${response.status}).`);
  }

  return body;
}

function getRoomOffers(productId) {
  return state.promotions.filter((promotion) =>
    promotion.activa && promotion.productosIds?.includes(productId)
  );
}

function getRoomPrice(product) {
  const offer = getRoomOffers(product.id)
    .sort((first, second) => second.porcentajeDescuento - first.porcentajeDescuento)[0];
  return {
    offer,
    price: offer ? product.precioPorNoche * (1 - offer.porcentajeDescuento / 100) : product.precioPorNoche
  };
}

function renderCategories() {
  if (!elements.category) return;
  elements.category.replaceChildren(new Option("Todas", ""));
  for (const category of state.categories) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.nombre;
    elements.category.append(option);
  }
}

function renderProducts() {
  if (!elements.roomGrid) return;
  elements.roomGrid.setAttribute("aria-busy", "false");
  elements.catalogStatus.setAttribute("aria-busy", "false");
  elements.catalogStatus.textContent = state.total === 1
    ? "1 habitación disponible"
    : `${state.total} habitaciones disponibles`;
  elements.apiError.classList.add("d-none");
  elements.emptyState.classList.toggle("d-none", state.total > 0);
  elements.roomGrid.classList.toggle("d-none", state.total === 0);
  elements.pagination.classList.toggle("d-none", state.totalPages < 2);

  if (state.total === 0) {
    elements.roomGrid.replaceChildren();
    return;
  }

  const categoryById = new Map(state.categories.map((category) => [category.id, category.nombre]));
  elements.roomGrid.innerHTML = state.products.map((product, index) => {
    const { offer, price } = getRoomPrice(product);
    const inCart = state.cart.has(product.id);
    const image = safeImageUrl(product.imagenUrl);
    const category = categoryById.get(product.categoriaId) || "Habitación";
    const features = product.caracteristicas.slice(0, 2).map(escapeHtml).join('<span class="feature-separator">·</span>');

    return `
      <article class="room-card" style="--card-order:${index}">
        <button class="room-image-button" type="button" data-detail="${product.id}" aria-label="Ver detalle de ${escapeHtml(product.nombre)}">
          <img class="room-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.nombre)}" loading="lazy" data-room-image>
          <span class="room-category">${escapeHtml(category)}</span>
          ${offer ? `<span class="room-deal">${offer.porcentajeDescuento}% menos</span>` : ""}
          <span class="image-arrow" aria-hidden="true">↗</span>
        </button>
        <div class="room-card-body">
          <div class="room-card-title-row">
            <h3>${escapeHtml(product.nombre)}</h3>
            <span class="room-capacity" aria-label="Capacidad máxima ${product.capacidad} huéspedes">♙ ${product.capacidad}</span>
          </div>
          <p class="room-features">${features}</p>
          <div class="room-card-bottom">
            <div class="room-price">${offer ? `<del>${formatPrice(product.precioPorNoche)}</del>` : ""}
              <strong>${formatPrice(price)}</strong><span>/ noche</span>
            </div>
            <button class="room-add ${inCart ? "is-added" : ""}" type="button" data-cart-toggle="${product.id}" aria-pressed="${inCart}">
              ${inCart ? "Añadida ✓" : "Añadir +"}
            </button>
          </div>
        </div>
      </article>`;
  }).join("");

  for (const image of elements.roomGrid.querySelectorAll("[data-room-image]")) {
    image.addEventListener("error", () => {
      image.src = "./assets/room-placeholder.svg";
    }, { once: true });
  }

  renderPagination();
}

function renderPagination() {
  if (state.totalPages < 2) {
    elements.pagination.replaceChildren();
    return;
  }

  const previousDisabled = state.page <= 1 ? "disabled" : "";
  const nextDisabled = state.page >= state.totalPages ? "disabled" : "";
  elements.pagination.innerHTML = `
    <button class="page-button" type="button" data-page="${state.page - 1}" ${previousDisabled} aria-label="Página anterior">←</button>
    <span>Página <strong>${state.page}</strong> de ${state.totalPages}</span>
    <button class="page-button" type="button" data-page="${state.page + 1}" ${nextDisabled} aria-label="Página siguiente">→</button>`;
}

function renderServices() {
  if (!elements.serviceGrid) return;
  elements.serviceGrid.setAttribute("aria-busy", "false");
  elements.serviceGrid.innerHTML = state.services.map((service) => `
    <article class="service-card">
      <span class="service-icon" aria-hidden="true">${escapeHtml(service.icono)}</span>
      <div>
        <h3>${escapeHtml(service.nombre)}</h3>
        <p>${escapeHtml(service.descripcion)}</p>
        <span class="service-kind">${service.incluido ? "INCLUIDO" : "A SOLICITUD"}</span>
      </div>
    </article>`).join("");
}

function renderPromotions() {
  if (!elements.offerList) {
    renderCart();
    return;
  }
  elements.offerList.setAttribute("aria-busy", "false");
  elements.offerList.innerHTML = state.promotions.map((promotion, index) => `
    <article class="offer-card">
      <div class="offer-number">0${index + 1}</div>
      <div class="offer-copy">
        <span class="offer-label">${promotion.porcentajeDescuento}% DE DESCUENTO</span>
        <h3>${escapeHtml(promotion.nombre)}</h3>
        <p>${escapeHtml(promotion.descripcion)}</p>
      </div>
      <button class="offer-code" type="button" data-copy-code="${escapeHtml(promotion.codigo)}" aria-label="Copiar código ${escapeHtml(promotion.codigo)}">
        <span>CÓDIGO</span><strong>${escapeHtml(promotion.codigo)}</strong><small>Copiar</small>
      </button>
    </article>`).join("");
  if (state.products.length > 0) renderProducts();
  renderCart();
}

function showCatalogError(error) {
  if (!elements.roomGrid) return;
  elements.roomGrid.setAttribute("aria-busy", "false");
  elements.catalogStatus.setAttribute("aria-busy", "false");
  elements.catalogStatus.textContent = "";
  elements.roomGrid.replaceChildren();
  elements.emptyState.classList.add("d-none");
  elements.pagination.classList.add("d-none");
  elements.apiErrorMessage.textContent = error.message;
  elements.apiError.classList.remove("d-none");
}

async function loadProducts() {
  if (!elements.roomGrid) return;
  const requestId = ++state.catalogRequestId;
  elements.roomGrid.setAttribute("aria-busy", "true");
  elements.catalogStatus.setAttribute("aria-busy", "true");
  elements.apiError.classList.add("d-none");
  elements.emptyState.classList.add("d-none");
  elements.catalogStatus.textContent = "Buscando habitaciones…";
  const parameters = new URLSearchParams({
    pagina: String(state.page),
    tamanoPagina: "6"
  });
  const query = elements.search.value.trim();
  if (query) parameters.set("q", query);
  if (elements.category.value) parameters.set("categoriaId", elements.category.value);
  if (elements.guests.value) parameters.set("huespedes", elements.guests.value);
  if (elements.sort.value) parameters.set("orden", elements.sort.value);

  try {
    const result = await requestJson(`/api/productos?${parameters}`);
    if (requestId !== state.catalogRequestId) return;
    state.products = result.items;
    state.total = result.total;
    state.page = result.pagina;
    state.totalPages = result.totalPaginas;
    renderProducts();
  } catch (error) {
    if (requestId !== state.catalogRequestId) return;
    showCatalogError(error);
  }
}

async function loadSupportingResources() {
  const requests = [];
  if (elements.category || elements.roomGrid) {
    requests.push(requestJson("/api/categorias").then((categories) => {
      state.categories = categories;
      if (elements.categoriesError) elements.categoriesError.classList.add("d-none");
      if (elements.category) elements.category.disabled = false;
      renderCategories();
      renderProducts();
    }).catch((error) => {
      if (elements.category) elements.category.disabled = true;
      if (elements.categoriesError) showResourceError(elements.categoriesError, `No se pudieron cargar las categorías: ${error.message}`);
    }));
  }
  if (elements.serviceGrid) {
    requests.push(requestJson("/api/servicios").then((services) => {
      state.services = services;
      renderServices();
    }).catch((error) => {
      if (elements.servicesError) showResourceError(elements.servicesError, `No se pudieron cargar los servicios: ${error.message}`);
    }));
  }
  requests.push(requestJson("/api/promociones").then((promotions) => {
      state.promotions = promotions;
      renderPromotions();
    }).catch((error) => {
      if (elements.offersError) showResourceError(elements.offersError, `No se pudieron cargar las promociones: ${error.message}`);
    }));

  await Promise.all(requests);
}

function showResourceError(element, message) {
  element.textContent = message;
  element.classList.remove("d-none");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
}

function renderCart() {
  if (!elements.cartContent) return;
  const rooms = [...state.cart.values()];
  const count = document.querySelector("[data-cart-count]");
  if (count) count.textContent = String(rooms.length);
  elements.cartSummary.classList.toggle("d-none", rooms.length === 0);

  if (rooms.length === 0) {
    elements.cartContent.innerHTML = `
      <div class="cart-empty">
        <span aria-hidden="true">⌑</span>
        <h3>Tu selección está esperando.</h3>
        <p>Añade una habitación para planear tu próxima estadía en Huancayo.</p>
        <button class="text-link" type="button" data-close-cart>Explorar habitaciones <span aria-hidden="true">↗</span></button>
      </div>`;
    return;
  }

  elements.cartContent.innerHTML = rooms.map(({ product }) => {
    const { offer, price } = getRoomPrice(product);
    return `
      <article class="cart-room">
        <img src="${escapeHtml(safeImageUrl(product.imagenUrl))}" alt="" data-cart-image>
        <div class="cart-room-copy"><span>${formatPrice(price)} / noche</span><h3>${escapeHtml(product.nombre)}</h3>
          ${offer ? `<small>${offer.porcentajeDescuento}% de descuento aplicado</small>` : ""}
          <button class="cart-remove" type="button" data-remove-room="${product.id}">Quitar</button>
        </div>
      </article>`;
  }).join("");

  for (const image of elements.cartContent.querySelectorAll("[data-cart-image]")) {
    image.addEventListener("error", () => {
      image.src = "./assets/room-placeholder.svg";
    }, { once: true });
  }

  const estimatePerNight = rooms.reduce((total, { product }) => total + getRoomPrice(product).price, 0);
  elements.cartTotal.textContent = formatPrice(estimatePerNight);
}

function restoreCart() {
  try {
    const savedCart = sessionStorage.getItem("hotel-incontrastable-cart");
    if (!savedCart) return;
    const rooms = JSON.parse(savedCart);
    if (!Array.isArray(rooms)) throw new TypeError("El formato guardado no es una lista.");
    for (const item of rooms) {
      const product = item?.product;
      if (Number.isInteger(product?.id) && product.id > 0 && typeof product.nombre === "string") {
        state.cart.set(product.id, { product });
      }
    }
  } catch (error) {
    showToast(`No se pudo recuperar la selección guardada: ${error.message}`);
  }
}

function persistCart() {
  try {
    sessionStorage.setItem("hotel-incontrastable-cart", JSON.stringify([...state.cart.values()]));
  } catch (error) {
    showToast(`No se pudo guardar la selección en esta pestaña: ${error.message}`);
  }
}

function openCart() {
  if (!elements.cartDrawer || !elements.cartBackdrop) return;
  elements.cartBackdrop.hidden = false;
  requestAnimationFrame(() => {
    elements.cartBackdrop.classList.add("is-visible");
    elements.cartDrawer.classList.add("is-open");
    elements.cartDrawer.setAttribute("aria-hidden", "false");
  });
  document.body.classList.add("drawer-open");
  elements.cartDrawer.querySelector("[data-close-cart]").focus();
}

function closeCart() {
  if (!elements.cartDrawer || !elements.cartBackdrop) return;
  elements.cartBackdrop.classList.remove("is-visible");
  elements.cartDrawer.classList.remove("is-open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  window.setTimeout(() => {
    if (!elements.cartDrawer.classList.contains("is-open")) elements.cartBackdrop.hidden = true;
  }, 250);
}

function showDetail(product) {
  if (!elements.detailContent || !elements.detailDialog) return;
  state.details.set(product.id, product);
  const category = state.categories.find((item) => item.id === product.categoriaId)?.nombre || "Habitación";
  const { offer, price } = getRoomPrice(product);
  elements.detailContent.innerHTML = `
    <div class="detail-image-wrap">
      <img class="detail-image" src="${escapeHtml(safeImageUrl(product.imagenUrl))}" alt="${escapeHtml(product.nombre)}">
      <span class="room-category">${escapeHtml(category)}</span>
    </div>
    <div class="detail-copy">
      <p class="eyebrow">${escapeHtml(category)} · HASTA ${product.capacidad} HUÉSPEDES</p>
      <h2 id="detail-title">${escapeHtml(product.nombre)}</h2>
      <p>${escapeHtml(product.descripcion)}</p>
      <div class="detail-meta"><span>♙ ${product.capacidad} huéspedes</span><span>▱ ${product.metrosCuadrados} m²</span><span>⌂ ${escapeHtml(product.tipoCama)}</span></div>
      <ul class="detail-features">${product.caracteristicas.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
      ${offer ? `<div class="detail-promo">${offer.porcentajeDescuento}% de descuento · ${escapeHtml(offer.nombre)}</div>` : ""}
      <div class="detail-price"><span>Desde</span>${offer ? `<del>${formatPrice(product.precioPorNoche)}</del>` : ""}<strong>${formatPrice(price)}</strong><span>por noche</span></div>
      <button class="btn btn-primary-brand w-100" type="button" data-detail-add="${product.id}">Añadir a mi selección <span aria-hidden="true">↗</span></button>
    </div>`;
  elements.detailDialog.showModal();
}

async function loadDetail(productId) {
  try {
    const product = await requestJson(`/api/productos/${productId}`);
    state.details.set(product.id, product);
    showDetail(product);
  } catch (error) {
    showToast(error.message);
  }
}

function addRoomToCart(productId) {
  if (state.cart.has(productId)) {
    showToast("Esa habitación ya está en tu selección.");
    return;
  }

  const product = state.products.find((item) => item.id === productId) ||
    state.details.get(productId) ||
    [...state.cart.values()].map(({ product: item }) => item).find((item) => item.id === productId);
  if (!product) {
    showToast("No pudimos encontrar esa habitación. Recarga el catálogo e inténtalo nuevamente.");
    return;
  }

  state.cart.set(productId, { product });
  persistCart();
  renderCart();
  renderProducts();
  showToast("Habitación añadida a tu selección.");
}

function removeRoomFromCart(productId) {
  state.cart.delete(productId);
  persistCart();
  renderCart();
  renderProducts();
}

function getDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysToDate(value, days) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getDateInputValue(date);
}

function getStayNights(checkIn, checkOut) {
  const [inYear, inMonth, inDay] = checkIn.split("-").map(Number);
  const [outYear, outMonth, outDay] = checkOut.split("-").map(Number);
  const arrival = Date.UTC(inYear, inMonth - 1, inDay);
  const departure = Date.UTC(outYear, outMonth - 1, outDay);
  return Math.round((departure - arrival) / 86_400_000);
}

function prepareBookingForm() {
  const rooms = [...state.cart.values()];
  const maxGuests = rooms.reduce((sum, { product }) => sum + product.capacidad, 0);
  elements.bookingGuests.replaceChildren();

  for (let guests = 1; guests <= maxGuests; guests += 1) {
    const option = document.createElement("option");
    option.value = String(guests);
    option.textContent = `${guests} ${guests === 1 ? "huésped" : "huéspedes"}`;
    elements.bookingGuests.append(option);
  }

  elements.bookingGuests.value = String(Math.min(2, maxGuests));
  elements.bookingError.classList.add("d-none");
  elements.bookingConfirmation.classList.add("d-none");
  elements.bookingForm.classList.remove("d-none");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const arrival = getDateInputValue(tomorrow);
  elements.checkIn.min = getDateInputValue(new Date());
  elements.checkIn.value = arrival;
  elements.checkOut.min = addDaysToDate(arrival, 1);
  elements.checkOut.value = addDaysToDate(arrival, 2);
  updateBookingEstimate();
  closeCart();
  elements.bookingDialog.showModal();
}

function updateBookingEstimate() {
  const checkIn = elements.checkIn.value;
  const checkOut = elements.checkOut.value;
  if (!checkIn || !checkOut) {
    elements.bookingCost.textContent = "Elige fechas de llegada y salida.";
    return;
  }
  const nights = getStayNights(checkIn, checkOut);
  const nightlyTotal = [...state.cart.values()].reduce(
    (total, { product }) => total + getRoomPrice(product).price,
    0
  );
  elements.bookingCost.textContent = nights > 0
    ? `Estimado: ${formatPrice(nightlyTotal * nights)} por ${nights} ${nights === 1 ? "noche" : "noches"} · no se realizará ningún cobro.`
    : "Elige una fecha de salida posterior a la llegada.";
}

function submitBooking(event) {
  event.preventDefault();
  elements.bookingError.classList.add("d-none");
  const checkIn = elements.checkIn.value;
  const checkOut = elements.checkOut.value;
  const guests = Number(elements.bookingGuests.value);
  const name = document.querySelector("#guest-name").value.trim();
  const email = document.querySelector("#guest-email").value.trim();
  const rooms = [...state.cart.values()];
  const maxGuests = rooms.reduce((sum, { product }) => sum + product.capacidad, 0);

  if (rooms.length === 0) {
    showBookingError("Añade al menos una habitación antes de simular la reserva.");
    return;
  }
  if (!checkIn || !checkOut || getStayNights(checkIn, checkOut) < 1) {
    showBookingError("La salida debe ser posterior a la fecha de llegada.");
    return;
  }
  if (guests < 1 || guests > maxGuests) {
    showBookingError(`La selección admite hasta ${maxGuests} huéspedes.`);
    return;
  }
  if (!name || !document.querySelector("#guest-email").checkValidity()) {
    showBookingError("Ingresa un nombre y un correo electrónico válido para continuar.");
    return;
  }

  const nights = getStayNights(checkIn, checkOut);
  const nightlyTotal = rooms.reduce((total, { product }) => total + getRoomPrice(product).price, 0);
  const reservationCode = `HI-DEMO-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const arrivalLabel = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${checkIn}T12:00:00`));
  const departureLabel = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${checkOut}T12:00:00`));
  const roomNames = rooms.map(({ product }) => product.nombre).join(", ");

  elements.bookingForm.classList.add("d-none");
  elements.bookingConfirmation.innerHTML = `
    <span class="confirmation-icon" aria-hidden="true">✓</span>
    <p class="eyebrow">SIMULACIÓN COMPLETADA</p>
    <h3>¡Gracias, ${escapeHtml(name)}!</h3>
    <p>Tu solicitud de demostración para <strong>${escapeHtml(roomNames)}</strong> está lista.</p>
    <div class="confirmation-details"><span>Fechas</span><strong>${escapeHtml(arrivalLabel)} — ${escapeHtml(departureLabel)}</strong><span>Huéspedes</span><strong>${guests}</strong><span>Estimado</span><strong>${formatPrice(nightlyTotal * nights)}</strong></div>
    <p class="confirmation-code">Código de demostración <strong>${reservationCode}</strong></p>
    <p class="confirmation-note">Esta referencia no corresponde a una reserva real. No se guardaron tus datos ni se efectuó un pago.</p>
    <button class="btn btn-primary-brand w-100" type="button" data-close-booking>Entendido</button>`;
  elements.bookingConfirmation.classList.remove("d-none");
  state.cart.clear();
  persistCart();
  renderCart();
  renderProducts();
}

function showBookingError(message) {
  elements.bookingError.textContent = message;
  elements.bookingError.classList.remove("d-none");
}

function clearFilters() {
  elements.filters.reset();
  state.page = 1;
  loadProducts();
}

document.addEventListener("click", async (event) => {
  const detailButton = event.target.closest("[data-detail]");
  if (detailButton) {
    await loadDetail(Number(detailButton.dataset.detail));
    return;
  }

  const addButton = event.target.closest("[data-cart-toggle]");
  if (addButton) {
    const productId = Number(addButton.dataset.cartToggle);
    if (state.cart.has(productId)) {
      removeRoomFromCart(productId);
    } else {
      addRoomToCart(productId);
    }
    return;
  }

  const detailAddButton = event.target.closest("[data-detail-add]");
  if (detailAddButton) {
    addRoomToCart(Number(detailAddButton.dataset.detailAdd));
    elements.detailDialog.close();
    return;
  }

  const removeButton = event.target.closest("[data-remove-room]");
  if (removeButton) {
    removeRoomFromCart(Number(removeButton.dataset.removeRoom));
    return;
  }

  const pageButton = event.target.closest("[data-page]");
  if (pageButton && !pageButton.disabled) {
    state.page = Number(pageButton.dataset.page);
    await loadProducts();
    document.querySelector("#habitaciones").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const copyButton = event.target.closest("[data-copy-code]");
  if (copyButton) {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copyCode);
      showToast(`Código ${copyButton.dataset.copyCode} copiado.`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        showToast(`Usa el código ${copyButton.dataset.copyCode} en tu simulación.`);
      } else {
        throw error;
      }
    }
    return;
  }

  if (event.target.matches("[data-open-cart]")) openCart();
  if (event.target.closest("[data-close-cart]")) closeCart();
  if (event.target.matches("#drawer-backdrop")) closeCart();
  if (event.target.closest("[data-close-detail]")) elements.detailDialog.close();
  if (event.target.closest("[data-close-booking]")) elements.bookingDialog.close();
  if (event.target.matches("#start-booking")) prepareBookingForm();

  if (event.target.closest(".nav-link")) closeMobileNavigation();
});

function closeMobileNavigation() {
  const navigation = document.querySelector("#site-nav");
  const toggle = document.querySelector(".navbar-toggler");
  if (!navigation || !toggle) return;
  navigation.classList.remove("show");
  toggle.setAttribute("aria-expanded", "false");
}

const navigation = document.querySelector("#site-nav");
const navigationToggle = document.querySelector(".navbar-toggler");
navigationToggle?.addEventListener("click", () => {
  const isExpanded = navigationToggle.getAttribute("aria-expanded") === "true";
  navigationToggle.setAttribute("aria-expanded", String(!isExpanded));
  navigation?.classList.toggle("show", !isExpanded);
});

if (elements.filters) {
elements.filters.addEventListener("submit", (event) => {
  event.preventDefault();
  state.page = 1;
  loadProducts();
});
}

if (elements.search) {
elements.search.addEventListener("input", () => {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => {
    state.page = 1;
    loadProducts();
  }, 300);
});
}

for (const filter of [elements.category, elements.guests, elements.sort]) {
filter?.addEventListener("change", () => {
  state.page = 1;
  loadProducts();
});
}

document.querySelector("#clear-filters")?.addEventListener("click", clearFilters);
document.querySelector("#retry-api")?.addEventListener("click", loadProducts);
elements.bookingForm?.addEventListener("submit", submitBooking);
elements.checkIn?.addEventListener("change", () => {
if (!elements.checkIn.value) {
  updateBookingEstimate();
  return;
  }
  const minimumDeparture = addDaysToDate(elements.checkIn.value, 1);
  elements.checkOut.min = minimumDeparture;
  if (elements.checkOut.value < minimumDeparture) elements.checkOut.value = minimumDeparture;
  updateBookingEstimate();
});
elements.checkOut?.addEventListener("change", updateBookingEstimate);
elements.bookingGuests?.addEventListener("change", updateBookingEstimate);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

async function startApplication() {
  if (!apiBaseUrl && elements.roomGrid) {
    showCatalogError(new Error("Falta configurar la dirección de la API en frontend/config.js."));
    return;
  }

  restoreCart();
  renderCart();
  const requests = [loadSupportingResources()];
  if (elements.roomGrid) requests.push(loadProducts());
  await Promise.all(requests);
}

startApplication();
