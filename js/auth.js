document.addEventListener('DOMContentLoaded', () => {
  const SUPABASE_URL = 'https://tphqdjeordubhobwoouo.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHFkamVvcmR1YmhvYndvb3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzI2OTcsImV4cCI6MjA5MjM0ODY5N30.yAGVQnL4g5Eqex0PEJm3fGtoqyYaf3eA070FaelF2Hw';

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
  const isInsidePages = window.location.pathname.includes('/pages/');
  const assetsPath = isInsidePages ? '../assets/img' : 'assets/img';

  function createAuthModal() {
    if (document.getElementById('authModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
    <div class="auth-modal" id="authModal" aria-hidden="true">
      <div class="auth-modal__overlay" id="authModalOverlay"></div>

      <div class="auth-modal__dialog">
        <button class="auth-modal__close" id="closeAuthModal" type="button" aria-label="Закрыть">
          <img src="${assetsPath}/close_modal.svg" alt="">
        </button>

        <form class="auth-form auth-form--active" id="loginForm">
          <h2 class="auth-form__title">Вход</h2>

          <label class="auth-form__group">
            <span class="auth-form__label">Email</span>
            <input class="auth-form__input" type="email" name="email" placeholder="example@mail.ru" required>
            <span class="auth-form__error" data-error-for="login-email"></span>
          </label>

          <label class="auth-form__group">
            <span class="auth-form__label">Пароль</span>
            <span class="auth-form__input-wrap">
              <input class="auth-form__input" type="password" name="password" id="loginPasswordInput" placeholder="******" required minlength="6">
              <button class="auth-form__password-toggle" type="button" data-password-toggle="loginPasswordInput">
                <img src="${assetsPath}/eye-off.svg" alt="">
              </button>
            </span>
            <span class="auth-form__error" data-error-for="login-password"></span>
          </label>

          <button class="auth-form__link" type="button" id="openRecoveryRequest"> Не помните пароль? Восстановить </button>
          

          <button class="auth-form__submit" type="submit">Войти</button>

          <button class="auth-form__switch" type="button" data-switch-tab="register">
            Не зарегистрированы? Регистрация
          </button>
        </form>

        <form class="auth-form" id="registerForm">
          <h2 class="auth-form__title">Регистрация</h2>

          <label class="auth-form__group">
            <span class="auth-form__label">Имя</span>
            <input class="auth-form__input" type="text" name="name" placeholder="Ваше имя" required>
          </label>

          <label class="auth-form__group">
            <span class="auth-form__label">Email</span>
            <input class="auth-form__input" type="email" name="email" placeholder="example@mail.ru" required>
            <span class="auth-form__error" data-error-for="register-email"></span>
          </label>

          <label class="auth-form__group">
            <span class="auth-form__label">Телефон</span>
            <input class="auth-form__input" type="tel" name="phone" id="registerPhoneInput" placeholder="+7 (999) 999 - 99 - 99" required>
          </label>

          <label class="auth-form__group">
            <span class="auth-form__label">Пароль</span>
            <span class="auth-form__input-wrap">
              <input class="auth-form__input" type="password" name="password" id="registerPasswordInput" placeholder="******" required minlength="6">
              <button class="auth-form__password-toggle" type="button" data-password-toggle="registerPasswordInput">
                <img src="${assetsPath}/eye-off.svg" alt="">
              </button>
            </span>
            <span class="auth-form__error" data-error-for="register-password"></span>
          </label>

          <button class="auth-form__submit" type="submit">Зарегистрироваться</button>

          <button class="auth-form__switch" type="button" data-switch-tab="login">
            Уже есть аккаунт? Войти
          </button>
        </form>
        <form class="auth-form" id="recoveryRequestForm">
  <h2 class="auth-form__title">Восстановить пароль</h2>

  <label class="auth-form__group">
    <span class="auth-form__label">Email</span>
    <input class="auth-form__input" type="email" name="email" placeholder="example@mail.ru" required>
    <span class="auth-form__error" data-error-for="recovery-email"></span>
  </label>

  <p class="auth-form__hint">
    Мы отправим письмо со ссылкой для смены пароля
  </p>

  <button class="auth-form__submit" type="submit">Отправить письмо</button>

  <button class="auth-form__switch" type="button" data-switch-tab="login">
    Назад ко входу
  </button>
</form>

<form class="auth-form" id="recoveryUpdateForm">
  <h2 class="auth-form__title">Восстановить пароль</h2>

  <label class="auth-form__group">
    <span class="auth-form__label">Новый пароль</span>

    <span class="auth-form__input-wrap">
      <input class="auth-form__input" type="password" name="password" id="recoveryPasswordInput"
        placeholder="******" required minlength="6">

      <button class="auth-form__password-toggle" type="button" data-password-toggle="recoveryPasswordInput">
        <img src="${assetsPath}/eye-off.svg" alt="">
      </button>
    </span>

    <span class="auth-form__error" data-error-for="recovery-password"></span>
  </label>

  <button class="auth-form__submit" type="submit">Сохранить пароль</button>
</form>
      </div>
    </div>
  `);
  }

  createAuthModal();
  const authModal = document.getElementById('authModal');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const authModalOverlay = document.getElementById('authModalOverlay');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const recoveryRequestForm = document.getElementById('recoveryRequestForm');
  const recoveryUpdateForm = document.getElementById('recoveryUpdateForm');

  const registerPhoneInput = document.getElementById('registerPhoneInput');
  const passwordToggleButtons = document.querySelectorAll('[data-password-toggle]');
  const switchButtons = document.querySelectorAll('[data-switch-tab]');
  const openRecoveryRequest = document.getElementById('openRecoveryRequest');

  const formsMap = {
    register: registerForm,
    login: loginForm,
    recoveryRequest: recoveryRequestForm,
    recoveryUpdate: recoveryUpdateForm
  };

  function showToast(message, isError = false) {
    const toast = document.createElement('div');

    toast.textContent = message;

    Object.assign(toast.style, {
      position: 'fixed',
      right: '24px',
      bottom: '24px',
      background: isError ? '#dc2626' : '#22c55e',
      color: '#fff',
      padding: '14px 18px',
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      zIndex: '9999',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'all 0.3s ease'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }
  function getAccountPath() {
    const isInsidePages = window.location.pathname.includes('/pages/');
    return isInsidePages ? 'account.html' : 'pages/account.html';
  }
  function openModal() {
    authModal.classList.add('auth-modal--open');

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
  }


  function closeModal() {
    authModal.classList.remove('auth-modal--open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    clearAllErrors();
    registerForm?.reset();
    loginForm?.reset();
    recoveryRequestForm?.reset();
    recoveryUpdateForm?.reset();
  }

  function showForm(formName) {
    Object.values(formsMap).forEach((form) => {
      if (form) form.classList.remove('auth-form--active');
    });

    if (formsMap[formName]) {
      formsMap[formName].classList.add('auth-form--active');
    }

    clearAllErrors();
  }

  window.openAuthModalGlobal = function () {
    openModal();
    showForm('login');
  };

  function clearAllErrors() {
    document.querySelectorAll('.auth-form__error').forEach((el) => {
      el.textContent = '';
      el.classList.remove('auth-form__error--visible');
    });

    document.querySelectorAll('.auth-form__input').forEach((input) => {
      input.classList.remove('auth-form__input--error');
    });
  }

  function setFieldError(input, errorKey, message) {
    if (input) {
      input.classList.add('auth-form__input--error');
    }

    const errorEl = document.querySelector(`[data-error-for="${errorKey}"]`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('auth-form__error--visible');
    }
  }

  async function ensureUserProfile(user, fullName = '', phone = '') {
    const { data: existingProfile, error: selectError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (selectError) return { error: selectError };
    if (existingProfile) return { error: null };

    const { error: insertError } = await supabaseClient
      .from('profiles')
      .insert({
        id: user.id,
        full_name: fullName,
        phone: phone,
        last_name: null,
        birth_date: null,
        gender: null
      });

    return { error: insertError };
  }

  async function handleLoginButtonClick() {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      window.location.href = getAccountPath();
      return;
    }

    openModal();
    showForm('login');
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-auth-open]');
    if (!button) return;

    event.preventDefault();

    if (window.location.pathname.includes('schedule.html')) {
      localStorage.setItem('redirectAfterLogin', window.location.href);
    }

    handleLoginButtonClick();
  });

  closeAuthModal?.addEventListener('click', closeModal);
  authModalOverlay?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  switchButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.switchTab;

      if (target === 'register') showForm('register');
      if (target === 'login') showForm('login');
    });
  });

  openRecoveryRequest?.addEventListener('click', () => {
    showForm('recoveryRequest');
  });

  passwordToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const inputId = button.dataset.passwordToggle;
      const input = document.getElementById(inputId);
      const img = button.querySelector('img');

      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        img.src = `${assetsPath}/eye.svg`; // 👁 открытый
      } else {
        input.type = 'password';
        img.src = `${assetsPath}/eye-off.svg`; // 🙈 закрытый
      }
    });
  });

  if (registerPhoneInput) {
    registerPhoneInput.addEventListener('input', handlePhoneMask);
    registerPhoneInput.addEventListener('focus', handlePhoneMask);
    registerPhoneInput.addEventListener('blur', handlePhoneBlur);
  }

  function handlePhoneMask(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (!value.startsWith('7')) {
      value = '7' + value.replace(/^8/, '');
    }

    value = value.substring(0, 11);

    let formatted = '+7';
    if (value.length > 1) formatted += ' (' + value.substring(1, 4);
    if (value.length >= 5) formatted += ') ' + value.substring(4, 7);
    if (value.length >= 8) formatted += ' - ' + value.substring(7, 9);
    if (value.length >= 10) formatted += ' - ' + value.substring(9, 11);

    e.target.value = formatted;
  }

  function handlePhoneBlur(e) {
    if (e.target.value === '+7') {
      e.target.value = '';
    }
  }

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      openModal();
      showForm('recoveryUpdate');
    }
  });

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAllErrors();

    const submitButton = registerForm.querySelector('.auth-form__submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Регистрация...';

    const fullName = registerForm.elements.name.value.trim();
    const email = registerForm.elements.email.value.trim();
    const phone = registerForm.elements.phone.value.trim();
    const password = registerForm.elements.password.value;
    const emailInput = registerForm.elements.email;
    const passwordInput = registerForm.elements.password;

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      if (error.message.toLowerCase().includes('user already registered')) {
        setFieldError(emailInput, 'register-email', 'Данная почта уже зарегистрирована');
      } else {
        setFieldError(passwordInput, 'register-password', error.message);
      }

      submitButton.disabled = false;
      submitButton.textContent = 'Зарегистрироваться';
      return;
    }

    if (!data.session || !data.user) {
      showToast('После регистрации нет активной сессии. Проверь настройки Confirm Email.', true);
      submitButton.disabled = false;
      submitButton.textContent = 'Зарегистрироваться';
      return;
    }

    const { error: profileError } = await ensureUserProfile(data.user, fullName, phone);

    if (profileError) {
      showToast(profileError.message, true);
      submitButton.disabled = false;
      submitButton.textContent = 'Зарегистрироваться';
      return;
    }

    registerForm.reset();
    closeModal();
    showToast('Регистрация успешна');
    const pendingMembershipUrl = localStorage.getItem('pendingMembershipUrl');

    if (pendingMembershipUrl) {
      localStorage.removeItem('pendingMembershipUrl');
      window.location.href = pendingMembershipUrl;
      return;
    }
    window.location.href = getAccountPath();
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAllErrors();

    const submitButton = loginForm.querySelector('.auth-form__submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Вход...';

    const email = loginForm.elements.email.value.trim();
    const password = loginForm.elements.password.value;
    const passwordInput = loginForm.elements.password;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setFieldError(passwordInput, 'login-password', 'Неправильный email или пароль');
      submitButton.disabled = false;
      submitButton.textContent = 'Войти';
      return;
    }

    await ensureUserProfile(data.user);
    loginForm.reset();
    closeModal();
    showToast('Вход выполнен');
    const pendingMembershipUrl = localStorage.getItem('pendingMembershipUrl');

    if (pendingMembershipUrl) {
      localStorage.removeItem('pendingMembershipUrl');
      window.location.href = pendingMembershipUrl;
      return;
    }
    const redirectUrl = localStorage.getItem('redirectAfterLogin');

    if (
      redirectUrl &&
      window.location.pathname.includes('schedule.html')
    ) {
      localStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectUrl;
    } else {
      window.location.href = getAccountPath();
    }
  });

  recoveryRequestForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAllErrors();

    const submitButton = recoveryRequestForm.querySelector('.auth-form__submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    const email = recoveryRequestForm.elements.email.value.trim();
    const emailInput = recoveryRequestForm.elements.email;

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/index.html`
    });

    if (error) {
      setFieldError(emailInput, 'recovery-email', error.message);
      submitButton.disabled = false;
      submitButton.textContent = 'Отправить письмо';
      return;
    }

    showToast('Письмо для смены пароля отправлено');
    recoveryRequestForm.reset();
    submitButton.disabled = false;
    submitButton.textContent = 'Отправить письмо';
  });

  recoveryUpdateForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAllErrors();

    const submitButton = recoveryUpdateForm.querySelector('.auth-form__submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Сохранение...';

    const password = recoveryUpdateForm.elements.password.value;
    const passwordInput = recoveryUpdateForm.elements.password;

    const { error } = await supabaseClient.auth.updateUser({
      password
    });

    if (error) {
      setFieldError(passwordInput, 'recovery-password', error.message);
      submitButton.disabled = false;
      submitButton.textContent = 'Сохранить пароль';
      return;
    }

    recoveryUpdateForm.reset();
    closeModal();
    showToast('Пароль успешно изменён');
    window.location.href = getAccountPath();
  });
});