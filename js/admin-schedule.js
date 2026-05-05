
const ADMIN_EMAILS = [
  'mari.anisimova.05@inbox.ru'
];

const adminState = {
  classes: [],
  filteredDate: '',
  editingId: null,
};

const lockEl = document.querySelector('[data-admin-lock]');
const contentEl = document.querySelector('[data-admin-content]');
const formEl = document.querySelector('[data-class-form]');
const listEl = document.querySelector('[data-classes-list]');
const dateFilterEl = document.querySelector('[data-filter-date]');
const clearDateBtn = document.querySelector('[data-clear-date]');
const resetFormBtn = document.querySelector('[data-reset-form]');
const formTitleEl = document.querySelector('[data-form-title]');
const submitBtn = document.querySelector('[data-submit-button]');

function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    zIndex: '9999',
    padding: '14px 18px',
    borderRadius: '14px',
    background: isError ? '#dc2626' : '#22c55e',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
  });

  document.body.append(toast);
  setTimeout(() => toast.remove(), 2600);
}

function formatTime(time) {
  return String(time || '').slice(0, 5);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
}

function getFormPayload() {
  const formData = new FormData(formEl);

  return {
    title: formData.get('title')?.trim(),
    description: formData.get('description')?.trim() || null,
    trainer_name: formData.get('trainer_name')?.trim(),
    date: formData.get('date'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    capacity: Number(formData.get('capacity')) || 1,
    type: formData.get('type') || null,
    goal: formData.get('goal') || null,
    muscle_group: formData.get('muscle_group') || null,
    level: formData.get('level') || null,
    time_of_day: formData.get('time_of_day') || null,
  };
}

function resetForm() {
  adminState.editingId = null;
  formEl.reset();
  formEl.elements.capacity.value = 12;
  formTitleEl.textContent = 'Добавить занятие';
  submitBtn.textContent = 'Добавить занятие';
  resetFormBtn.hidden = true;
}

function setFormForEdit(classItem) {
  adminState.editingId = classItem.id;

  Object.entries(classItem).forEach(([key, value]) => {
    if (formEl.elements[key]) {
      formEl.elements[key].value = value ?? '';
    }
  });

  formTitleEl.textContent = 'Редактировать занятие';
  submitBtn.textContent = 'Сохранить изменения';
  resetFormBtn.hidden = false;
  formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getVisibleClasses() {
  if (!adminState.filteredDate) return adminState.classes;
  return adminState.classes.filter((classItem) => classItem.date === adminState.filteredDate);
}

function renderClasses() {
  const visibleClasses = getVisibleClasses();

  if (!visibleClasses.length) {
    listEl.innerHTML = '<p class="admin-list__empty">Занятий пока нет.</p>';
    return;
  }

  listEl.innerHTML = visibleClasses.map((classItem) => {
    const tags = [classItem.type, classItem.goal, classItem.muscle_group, classItem.level, classItem.time_of_day]
      .filter(Boolean)
      .map((tag) => `<span class="admin-class-card__tag">${tag}</span>`)
      .join('');

    return `
      <article class="admin-class-card" data-class-id="${classItem.id}">
        <div class="admin-class-card__content">
          <h3 class="admin-class-card__title">${classItem.title}</h3>
          <p class="admin-class-card__meta">
            <span>${formatDate(classItem.date)}</span>
            <span>${formatTime(classItem.start_time)}–${formatTime(classItem.end_time)}</span>
            <span>${classItem.trainer_name}</span>
            <span>${classItem.capacity} мест</span>
          </p>
          ${classItem.description ? `<p class="admin-class-card__description">${classItem.description}</p>` : ''}
          <div class="admin-class-card__tags">${tags || '<span class="admin-class-card__tag">Без фильтров</span>'}</div>
        </div>
        <div class="admin-class-card__actions">
          <button class="admin-class-card__button" type="button" data-edit-class="${classItem.id}">Изменить</button>
          <button class="admin-class-card__button admin-class-card__button--delete" type="button" data-delete-class="${classItem.id}">Удалить</button>
        </div>
      </article>
    `;
  }).join('');
}

async function loadClasses() {
  const { data, error } = await supabaseClient
    .from('classes')
    .select('*')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error(error);
    listEl.innerHTML = '<p class="admin-list__empty">Не удалось загрузить занятия. Проверь RLS-политики в Supabase.</p>';
    return;
  }

  adminState.classes = data || [];
  renderClasses();
}

async function saveClass(event) {
  event.preventDefault();

  const payload = getFormPayload();
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Сохранение...';

  try {
    const query = adminState.editingId
      ? supabaseClient.from('classes').update(payload).eq('id', adminState.editingId)
      : supabaseClient.from('classes').insert(payload);

    const { error } = await query;

    if (error) {
      console.error(error);
      showToast(error.message || 'Ошибка сохранения', true);
      return;
    }

    showToast(adminState.editingId ? 'Занятие обновлено' : 'Занятие добавлено');
    resetForm();
    await loadClasses();
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = adminState.editingId ? 'Сохранить изменения' : originalText;
  }
}

async function deleteClass(classId) {
  const classItem = adminState.classes.find((item) => item.id === classId);
  const ok = confirm(`Удалить занятие «${classItem?.title || 'занятие'}»?`);
  if (!ok) return;

  const { error } = await supabaseClient
    .from('classes')
    .delete()
    .eq('id', classId);

  if (error) {
    console.error(error);
    showToast(error.message || 'Не удалось удалить занятие', true);
    return;
  }

  showToast('Занятие удалено');
  if (adminState.editingId === classId) resetForm();
  await loadClasses();
}

function initListActions() {
  listEl.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-edit-class]');
    const deleteBtn = event.target.closest('[data-delete-class]');

    if (editBtn) {
      const classId = Number(editBtn.dataset.editClass);
      const classItem = adminState.classes.find((item) => item.id === classId);
      if (classItem) setFormForEdit(classItem);
    }

    if (deleteBtn) {
      const classId = Number(deleteBtn.dataset.deleteClass);
      deleteClass(classId);
    }
  });
}

function initFilters() {
  dateFilterEl.addEventListener('change', () => {
    adminState.filteredDate = dateFilterEl.value;
    renderClasses();
  });

  clearDateBtn.addEventListener('click', () => {
    adminState.filteredDate = '';
    dateFilterEl.value = '';
    renderClasses();
  });
}

async function getUser() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error('Ошибка получения сессии:', error);
    return null;
  }

  return data?.session?.user || null;
}

async function initAdminPage() {
  const user = await getUser();

  const userEmail = user?.email?.toLowerCase().trim();
  const isAdmin = userEmail && ADMIN_EMAILS
    .map((email) => email.toLowerCase().trim())
    .includes(userEmail);

  console.log('Текущий пользователь:', userEmail);
  console.log('Админ:', isAdmin);

  if (!isAdmin) {
    document.body.innerHTML = `
    <main class="not-found-page">
      <section class="not-found">
        <h1 class="not-found__title">404</h1>
        <p class="not-found__text">Похоже, вы зашли не туда</p>
        <a class="not-found__link" href="/">Вернуться на главную</a>
      </section>
    </main>
  `;
    return;
  }

  lockEl.hidden = true;
  contentEl.hidden = false;

  formEl.addEventListener('submit', saveClass);
  resetFormBtn.addEventListener('click', resetForm);
  initListActions();
  initFilters();
  await loadClasses();
}

document.addEventListener('DOMContentLoaded', initAdminPage);
