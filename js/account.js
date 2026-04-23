const SUPABASE_URL = 'https://tphqdjeordubhobwoouo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHFkamVvcmR1YmhvYndvb3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzI2OTcsImV4cCI6MjA5MjM0ODY5N30.yAGVQnL4g5Eqex0PEJm3fGtoqyYaf3eA070FaelF2Hw';

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();

  const supabaseClient = createSupabaseClient();
  if (!supabaseClient) {
    console.error('Supabase не подключен');
    return;
  }

  const user = await getAuthorizedUser(supabaseClient);

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  await initAccountProfile(supabaseClient, user);
  await initSettingsForm(supabaseClient, user);

  initLogout(supabaseClient);
  initSchedule(user);
  initFormMasks();
});

function createSupabaseClient() {
  if (!window.supabase) return null;

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

async function getAuthorizedUser(supabaseClient) {
  try {
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError) {
      console.error('Ошибка получения session:', sessionError.message);
    }

    if (sessionData?.session?.user) {
      return sessionData.session.user;
    }

    return await new Promise((resolve) => {
      let isResolved = false;

      const {
        data: { subscription }
      } = supabaseClient.auth.onAuthStateChange((event, session) => {
        if (isResolved) return;

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          isResolved = true;
          subscription.unsubscribe();
          resolve(session?.user ?? null);
        }
      });

      setTimeout(() => {
        if (isResolved) return;
        isResolved = true;
        subscription.unsubscribe();
        resolve(null);
      }, 1500);
    });
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    return null;
  }
}

function initTabs() {
  const tabs = document.querySelectorAll('.account-tab');
  const panels = document.querySelectorAll('.account-panel');

  if (!tabs.length || !panels.length) return;

  function switchTab(targetTab) {
    tabs.forEach((tab) => {
      const isCurrent = tab.dataset.tab === targetTab;
      tab.classList.toggle('is-active', isCurrent);
      tab.setAttribute('aria-selected', String(isCurrent));
    });

    panels.forEach((panel) => {
      const isCurrent = panel.dataset.panel === targetTab;
      panel.hidden = !isCurrent;
      panel.classList.toggle('is-active', isCurrent);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  const activeTab = document.querySelector('.account-tab.is-active')?.dataset.tab || 'overview';
  switchTab(activeTab);
}

async function initAccountProfile(supabaseClient, user) {
  const greetingNameEl = document.getElementById('accountUserName');
  const cardNameEl = document.getElementById('accountCardUserName');

  try {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Ошибка загрузки профиля:', error.message);
    }

    const fullName = profile?.full_name?.trim() || user.user_metadata?.full_name || user.email || 'Пользователь';
    const firstName = fullName.split(' ')[0] || fullName;

    if (greetingNameEl) {
      greetingNameEl.textContent = firstName;
    }

    if (cardNameEl) {
      cardNameEl.textContent = firstName;
    }
  } catch (error) {
    console.error('Ошибка инициализации профиля:', error);
  }
}

function initLogout(supabaseClient) {
  const logoutButton = document.getElementById('logoutButton');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        console.error('Ошибка выхода:', error.message);
        return;
      }

      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка logout:', error);
    }
  });
}

