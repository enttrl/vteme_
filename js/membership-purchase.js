
(function () {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || 'month-1';
  const index = Number(params.get('index') || 0);

  function stripHtml(value) {
    const html = String(value || '')
      .replace(/<br\s*\/?>/gi, ' ');

    const div = document.createElement('div');
    div.innerHTML = html;

    return div.textContent
      .replace(/\s+/g, ' ')
      .replace('Тариф«', 'Тариф «')
      .trim();
  }

  function getMembership() {
    const data = window.MEMBERSHIPS_DATA || {};
    const list = data[category] || data['month-1'] || [];
    return list[index] || list[0] || null;
  }

  function getPriceNumber(priceText) {
    const match = String(priceText || '').replace(/\s/g, '').match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function formatPrice(priceText) {
    const price = getPriceNumber(priceText);
    return price ? `${price.toLocaleString('ru-RU')} ₽` : String(priceText || '0 ₽');
  }

  function getDurationText() {
    const map = {
      'month-1': '1 месяц',
      'month-3': '3 месяца',
      'month-6': '6 месяцев',
      'month-12': '12 месяцев',
      gift: 'подарочный сертификат'
    };
    return map[category] || 'абонемент';
  }

  function getProductTitle(membership) {
    return `${stripHtml(membership.title)} ${getDurationText()}`
      .replace('Тариф«', 'Тариф «');
  }

  function saveSelected(membership) {
    localStorage.setItem('selectedMembership', JSON.stringify({
      category,
      index,
      title: getProductTitle(membership),
      rawTitle: stripHtml(membership.title),
      duration: getDurationText(),
      priceText: membership.price,
      price: getPriceNumber(membership.price),
      description: (membership.benefits || []).map((item) => item.text).join('; '),
      date: membership.date || ''
    }));
  }

  function getSelectedFromStorage() {
    try {
      return JSON.parse(localStorage.getItem('selectedMembership') || 'null');
    } catch (error) {
      return null;
    }
  }

  function renderDetailPage() {
    const page = document.querySelector('[data-membership-detail-page]');
    if (!page) return;

    const membership = getMembership();
    if (!membership) {
      page.innerHTML = '<p class="membership-purchase__empty">Абонемент не найден.</p>';
      return;
    }

    saveSelected(membership);

    const title = getProductTitle(membership);
    const benefits = (membership.benefits || [])
      .map((item) => `<li>${item.text}</li>`)
      .join('');

    document.querySelector('[data-detail-title]').textContent = title;
    document.querySelector('[data-detail-description]').innerHTML = benefits;
    document.querySelector('[data-detail-price]').textContent = formatPrice(membership.price);
    document.querySelector('[data-detail-date]').textContent = membership.date || '';

    const checkoutLink = document.querySelector('[data-checkout-link]');
    if (checkoutLink) {
      checkoutLink.href = `membership-checkout.html?category=${encodeURIComponent(category)}&index=${index}`;
    }
  }

  function renderCheckoutPage() {
    const page = document.querySelector('[data-membership-checkout-page]');
    if (!page) return;

    let membership = getMembership();
    let selected = membership ? null : getSelectedFromStorage();

    if (membership) {
      saveSelected(membership);
      selected = getSelectedFromStorage();
    }

    if (!selected) {
      page.innerHTML = '<p class="membership-purchase__empty">Абонемент не выбран. Вернитесь на страницу абонементов.</p>';
      return;
    }

    const title = selected.title;
    const price = selected.price ? `${selected.price.toLocaleString('ru-RU')} ₽` : selected.priceText;

    document.querySelectorAll('[data-order-title]').forEach((el) => { el.textContent = title; });
    document.querySelectorAll('[data-order-price]').forEach((el) => { el.textContent = price; });

    const form = document.querySelector('[data-checkout-form]');
    if (!form) return;
    const certificateToggle = document.querySelector('[data-certificate-toggle]');
    const certificateField = document.querySelector('[data-certificate-field]');
    const certificateInput = document.querySelector('[data-certificate-input]');

    certificateToggle?.addEventListener('click', () => {
      certificateField.hidden = !certificateField.hidden;

      if (!certificateField.hidden) {
        certificateInput?.focus();
      }
    });

    certificateInput?.addEventListener('input', () => {
      let value = certificateInput.value
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 16);

      value = value.match(/.{1,4}/g)?.join('-') || '';

      certificateInput.value = value;
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const formData = new FormData(form);
      const order = {
        membership: selected,
        user: {
          firstName: formData.get('firstName')?.trim(),
          lastName: formData.get('lastName')?.trim(),
          patronymic: formData.get('patronymic')?.trim(),
          phone: formData.get('phone')?.trim(),
          email: formData.get('email')?.trim(),
          certificate: formData.get('certificate')?.trim()
        },
        createdAt: new Date().toISOString(),
        status: 'Успешно'
      };
      const { data: { user } } = await supabaseClient.auth.getUser();

      if (!user) {
        alert('Войдите в аккаунт, чтобы оформить заказ');
        return;
      }

      const { error } = await supabaseClient
        .from('membership_orders')
        .insert({
          user_id: user.id,
          membership_title: selected.rawTitle || selected.title,
          membership_duration: selected.duration,
          membership_price: selected.price,
          first_name: order.user.firstName,
          last_name: order.user.lastName,
          patronymic: order.user.patronymic,
          phone: order.user.phone,
          email: order.user.email,
          certificate: order.user.certificate,
          status: 'Успешно'
        });

      if (error) {
        console.error(error);
        alert('Не удалось сохранить покупку');
        return;
      }
      localStorage.setItem('lastMembershipOrder', JSON.stringify(order));
      window.location.href = 'membership-success.html';
    });
  }

  function renderSuccessPage() {
    const page = document.querySelector('[data-membership-success-page]');
    if (!page) return;

    const selected = getSelectedFromStorage();
    const titleEl = document.querySelector('[data-success-title]');
    if (selected && titleEl) titleEl.textContent = selected.title;
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderDetailPage();
    renderCheckoutPage();
    renderSuccessPage();
  });
})();
