/**
 * Apex Motors — Homework #26 Vibe Coding
 * 1:1 соответствие макетам home.png и form.png.
 * Загрузка через Axios, вывод карточек циклом for.
 * Интерактивный выбор цвета с переключением на реальные фотографии автомобиля
 * без использования CSS-фильтров, brightness, contrast или overlay.
 */

// Глобальное состояние
let data = {};
let activeBrand = 'mercedes'; // Открытая по умолчанию вкладка
let currentSelectedCar = null; // Текущий автомобиль в модальном окне

// Человекочитаемые названия брендов для заголовка
const brandTitles = {
  mercedes: 'Mercedes-Benz',
  bmw: 'BMW',
  porsche: 'Porsche'
};

// Технические характеристики для подзаголовка карточек (по макету home.png: "4.0 V8 Biturbo · 585 л.с.")
const carSpecs = {
  'Mercedes-Benz S 500': '4.0 V8 · 503 л.с.',
  'Mercedes-AMG G 63': '4.0 V8 Biturbo · 585 л.с.',
  'Mercedes-Benz E 300': '2.0 I4 Hybrid · 258 л.с.',
  'Mercedes-Benz GLE 450': '3.0 I6 Turbo · 381 л.с.',
  'Mercedes-AMG C 63 S': '2.0 I4 Hybrid · 680 л.с.',
  'BMW X5 xDrive40i': '3.0 I6 TwinPower · 381 л.с.',
  'BMW M4 Competition': '3.0 I6 TwinPower · 510 л.с.',
  'BMW 740d xDrive': '3.0 I6 Diesel · 299 л.с.',
  'BMW X6 M Competition': '4.4 V8 M TwinPower · 625 л.с.',
  'BMW iX xDrive50': 'Dual Electric Motor · 523 л.с.',
  'Porsche 911 Carrera S': '3.0 Boxer-6 Biturbo · 450 л.с.',
  'Porsche Cayenne Turbo': '4.0 V8 Biturbo · 550 л.с.',
  'Porsche Panamera 4S': '2.9 V6 Biturbo · 440 л.с.',
  'Porsche Macan GTS': '2.9 V6 Biturbo · 440 л.с.',
  'Porsche Taycan Turbo S': 'Dual Permanent Magnet · 761 л.с.'
};

// Официальные названия премиальных оттенков (по макету form.png: "Obsidian Black")
const luxuryColorNames = {
  '#0B0B0D': 'Obsidian Black',
  '#0b0b0d': 'Obsidian Black',
  '#C7C9CC': 'High-Tech Silver',
  '#c7c9cc': 'High-Tech Silver',
  '#2E3A4E': 'Nautical Blue',
  '#2e3a4e': 'Nautical Blue',
  '#5B5D5F': 'Selenite Grey',
  '#5b5d5f': 'Selenite Grey',
  '#F4F5F6': 'Polar White',
  '#f4f5f6': 'Polar White',
  '#4A4E52': 'Graphite Grey',
  '#4a4e52': 'Graphite Grey',
  '#1C2331': 'Midnight Blue',
  '#1c2331': 'Midnight Blue',
  '#7A2E2E': 'Designo Hyacinth Red',
  '#7a2e2e': 'Designo Hyacinth Red',
  '#3A4A3F': 'Emerald Green',
  '#3a4a3f': 'Emerald Green',
  '#1C2A45': 'Tanzanite Blue',
  '#1c2a45': 'Tanzanite Blue',
  '#2E5BFF': 'Portimao Blue',
  '#2e5bff': 'Portimao Blue',
  '#3A9B5C': 'Isle of Man Green',
  '#3a9b5c': 'Isle of Man Green',
  '#C7352E': 'Guards Red',
  '#c7352e': 'Guards Red',
  '#F2C230': 'Racing Yellow',
  '#f2c230': 'Racing Yellow',
  '#3A2E4E': 'Amethyst Metallic',
  '#3a2e4e': 'Amethyst Metallic',
  '#1C4532': 'Python Green',
  '#1c4532': 'Python Green',
  '#4E9BB8': 'Frozen Blue Metallic',
  '#4e9bb8': 'Frozen Blue Metallic'
};