function initSchedule(user) {
  const scheduleWeek = document.getElementById('scheduleWeek');
  const trainingList = document.getElementById('trainingList');

  const mobileCurrent = document.getElementById('scheduleMobileCurrent');
  const mobilePickerButton = document.getElementById('scheduleMobilePickerButton');
  const scheduleNativeInput = document.getElementById('scheduleNativeInput');

  if (!scheduleWeek || !trainingList) return;

  const weekDaysShort = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
  const weekDaysFull = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

  const trainingsByDate = {
    [formatDateKey(new Date())]: [
      {
        title: 'Functional Training',
        slots: '8/12',
        time: '18:00–19:00',
        trainer: 'Анна Ковалёва'
      }
    ]
  };

  const dates = [];
  const today = new Date();

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  let activeDateKey = formatDateKey(dates[0]);

  const minDate = formatDateKey(dates[0]);
  const maxDate = formatDateKey(dates[dates.length - 1]);

  if (scheduleNativeInput) {
    scheduleNativeInput.min = minDate;
    scheduleNativeInput.max = maxDate;
    scheduleNativeInput.value = activeDateKey;
  }

  renderAll();

  if (mobilePickerButton && scheduleNativeInput) {
    mobilePickerButton.addEventListener('click', () => {
      if (typeof scheduleNativeInput.showPicker === 'function') {
        scheduleNativeInput.showPicker();
      } else {
        scheduleNativeInput.focus();
        scheduleNativeInput.click();
      }
    });

    scheduleNativeInput.addEventListener('change', () => {
      if (!scheduleNativeInput.value) return;

      activeDateKey = scheduleNativeInput.value;
      renderAll();
    });
  }

  function renderAll() {
    renderDesktopWeek();
    renderMobileCurrent();
    renderTrainings(activeDateKey);
  }

  function renderDesktopWeek() {
    scheduleWeek.innerHTML = '';

    dates.forEach((date) => {
      const dateKey = formatDateKey(date);
      const dayName = weekDaysShort[date.getDay()];
      const dayNumber = String(date.getDate()).padStart(2, '0');
      const monthNumber = String(date.getMonth() + 1).padStart(2, '0');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `schedule-day ${dateKey === activeDateKey ? 'is-active' : ''}`;
      button.dataset.date = dateKey;
      button.innerHTML = `<span class="schedule-day__pill">${dayName} ${dayNumber}.${monthNumber}</span>`;

      button.addEventListener('click', () => {
        activeDateKey = dateKey;

        if (scheduleNativeInput) {
          scheduleNativeInput.value = activeDateKey;
        }

        renderAll();
      });

      scheduleWeek.appendChild(button);
    });
  }

  function renderMobileCurrent() {
    if (!mobileCurrent) return;

    const activeDate = dates.find((date) => formatDateKey(date) === activeDateKey) || dates[0];
    mobileCurrent.textContent = formatFullDate(activeDate);

    if (scheduleNativeInput) {
      scheduleNativeInput.value = activeDateKey;
    }
  }

  function renderTrainings(dateKey) {
    const trainings = trainingsByDate[dateKey] || [];

    if (!trainings.length) {
      trainingList.innerHTML = `
        <p class="training-empty">
          Вы еще не запланировали ни одной тренировки на этот день
        </p>
      `;
      return;
    }

    trainingList.innerHTML = trainings
      .map((training) => {
        return `
          <article class="training-card">
            <div class="training-card__top">
              <h3 class="training-card__title">${escapeHtml(training.title)}</h3>
              <span class="training-card__slots">${escapeHtml(training.slots)}</span>
            </div>
            <p class="training-card__meta">${escapeHtml(training.time)}</p>
            <p class="training-card__meta">Тренер: ${escapeHtml(training.trainer)}</p>
          </article>
        `;
      })
      .join('');
  }

  function formatFullDate(date) {
    const dayName = weekDaysFull[date.getDay()];
    const dayNumber = String(date.getDate()).padStart(2, '0');
    const monthNumber = String(date.getMonth() + 1).padStart(2, '0');

    return `${dayName} ${dayNumber}.${monthNumber}`;
  }
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();

  const supabaseClient = createSupabaseClient();
  if (!supabaseClient) {
    console.error('Supabase не подключен');
    return;
  }

  const user = await getAuthorizedUser(supabaseClient);

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  await initAccountProfile(supabaseClient, user);
  initLogout(supabaseClient);
  initSchedule(user);
  initFormMasks();
});

function initFormMasks() {
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const birthDateInput = document.getElementById('birthDate');

  if (firstNameInput) {
    firstNameInput.addEventListener('input', () => {
      firstNameInput.value = sanitizeName(firstNameInput.value);
    });
  }

  if (lastNameInput) {
    lastNameInput.addEventListener('input', () => {
      lastNameInput.value = sanitizeName(lastNameInput.value);
    });
  }

  if (birthDateInput) {
    birthDateInput.addEventListener('input', () => {
      birthDateInput.value = formatDateMask(birthDateInput.value);
    });

    birthDateInput.addEventListener('blur', () => {
      birthDateInput.value = normalizeDateValue(birthDateInput.value);
    });
  }
}

function sanitizeName(value) {
  return value
    .replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/-{2,}/g, '-')
    .replace(/^\s+/, '');
}

