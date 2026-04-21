document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq__item');

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq__toggle');

    button.addEventListener('click', () => {
      const isActive = item.classList.contains('faq__item--active');

      faqItems.forEach((faqItem) => {
        faqItem.classList.remove('faq__item--active');
      });

      if (!isActive) {
        item.classList.add('faq__item--active');
      }
    });
  });
});