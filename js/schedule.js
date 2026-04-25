const scheduleState = {
  allClasses: [],
  filteredClasses: [],
  selectedDate: '',
  selectedClassId: null,
  bookingCounts: new Map(),
  userBookingIds: new Set(),
};

const daysEl = document.querySelector('[data-days]');
const listEl = document.querySelector('[data-class-list]');
const detailEl = document.querySelector('[data-class-detail]');
const filtersForm = document.querySelector('[data-filters-form]');
const filtersToggle = document.querySelector('[data-filters-toggle]');
const filtersToggleText = document.querySelector('[data-filters-toggle-text]');

const WEEK_DAYS = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

function formatDateForDB(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekDates() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return dates;
}

function formatTime(time) {
  return String(time).slice(0, 5);
}

function getClassBookedCount(classId) {
  return scheduleState.bookingCounts.get(classId) || 0;
}

function getPlacesText(classItem) {
  return `${getClassBookedCount(classItem.id)}/${classItem.capacity}`;
}

function isClassFull(classItem) {
  return getClassBookedCount(classItem.id) >= classItem.capacity;
}

function getUniqueOptions(key) {
  return [...new Set(scheduleState.allClasses.map((item) => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'));
}

function fillFilterSelects() {
  if (!filtersForm) return;

  ['type', 'goal', 'muscle_group', 'level', 'time_of_day'].forEach((key) => {
    const select = filtersForm.elements[key];
    if (!select) return;

    const firstOption = select.options[0];
    select.innerHTML = '';
    select.append(firstOption);

    getUniqueOptions(key).forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  });
}

function renderDays() {
  const weekDates = getWeekDates();
  if (!scheduleState.selectedDate) {
    scheduleState.selectedDate = formatDateForDB(weekDates[0]);
  }

  daysEl.innerHTML = weekDates.map((date) => {
    const dbDate = formatDateForDB(date);
    const label = `${WEEK_DAYS[date.getDay()]} ${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
    const isActive = dbDate === scheduleState.selectedDate;

    return `<button class="schedule-days__button${isActive ? ' is-active' : ''}" type="button" data-date="${dbDate}">${label}</button>`;
  }).join('');
}

function applyFilters() {
  const formData = new FormData(filtersForm);

  scheduleState.filteredClasses = scheduleState.allClasses.filter((item) => {
    return ['type', 'goal', 'muscle_group', 'level', 'time_of_day'].every((key) => {
      const value = formData.get(key);
      return !value || item[key] === value;
    });
  });

  const dayClasses = getSelectedDayClasses();
  if (!dayClasses.some((item) => item.id === scheduleState.selectedClassId)) {
    scheduleState.selectedClassId = dayClasses[0]?.id || null;
  }

  renderDays();
  renderList();
  renderDetail();
}

function getSelectedDayClasses() {
  return scheduleState.filteredClasses
    .filter((item) => item.date === scheduleState.selectedDate)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
}

function renderList() {
  const classes = getSelectedDayClasses();

  if (!classes.length) {
    listEl.innerHTML = '<p class="schedule-empty">На этот день занятий нет или они не подходят под фильтры.</p>';
    return;
  }

  listEl.innerHTML = classes.map((item) => {
    const isActive = item.id === scheduleState.selectedClassId;
    return `
      <button class="schedule-card${isActive ? ' is-active' : ''}" type="button" data-class-id="${item.id}">
        <span class="schedule-card__top">
          <strong class="schedule-card__title">${item.title}</strong>
          <span class="schedule-card__places${isClassFull(item) ? ' is-full' : ''}">${getPlacesText(item)}</span>
        </span>
        <span class="schedule-card__bottom">
          <span>${formatTime(item.start_time)}–${formatTime(item.end_time)}</span>
          <span>Тренер: ${item.trainer_name}</span>
        </span>
      </button>
    `;
  }).join('');
}

function renderDetail() {
  const item = scheduleState.filteredClasses.find((classItem) => classItem.id === scheduleState.selectedClassId);

  if (!item) {
    detailEl.innerHTML = '<p class="schedule-detail__placeholder">Выберите тренировку слева, чтобы посмотреть описание.</p>';
    return;
  }

  const alreadyBooked = scheduleState.userBookingIds.has(item.id);
  const full = isClassFull(item);
  const buttonText = alreadyBooked ? 'Вы записаны' : full ? 'Мест нет' : 'Записаться';
  const disabled = alreadyBooked || full;

  detailEl.innerHTML = `
    <article class="schedule-detail__card">
      <div class="schedule-detail__top">
        <h2 class="schedule-detail__title">${item.title}</h2>
        <span class="schedule-detail__places${full ? ' is-full' : ''}">${getPlacesText(item)}</span>
      </div>
      <p class="schedule-detail__text">${item.description || 'Описание скоро появится.'}</p>
      <div class="schedule-detail__bottom">
        <p class="schedule-detail__meta">
          <span>${formatTime(item.start_time)}–${formatTime(item.end_time)}</span>
          <span>Тренер: ${item.trainer_name}</span>
        </p>
        <button class="schedule-detail__button" type="button" data-book-class="${item.id}" ${disabled ? 'disabled' : ''}>${buttonText}</button>
      </div>
    </article>
  `;
}

async function loadUserBookings(user) {
  scheduleState.userBookingIds.clear();
  if (!user) return;

  const { data, error } = await supabaseClient
    .from('class_bookings')
    .select('class_id')
    .eq('user_id', user.id);

  if (!error && data) {
    data.forEach((item) => scheduleState.userBookingIds.add(item.class_id));
  }
}

async function loadBookingCounts(classIds) {
  scheduleState.bookingCounts.clear();

  if (!classIds.length) return;

  const { data, error } = await supabaseClient
    .from('class_bookings')
    .select('class_id')
    .in('class_id', classIds);

  if (error) {
    console.warn('Не получилось загрузить количество записей. Проверь RLS для class_bookings.', error);
    return;
  }

  data.forEach((item) => {
    scheduleState.bookingCounts.set(item.class_id, (scheduleState.bookingCounts.get(item.class_id) || 0) + 1);
  });
}

async function bookClass(classId) {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    if (window.openAuthModalGlobal) {
      window.openAuthModalGlobal();
    } else {
      alert('Войдите в аккаунт, чтобы записаться на тренировку');
    }

    return;
  }

  const classItem = scheduleState.allClasses.find((item) => item.id === classId);
  if (!classItem) return;

  if (isClassFull(classItem)) {
    alert('На это занятие уже нет свободных мест');
    return;
  }

  const { error } = await supabaseClient
    .from('class_bookings')
    .insert({ user_id: user.id, class_id: classId });

  if (error) {
    if (error.code === '23505') {
      alert('Вы уже записаны на это занятие');
    } else {
      console.error(error);
      alert('Не удалось записаться. Попробуйте позже');
    }
    return;
  }

  scheduleState.userBookingIds.add(classId);
  scheduleState.bookingCounts.set(classId, getClassBookedCount(classId) + 1);
  alert('Вы записаны на занятие');
  renderList();
  renderDetail();
}

async function loadClasses() {
  listEl.innerHTML = '<p class="schedule-empty">Загружаем расписание...</p>';

  const weekDates = getWeekDates();
  const weekStart = formatDateForDB(weekDates[0]);
  const weekEnd = formatDateForDB(weekDates[weekDates.length - 1]);

  const { data, error } = await supabaseClient
    .from('classes')
    .select('*')
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error(error);
    listEl.innerHTML = '<p class="schedule-empty">Не удалось загрузить расписание. Проверь подключение Supabase.</p>';
    return;
  }

  scheduleState.allClasses = data || [];
  scheduleState.filteredClasses = [...scheduleState.allClasses];

  const { data: { user } } = await supabaseClient.auth.getUser();
  await Promise.all([
    loadUserBookings(user),
    loadBookingCounts(scheduleState.allClasses.map((item) => item.id)),
  ]);

  const params = new URLSearchParams(window.location.search);
  const classFromUrl = Number(params.get('class'));

  if (classFromUrl && user) {
    await bookClass(classFromUrl);
    window.history.replaceState({}, '', 'schedule.html');
    return;
  }

  fillFilterSelects();

  const selectedDayWithClasses = weekDates.find((date) => {
    const dbDate = formatDateForDB(date);
    return scheduleState.filteredClasses.some((item) => item.date === dbDate);
  });

  if (selectedDayWithClasses) {
    scheduleState.selectedDate = formatDateForDB(selectedDayWithClasses);
  }

  scheduleState.selectedClassId = getSelectedDayClasses()[0]?.id || null;

  renderDays();
  renderList();
  renderDetail();
}

filtersToggle?.addEventListener('click', () => {
  const isHidden = filtersForm.hidden;
  filtersForm.hidden = !isHidden;
  filtersToggle.setAttribute('aria-expanded', String(isHidden));
  filtersToggleText.textContent = isHidden ? 'Скрыть фильтры' : 'Показать фильтры';
});

filtersForm?.addEventListener('change', applyFilters);
filtersForm?.addEventListener('reset', () => {
  setTimeout(applyFilters, 0);
});

daysEl?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-date]');
  if (!button) return;

  scheduleState.selectedDate = button.dataset.date;
  scheduleState.selectedClassId = getSelectedDayClasses()[0]?.id || null;

  renderDays();
  renderList();
  renderDetail();
});

listEl?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-class-id]');
  if (!button) return;

  scheduleState.selectedClassId = Number(button.dataset.classId);
  renderList();
  renderDetail();
});

detailEl?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-book-class]');
  if (!button) return;

  bookClass(Number(button.dataset.bookClass));
});

loadClasses();