function formatDateMask(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  let result = '';

  if (digits.length > 0) {
    result += digits.slice(0, 2);
  }

  if (digits.length >= 3) {
    result += '.' + digits.slice(2, 4);
  }

  if (digits.length >= 5) {
    result += '.' + digits.slice(4, 8);
  }

  return result;
}

function normalizeDateValue(value) {
  const digits = value.replace(/\D/g, '');

  if (digits.length !== 8) {
    return value;
  }

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  if (month < 1 || month > 12) return '';
  if (year < 1900 || year > new Date().getFullYear()) return '';

  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) return '';

  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

async function initSettingsForm(supabaseClient, user) {
  const form = document.getElementById('settingsForm');
  if (!form) return;

  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');
  const birthDateInput = document.getElementById('birthDate');

  try {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('full_name, last_name, birth_date, gender')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Ошибка загрузки настроек:', error.message);
      return;
    }

    if (firstNameInput) {
      firstNameInput.value = profile?.full_name ?? '';
    }

    if (lastNameInput) {
      lastNameInput.value = profile?.last_name ?? '';
    }

    if (emailInput) {
      emailInput.value = user.email ?? '';
    }

    if (birthDateInput && profile?.birth_date) {
      birthDateInput.value = formatDateForInput(profile.birth_date);
    }

    if (profile?.gender) {
      const genderRadio = form.querySelector(
        `input[name="gender"][value="${profile.gender}"]`
      );

      if (genderRadio) {
        genderRadio.checked = true;
      }
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await saveSettingsForm(supabaseClient, user.id);
    });
  } catch (error) {
    console.error('Ошибка initSettingsForm:', error);
  }
}

async function saveSettingsForm(supabaseClient, userId) {
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const birthDateInput = document.getElementById('birthDate');
  const emailInput = document.getElementById('email');
  const genderInput = document.querySelector('input[name="gender"]:checked');

  const fullName = firstNameInput?.value.trim() || null;
  const lastName = lastNameInput?.value.trim() || null;
  const birthDate = birthDateInput?.value.trim() || null;
  const email = emailInput?.value.trim() || '';
  const gender = genderInput?.value || null;

  const normalizedBirthDate = birthDate ? formatDateForDatabase(birthDate) : null;

  if (birthDate && !normalizedBirthDate) {
    alert('Проверь дату рождения. Используй формат дд.мм.гггг');
    return;
  }

  try {
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        full_name: fullName,
        last_name: lastName,
        birth_date: normalizedBirthDate,
        gender: gender
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Ошибка сохранения профиля:', profileError.message);
      alert('Не удалось сохранить данные профиля');
      return;
    }

    const { data: authData } = await supabaseClient.auth.getUser();
    const currentEmail = authData?.user?.email || '';

    if (email && email !== currentEmail) {
      const { error: emailError } = await supabaseClient.auth.updateUser({
        email: email
      });

      if (emailError) {
        console.error('Ошибка обновления email:', emailError.message);
        alert('Профиль сохранён, но email обновить не удалось');
      }
    }

    const greetingNameEl = document.getElementById('accountUserName');
    const cardNameEl = document.getElementById('accountCardUserName');
    const firstName = fullName?.split(' ')[0] || 'Пользователь';

    if (greetingNameEl) {
      greetingNameEl.textContent = firstName;
    }

    if (cardNameEl) {
      cardNameEl.textContent = firstName;
    }

    alert('Данные успешно сохранены');
  } catch (error) {
    console.error('Ошибка saveSettingsForm:', error);
    alert('Произошла ошибка при сохранении');
  }
}

function formatDateForDatabase(value) {
  const parts = value.split('.');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;

  if (!day || !month || !year) return null;
  if (year.length !== 4) return null;

  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (!Number.isInteger(dayNumber) || !Number.isInteger(monthNumber) || !Number.isInteger(yearNumber)) {
    return null;
  }

  if (monthNumber < 1 || monthNumber > 12) return null;
  if (yearNumber < 1900 || yearNumber > new Date().getFullYear()) return null;

  const maxDay = new Date(yearNumber, monthNumber, 0).getDate();
  if (dayNumber < 1 || dayNumber > maxDay) return null;

  return `${String(yearNumber)}-${String(monthNumber).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
}

function formatDateForInput(value) {
  const parts = value.split('-');
  if (parts.length !== 3) return '';

  const [year, month, day] = parts;

  if (!year || !month || !day) return '';
  return `${day}.${month}.${year}`;
}