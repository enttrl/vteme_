(function () {
  function getActiveCategory() {
    return document.querySelector('[data-category].is-active')?.dataset.category || 'month-1';
  }

  document.addEventListener('click', function (event) {
    const link = event.target.closest('.membership-card__button');
    if (!link) return;

    const card = link.closest('.membership-card');
    const cards = Array.from(document.querySelectorAll('#membershipCards .membership-card'));
    const index = cards.indexOf(card);

    if (index < 0) return;

    event.preventDefault();
    const category = getActiveCategory();
    window.location.href = `membership-detail.html?category=${encodeURIComponent(category)}&index=${index}`;
  });
})();
