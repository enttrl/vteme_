document.addEventListener('DOMContentLoaded', () => {
  const SUPABASE_URL = 'https://tphqdjeordubhobwoouo.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHFkamVvcmR1YmhvYndvb3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzI2OTcsImV4cCI6MjA5MjM0ODY5N30.yAGVQnL4g5Eqex0PEJm3fGtoqyYaf3eA070FaelF2Hw';

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });

  const authModal = document.getElementById('authModal');
  const openAuthModal = document.getElementById('openAuthModal');
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

  function openModal() {
    authModal.classList.add('auth-modal--open');

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
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
        phone: phone
      });

    return { error: insertError };
  }

  async function handleLoginButtonClick() {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      window.location.href = 'pages/account.html';
      return;
    }

    openModal();
    showForm('login');
  }

  openAuthModal?.addEventListener('click', (e) => {
    e.preventDefault();
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
        img.src = 'assets/img/eye.svg'; // 👁 открытый глаз
      } else {
        input.type = 'password';
        img.src = 'assets/img/eye-off.svg'; // 🙈 закрытый глаз
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
    window.location.href = 'pages/account.html';
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
    window.location.href = 'pages/account.html';
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
    window.location.href = 'pages/account.html';
  });
});