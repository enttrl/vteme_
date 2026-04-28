const FALLBACK_TRAINERS = [
  {
    "id": 1,
    "slug": "trainer-1",
    "name": "Екатерина Логинова",
    "role": "Инструктор групповых программ",
    "specialization": "Йога",
    "image": "../assets/img/index/trainer-1.jpg",
    "url": "trainer-detail.html?id=1",
    "education": "Высшее образование, НГУ им. П.Ф. Лесгафта",
    "experience": "с 2018 (7 лет)",
    "wideSpecializations": [
      "йога",
      "стретчинг",
      "здоровая спина",
      "дыхательные практики"
    ],
    "achievements": [
      "сертифицированный инструктор хатха-йоги",
      "участник профильных фитнес-конвенций"
    ]
  },
  {
    "id": 2,
    "slug": "trainer-2",
    "name": "Филиппова Александра",
    "role": "Инструктор групповых программ",
    "specialization": "Пилатес",
    "image": "../assets/img/index/trainer-2.jpg",
    "url": "trainer-detail.html?id=2",
    "education": "Высшее образование, направление «Физическая культура»",
    "experience": "с 2017 (8 лет)",
    "wideSpecializations": [
      "пилатес",
      "мобилити",
      "коррекция осанки",
      "растяжка"
    ],
    "achievements": [
      "сертифицированный тренер по Pilates Mat",
      "специалист по функциональной диагностике"
    ]
  },
  {
    "id": 3,
    "slug": "trainer-3",
    "name": "Самарин Артем",
    "role": "Инструктор тренажерного зала",
    "specialization": "Силовые тренировки",
    "image": "../assets/img/index/trainer-3.jpg",
    "url": "trainer-detail.html?id=3",
    "education": "Высшее образование, НГУ им. П.Ф. Лесгафта",
    "experience": "с 2009 (16 лет)",
    "wideSpecializations": [
      "персональные тренировки",
      "силовые тренировки",
      "триатлон",
      "функциональные тренировки"
    ],
    "achievements": [
      "КМС по пауэрлифтингу",
      "Финишер Ironman"
    ]
  },
  {
    "id": 4,
    "slug": "trainer-4",
    "name": "Тарасова Екатерина",
    "role": "Инструктор групповых программ",
    "specialization": "TRX",
    "image": "../assets/img/index/trainer-4.jpg",
    "url": "trainer-detail.html?id=4",
    "education": "Высшее образование, направление «Физическая культура»",
    "experience": "с 2016 (9 лет)",
    "wideSpecializations": [
      "TRX",
      "функциональный тренинг",
      "стретчинг",
      "работа с мобильностью"
    ],
    "achievements": [
      "сертифицированный TRX-инструктор",
      "призер региональных фитнес-соревнований"
    ]
  },
  {
    "id": 5,
    "slug": "trainer-5",
    "name": "Михайлов Егор",
    "role": "Инструктор групповых программ",
    "specialization": "Йога",
    "image": "../assets/img/index/trainer-5.jpg",
    "url": "trainer-detail.html?id=5",
    "education": "Высшее образование, спортивная подготовка",
    "experience": "с 2015 (10 лет)",
    "wideSpecializations": [
      "йога",
      "функциональная подготовка",
      "здоровая спина",
      "баланс"
    ],
    "achievements": [
      "сертифицированный инструктор по йоге",
      "участник международных семинаров"
    ]
  },
  {
    "id": 6,
    "slug": "trainer-6",
    "name": "Лучина Елена",
    "role": "Инструктор групповых программ",
    "specialization": "Пилатес",
    "image": "../assets/img/index/trainer-6.jpg",
    "url": "trainer-detail.html?id=6",
    "education": "Высшее образование, педагогика физической культуры",
    "experience": "с 2019 (6 лет)",
    "wideSpecializations": [
      "пилатес",
      "растяжка",
      "мягкий фитнес",
      "коррекция осанки"
    ],
    "achievements": [
      "сертифицированный тренер Pilates",
      "специалист по восстановительным тренировкам"
    ]
  },
  {
    "id": 7,
    "slug": "trainer-7",
    "name": "Карягин Михаил",
    "role": "Инструктор групповых программ",
    "specialization": "Силовые тренировки",
    "image": "../assets/img/index/trainer-7.jpg",
    "url": "trainer-detail.html?id=7",
    "education": "Высшее образование, физическая культура и спорт",
    "experience": "с 2012 (13 лет)",
    "wideSpecializations": [
      "силовые тренировки",
      "функциональные тренировки",
      "набор мышечной массы",
      "снижение веса"
    ],
    "achievements": [
      "МС по тяжелой атлетике",
      "победитель городских соревнований"
    ]
  },
  {
    "id": 8,
    "slug": "trainer-8",
    "name": "Видякин Антон",
    "role": "Инструктор тренажерного зала",
    "specialization": "TRX",
    "image": "../assets/img/index/trainer-8.jpg",
    "url": "trainer-detail.html?id=8",
    "education": "Высшее образование, спортивный менеджмент",
    "experience": "с 2014 (11 лет)",
    "wideSpecializations": [
      "TRX",
      "персональные тренировки",
      "функциональный тренинг",
      "ОФП"
    ],
    "achievements": [
      "сертифицированный персональный тренер",
      "тренер участников любительских стартов"
    ]
  },
  {
    "id": 9,
    "slug": "trainer-9",
    "name": "Связяева Марина",
    "role": "Инструктор групповых программ",
    "specialization": "Йога",
    "image": "../assets/img/index/trainer-9.jpg",
    "url": "trainer-detail.html?id=9",
    "education": "Высшее образование, адаптивная физическая культура",
    "experience": "с 2020 (5 лет)",
    "wideSpecializations": [
      "йога",
      "стретчинг",
      "медитация",
      "здоровая спина"
    ],
    "achievements": [
      "сертифицированный инструктор йоги",
      "ведущая групповых практик"
    ]
  },
  {
    "id": 10,
    "slug": "trainer-10",
    "name": "Петрова Алиса",
    "role": "Инструктор групповых программ",
    "specialization": "Пилатес",
    "image": "../assets/img/index/trainer-10.jpg",
    "url": "trainer-detail.html?id=10",
    "education": "Высшее образование, физическая реабилитация",
    "experience": "с 2018 (7 лет)",
    "wideSpecializations": [
      "пилатес",
      "реабилитационный фитнес",
      "мобилити",
      "растяжка"
    ],
    "achievements": [
      "сертифицированный тренер Pilates",
      "специалист по восстановлению после нагрузок"
    ]
  },
  {
    "id": 11,
    "slug": "trainer-11",
    "name": "Малышева Лаура",
    "role": "Инструктор тренажерного зала",
    "specialization": "Силовые тренировки",
    "image": "../assets/img/index/trainer-11.jpg",
    "url": "trainer-detail.html?id=11",
    "education": "Высшее образование, направление «Физическая культура»",
    "experience": "с 2013 (12 лет)",
    "wideSpecializations": [
      "силовые тренировки",
      "персональные тренировки",
      "функциональный тренинг",
      "снижение веса"
    ],
    "achievements": [
      "КМС по фитнес-бикини",
      "призер региональных соревнований"
    ]
  },
  {
    "id": 12,
    "slug": "trainer-12",
    "name": "Иванова Дарья",
    "role": "Инструктор тренажерного зала",
    "specialization": "TRX",
    "image": "../assets/img/index/trainer-12.jpg",
    "url": "trainer-detail.html?id=12",
    "education": "Высшее образование, спортивная подготовка",
    "experience": "с 2016 (9 лет)",
    "wideSpecializations": [
      "TRX",
      "персональные тренировки",
      "функциональные тренировки",
      "растяжка"
    ],
    "achievements": [
      "сертифицированный TRX-инструктор",
      "участник фитнес-конвенций"
    ]
  }
];

