const FALLBACK_TRAINERS = [
  {id:1,name:'Екатерина Логинова',role:'Инструктор групповых программ',specialization:'Йога',image:'../assets/img/index/trainer-1.jpg',url:'#'},
  {id:2,name:'Филиппова Александра',role:'Инструктор групповых программ',specialization:'Пилатес',image:'../assets/img/index/trainer-2.jpg',url:'#'},
  {id:3,name:'Самарин Артем',role:'Инструктор тренажерного зала',specialization:'Силовые тренировки',image:'../assets/img/index/trainer-3.jpg',url:'#'},
  {id:4,name:'Тарасова Екатерина',role:'Инструктор групповых программ',specialization:'TRX',image:'../assets/img/index/trainer-4.jpg',url:'#'},
  {id:5,name:'Михайлов Егор',role:'Инструктор групповых программ',specialization:'Йога',image:'../assets/img/index/trainer-5.jpg',url:'#'},
  {id:6,name:'Лучина Елена',role:'Инструктор групповых программ',specialization:'Пилатес',image:'../assets/img/index/trainer-6.jpg',url:'#'},
  {id:7,name:'Карягин Михаил',role:'Инструктор групповых программ',specialization:'Силовые тренировки',image:'../assets/img/index/trainer-7.jpg',url:'#'},
  {id:8,name:'Видякин Антон',role:'Инструктор тренажерного зала',specialization:'TRX',image:'../assets/img/index/trainer-8.jpg',url:'#'},
  {id:9,name:'Связяева Марина',role:'Инструктор групповых программ',specialization:'Йога',image:'../assets/img/index/trainer-9.jpg',url:'#'},
  {id:10,name:'Петрова Алиса',role:'Инструктор групповых программ',specialization:'Пилатес',image:'../assets/img/index/trainer-10.jpg',url:'#'},
  {id:11,name:'Малышева Лаура',role:'Инструктор тренажерного зала',specialization:'Силовые тренировки',image:'../assets/img/index/trainer-11.jpg',url:'#'},
  {id:12,name:'Иванова Дарья',role:'Инструктор тренажерного зала',specialization:'TRX',image:'../assets/img/index/trainer-12.jpg',url:'#'}
];

const grid = document.querySelector('#trainersGrid');
const empty = document.querySelector('#trainersEmpty');
const searchInput = document.querySelector('#trainerSearch');
const resetButton = document.querySelector('#resetFilters');
const select = document.querySelector('[data-select]');
const selectButton = document.querySelector('.specialization-select__button');
const selectLabel = document.querySelector('[data-select-label]');
const dropdown = document.querySelector('[data-select-dropdown]');

let trainers = [];
let selectedSpecializations = new Set();

const normalize = (value) => value.toLowerCase().trim();

function cardTemplate(trainer) {
  return `
    <article class="trainer-card">
      <div class="trainer-card__photo-wrap">
        <img class="trainer-card__photo" src="${trainer.image}" alt="${trainer.name}" loading="lazy">
        <a class="trainer-card__link" href="${trainer.url || '#'}" aria-label="Подробнее о тренере ${trainer.name}">
          <img src="../assets/img/arrow-up-right.svg" alt="" aria-hidden="true">
        </a>
        <span class="trainer-card__tag">${trainer.specialization}</span>
      </div>
      <h2 class="trainer-card__name">${trainer.name}</h2>
      <p class="trainer-card__role">${trainer.role}</p>
    </article>
  `;
}

function renderSpecializations() {
  const specializations = [...new Set(trainers.map((trainer) => trainer.specialization))];

  dropdown.innerHTML = specializations.map((specialization) => `
    <label class="specialization-select__option">
      <input type="checkbox" value="${specialization}">
      <span>${specialization}</span>
    </label>
  `).join('');

  dropdown.querySelectorAll('input').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      checkbox.checked
        ? selectedSpecializations.add(checkbox.value)
        : selectedSpecializations.delete(checkbox.value);

      updateSelectLabel();
      renderTrainers();
    });
  });
}

function updateSelectLabel() {
  if (!selectedSpecializations.size) {
    selectLabel.textContent = 'Выберите специализацию тренера';
    return;
  }

  selectLabel.textContent = [...selectedSpecializations].join(', ');
}

function renderTrainers() {
  const searchValue = normalize(searchInput.value);

  const filtered = trainers.filter((trainer) => {
    const matchesSpecialization = !selectedSpecializations.size || selectedSpecializations.has(trainer.specialization);
    const matchesSearch = normalize(trainer.name).includes(searchValue);
    return matchesSpecialization && matchesSearch;
  });

  grid.innerHTML = filtered.map(cardTemplate).join('');
  empty.hidden = filtered.length > 0;
}

function closeSelect() {
  select.classList.remove('is-open');
  selectButton.setAttribute('aria-expanded', 'false');
}

function resetFilters() {
  selectedSpecializations.clear();
  searchInput.value = '';
  dropdown.querySelectorAll('input').forEach((checkbox) => checkbox.checked = false);
  updateSelectLabel();
  closeSelect();
  renderTrainers();
}

async function loadTrainers() {
  try {
    const response = await fetch('../data/trainers.json');
    if (!response.ok) throw new Error('Не удалось загрузить trainers.json');
    trainers = await response.json();
  } catch (error) {
    trainers = FALLBACK_TRAINERS;
  }

  renderSpecializations();
  renderTrainers();
}

selectButton.addEventListener('click', () => {
  const isOpen = select.classList.toggle('is-open');
  selectButton.setAttribute('aria-expanded', String(isOpen));
});

searchInput.addEventListener('input', renderTrainers);
resetButton.addEventListener('click', resetFilters);

document.addEventListener('click', (event) => {
  if (!select.contains(event.target)) closeSelect();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSelect();
});

loadTrainers();
