document.addEventListener('DOMContentLoaded', () => {
  const SUPABASE_URL = 'https://tphqdjeordubhobwoouo.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHFkamVvcmR1YmhvYndvb3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzI2OTcsImV4cCI6MjA5MjM0ODY5N30.yAGVQnL4g5Eqex0PEJm3fGtoqyYaf3eA070FaelF2Hw';

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const authModal = document.getElementById('authModal');
  const openAuthModal = document.getElementById('openAuthModal');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const authModalOverlay = document.getElementById('authModalOverlay');

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  const tabButtons = document.querySelectorAll('[data-auth-tab]');
  const switchButtons = document.querySelectorAll('[data-switch-tab]');
  const passwordToggleButtons = document.querySelectorAll('[data-password-toggle]');
  const registerPhoneInput = document.getElementById('registerPhoneInput');

  function openModal() {
    authModal.classList.add('auth-modal--open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    authModal.classList.remove('auth-modal--open');
    document.body.style.overflow = '';
  }

  function showTab(tabName) {
    if (tabName === 'register') {
      registerForm.classList.add('auth-form--active');
      loginForm.classList.remove('auth-form--active');
    } else {
      loginForm.classList.add('auth-form--active');
      registerForm.classList.remove('auth-form--active');
    }
  }

  openAuthModal?.addEventListener('click', openModal);
  closeAuthModal?.addEventListener('click', closeModal);
  authModalOverlay?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      showTab(button.dataset.authTab);
    });
  });

  switchButtons.forEach((button) => {
    button.addEventListener('click', () => {
      showTab(button.dataset.switchTab);
    });
  });

  passwordToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const inputId = button.dataset.passwordToggle;
      const input = document.getElementById(inputId);

      if (!input) return;

      input.type = input.type === 'password' ? 'text' : 'password';
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

      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2000);
  }

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = registerForm.querySelector('.auth-form__submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Регистрация...';

    const fullName = registerForm.elements.name.value.trim();
    const email = registerForm.elements.email.value.trim();
    const phone = registerForm.elements.phone.value.trim();
    const password = registerForm.elements.password.value;

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      showToast(error.message, true);
      submitButton.disabled = false;
      submitButton.textContent = 'Зарегистрироваться';
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          phone: phone
        });

      if (profileError) {
        showToast(profileError.message, true);
        submitButton.disabled = false;
        submitButton.textContent = 'Зарегистрироваться';
        return;
      }
    }

    showToast('Регистрация успешна');
    window.location.href = 'account.html';
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = loginForm.querySelector('.auth-form__submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Вход...';

    const email = loginForm.elements.email.value.trim();
    const password = loginForm.elements.password.value;

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showToast(error.message, true);
      submitButton.disabled = false;
      submitButton.textContent = 'Войти';
      return;
    }

    showToast('Вход выполнен');
    window.location.href = 'account.html';
  });
});