const page = document.querySelector('[data-trainer-page]');
const photo = document.querySelector('[data-trainer-photo]');
const nameEl = document.querySelector('[data-trainer-name]');
const roleEl = document.querySelector('[data-trainer-role]');
const educationEl = document.querySelector('[data-trainer-education]');
const experienceEl = document.querySelector('[data-trainer-experience]');
const specsEl = document.querySelector('[data-trainer-specializations]');
const achievementsEl = document.querySelector('[data-trainer-achievements]');
const signupButton = document.querySelector('[data-trainer-signup]');
const notFound = document.querySelector('[data-trainer-not-found]');

function getTrainerId() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id')) || 1;
}

function renderList(element, items) {
  element.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function renderTrainer(trainer) {
  document.title = `${trainer.name} — тренер ВТЕМЕ`;
  photo.src = trainer.image;
  photo.alt = trainer.name;
  nameEl.textContent = trainer.name;
  roleEl.textContent = trainer.role;
  educationEl.textContent = trainer.education;
  const currentYear = new Date().getFullYear();
  const experienceStart = trainer.experienceStart;
  const experienceYears = currentYear - experienceStart;

  experienceEl.textContent = `с ${experienceStart} (${experienceYears})`;
  renderList(specsEl, trainer.wideSpecializations || [trainer.specialization]);
  renderList(achievementsEl, trainer.achievements || []);

  signupButton.href = '#trial';

  signupButton.addEventListener('click', () => {
    sessionStorage.setItem('trainerName', trainer.name);
  });
  page.hidden = false;

}

async function loadTrainer() {
  let trainers = FALLBACK_TRAINERS;

  try {
    const response = await fetch('../data/trainers.json');
    if (response.ok) trainers = await response.json();
  } catch (error) {
    trainers = FALLBACK_TRAINERS;
  }

  const trainer = trainers.find((item) => item.id === getTrainerId());

  if (!trainer) {
    notFound.hidden = false;
    return;
  }

  renderTrainer(trainer);
}

loadTrainer();
