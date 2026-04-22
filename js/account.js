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
  initLogout(supabaseClient);
  initSchedule(user);
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

  if (!scheduleWeek || !trainingList) return;

  const weekDays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

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

  renderWeek();
  renderTrainings(activeDateKey);

  function renderWeek() {
    scheduleWeek.innerHTML = '';

    dates.forEach((date) => {
      const dateKey = formatDateKey(date);
      const dayName = weekDays[date.getDay()];
      const dayNumber = String(date.getDate()).padStart(2, '0');
      const monthNumber = String(date.getMonth() + 1).padStart(2, '0');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `schedule-day ${dateKey === activeDateKey ? 'is-active' : ''}`;
      button.dataset.date = dateKey;
      button.innerHTML = `<span class="schedule-day__pill">${dayName} ${dayNumber}.${monthNumber}</span>`;

      button.addEventListener('click', () => {
        activeDateKey = dateKey;
        renderWeek();
        renderTrainings(activeDateKey);
      });

      scheduleWeek.appendChild(button);
    });
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