// ==========================================================================
// 1. Загрузка данных через Axios
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
  initTabs();
  initModalListeners();

  axios
    .get('data/data.json')
    .then(function (response) {
      data = response.data;
      console.log('Данные автосалона Apex Motors успешно загружены:', data);

      // Первый вывод автомобилей
      renderCards(activeBrand);
    })
    .catch(function (error) {
      console.error('Ошибка загрузки data/data.json:', error);
      const cardsEl = document.querySelector('.cards');
      if (cardsEl) {
        cardsEl.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: #EF4444; background: rgba(239, 68, 68, 0.1); border-radius: 16px;">
            <h3>Ошибка загрузки каталога</h3>
            <p style="margin-top: 8px; color: #A1A1AA;">Не удалось загрузить data/data.json. Убедитесь, что сайт запущен через Live Server.</p>
          </div>
        `;
      }
    });
});

// ==========================================================================
// 2. Вкладки категорий (Mercedes, BMW, Porsche)
// ==========================================================================
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const selectedBrand = this.getAttribute('data-brand');
      if (selectedBrand === activeBrand) return;

      activeBrand = selectedBrand;

      tabButtons.forEach(function (btn) {
        btn.classList.remove('active');
      });
      this.classList.add('active');

      updateHeaderTitles(activeBrand);
      renderCards(activeBrand);
    });
  });
}

function updateHeaderTitles(brand) {
  const brandTitleEl = document.getElementById('brandTitle');
  const modelsCountEl = document.getElementById('modelsCount');

  if (brandTitleEl) {
    brandTitleEl.textContent = brandTitles[brand] || brand;
  }

  if (modelsCountEl && data[brand]) {
    const count = data[brand].length;
    modelsCountEl.textContent = `${count} ${pluralize(count)} в салоне`;
  }
}

function pluralize(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'модель';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'модели';
  return 'моделей';
}

// ==========================================================================
// 3. Сетка карточек автомобилей
// Карточки строятся строго циклом for по паттерну: пустая строка → накопление → одна вставка
// ==========================================================================
function renderCards(brand) {
  const cars = data[brand];
  if (!cars) return;

  let html = '';

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const spec = carSpecs[car.title] || '4.0 V8 Biturbo · 585 л.с.';

    // Бейдж остатка: только если count === 1
    let badgeHtml = '';
    if (car.count === 1) {
      badgeHtml = `
        <div class="card-badge">
          <span class="badge-dot"></span>
          <span>Осталась 1</span>
        </div>
      `;
    }

    // Подсветка второй карточки как в макете home.png
    const featuredClass = i === 1 ? 'featured' : '';

    html =
      html +
      `
      <div class="card ${featuredClass}" onclick="openModal('${brand}', ${i})">
        ${badgeHtml}
        
        <div class="card-image-box">
          <img 
            class="card-image" 
            src="${car.image}" 
            alt="${car.title}" 
            loading="lazy"
            onerror="handleImageError(this, '${escapeHtml(car.title)}')"
          />
          <div class="card-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span class="placeholder-title">Фото: ${escapeHtml(car.title)}</span>
            <span class="placeholder-browse">or browse files</span>
          </div>
        </div>

        <div class="card-info">
          <h3 class="card-title">${escapeHtml(car.title)}</h3>
          <p class="card-specs">${escapeHtml(spec)}</p>

          <div class="card-footer">
            <span class="card-price">$${car.price.toLocaleString('en-US')}</span>
            <button 
              type="button" 
              class="btn btn-card" 
              onclick="handleCardOrder(event, '${brand}', ${i})"
            >
              Заказать
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Однократная вставка после завершения цикла
  document.querySelector('.cards').innerHTML = html;
  updateHeaderTitles(brand);
}

function handleImageError(imgEl, carTitle) {
  console.warn('Изображение не найдено:', imgEl.src, 'для авто:', carTitle);
  imgEl.style.display = 'none';

  const placeholder = imgEl.nextElementSibling;
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
}

function handleCardOrder(event, brand, index) {
  event.stopPropagation();
  const car = data[brand][index];
  alert(`Заявка на ${car.title} принята!`);
}

// ==========================================================================
// 4. Модальное окно деталей с реальными фотографиями каждого цвета
// ==========================================================================
function openModal(brand, index) {
  const car = data[brand][index];
  if (!car) return;

  currentSelectedCar = car;

  const modal = document.getElementById('carModal');
  const modalImage = document.getElementById('modalImage');
  const modalImagePlaceholder = document.getElementById('modalImagePlaceholder');
  const modalPlaceholderText = document.getElementById('modalPlaceholderText');
  const modalCategoryTag = document.getElementById('modalCategoryTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalDescription = document.getElementById('modalDescription');
  const modalStockText = document.getElementById('modalStockText');
  const modalColors = document.getElementById('modalColors');
  const activeColorName = document.getElementById('activeColorName');

  // Установка фото начального цвета (первый цвет из availableColors)
  const initialColor = car.availableColors[0];
  const initialPhotoSrc = (car.colorImages && car.colorImages[initialColor]) || car.image;

  modalImage.style.display = 'block';
  modalImagePlaceholder.style.display = 'none';
  modalImage.src = initialPhotoSrc;
  modalImage.alt = car.title;

  modalImage.onerror = function () {
    console.warn('Изображение в модальном окне не найдено:', modalImage.src);
    modalImage.style.display = 'none';
    modalImagePlaceholder.style.display = 'flex';
    modalPlaceholderText.textContent = `Фото: ${car.title}, крупно`;
  };

  // Текстовые поля по макету form.png
  const brandTag = (brandTitles[brand] || brand).toUpperCase().replace('-', ' ');
  modalCategoryTag.textContent = `${brandTag} · 2026`;
  modalTitle.textContent = car.title;
  modalPrice.textContent = `$${car.price.toLocaleString('en-US')}`;
  modalDescription.textContent = car.description;
  modalStockText.innerHTML = `В наличии: <strong>${car.count} шт.</strong>`;

  // Кружки цветов — строятся ЦИКЛОМ for с накоплением строки
  let colorsHtml = '';
  for (let i = 0; i < car.availableColors.length; i++) {
    const colorHex = car.availableColors[i];
    const isSelected = i === 0 ? 'selected' : '';
    const colorName = luxuryColorNames[colorHex] || colorHex;
    colorsHtml =
      colorsHtml +
      `
      <span 
        class="color-dot ${isSelected}" 
        style="background: ${colorHex}" 
        data-color="${colorHex}" 
        title="${colorName}"
        onclick="selectModalColor(this, '${colorHex}')"
      ></span>
    `;
  }
  modalColors.innerHTML = colorsHtml;

  // Отображаем название начального цвета (например, "Obsidian Black")
  if (activeColorName && car.availableColors.length > 0) {
    activeColorName.textContent = luxuryColorNames[initialColor] || initialColor;
  }

  // Открытие окна добавлением класса open
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Интерактивный выбор цвета автомобиля
 * ПРЯМАЯ смена src на отдельную реальную фотографию автомобиля нужного цвета.
 * БЕЗ использования CSS-фильтров, brightness, contrast, opacity или overlays!
 */
function selectModalColor(dotElement, hexColor) {
  if (!currentSelectedCar) return;

  // Обновляем выделение кружка (белая рамка и мягкое свечение по макету)
  const dots = document.querySelectorAll('.color-dot');
  dots.forEach(function (dot) {
    dot.classList.remove('selected');
  });
  dotElement.classList.add('selected');

  // Обновляем текстовое название премиального цвета
  const activeColorName = document.getElementById('activeColorName');
  if (activeColorName) {
    activeColorName.textContent = luxuryColorNames[hexColor] || hexColor;
  }

  // Находим отдельный файл фотографии машины в этом цвете
  const modalImage = document.getElementById('modalImage');
  if (modalImage && currentSelectedCar.colorImages) {
    const photoUrl = currentSelectedCar.colorImages[hexColor];
    if (photoUrl) {
      modalImage.src = photoUrl;
    }
  }
}

function closeModal() {
  const modal = document.getElementById('carModal');
  if (modal) {
    modal.classList.remove('open');
  }
  document.body.style.overflow = '';
}

function initModalListeners() {
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalOrderBtn = document.getElementById('modalOrderBtn');

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Кнопка «Заказать» в окне: alert с названием машины
  if (modalOrderBtn) {
    modalOrderBtn.addEventListener('click', function () {
      if (currentSelectedCar) {
        alert(`Заявка на ${currentSelectedCar.title} принята!`);
      }
    });
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Экспорт для inline-обработчиков
window.openModal = openModal;
window.closeModal = closeModal;
window.handleCardOrder = handleCardOrder;
window.handleImageError = handleImageError;
window.selectModalColor = selectModalColor;
