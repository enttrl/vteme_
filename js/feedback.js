document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('phoneInput');

  if (phoneInput) {
    phoneInput.addEventListener('input', handlePhoneMask);
    phoneInput.addEventListener('focus', handlePhoneMask);
    phoneInput.addEventListener('blur', handlePhoneBlur);
  }

  function handlePhoneMask(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (!value.startsWith('7')) {
      value = '7' + value.replace(/^8/, '');
    }

    value = value.substring(0, 11);

    let formatted = '+7';

    if (value.length > 1) {
      formatted += ' (' + value.substring(1, 4);
    }
    if (value.length >= 5) {
      formatted += ') ' + value.substring(4, 7);
    }
    if (value.length >= 8) {
      formatted += ' - ' + value.substring(7, 9);
    }
    if (value.length >= 10) {
      formatted += ' - ' + value.substring(9, 11);
    }

    e.target.value = formatted;
  }

  function handlePhoneBlur(e) {
    if (e.target.value === '+7') {
      e.target.value = '';
    }
  }
});


function showToast(message = "Заявка отправлена!") {
  const toast = document.createElement('div');

  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    background: '#0fa044',
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

  // появление
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // исчезновение через 2 секунды
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}



document.addEventListener('DOMContentLoaded', () => {
  emailjs.init('4EOkO_p3ey7Am8t1d');

  const form = document.getElementById('feedbackForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.feedback-form__submit');
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    const data = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value
    };

    try {
      await emailjs.send(
        'service_15j1wj6',
        'template_6gm6k24',
        data
      );

      showToast();
      form.reset();

    } catch (error) {
      console.error(error);
      alert('Ошибка отправки');
    }

    btn.disabled = false;
    btn.textContent = 'Перезвоните мне';
  });
});
