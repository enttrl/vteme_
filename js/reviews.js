document.addEventListener('DOMContentLoaded', async () => {
  const reviewsList = document.getElementById('reviewsList');
  const reviewsPagination = document.getElementById('reviewsPagination');
  const reviewsCount = document.getElementById('reviewsCount');
  const tabs = document.querySelectorAll('.reviews__tab');

  if (!reviewsList || !reviewsPagination || !reviewsCount || !tabs.length) return;

  let allReviews = [];
  let currentFilter = 'all';
  let currentPage = 0;
  const reviewsPerPage = 4;

  try {
    const response = await fetch('./data/reviews.json');

    if (!response.ok) {
      throw new Error(`Ошибка загрузки отзывов: ${response.status}`);
    }

    allReviews = await response.json();
    shuffleReviews();
    renderReviews();
  } catch (error) {
    console.error(error);
    reviewsList.innerHTML = '<p>Не удалось загрузить отзывы.</p>';
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.remove('reviews__tab--active'));
      tab.classList.add('reviews__tab--active');

      currentFilter = tab.dataset.filter;
      currentPage = 0;

      renderReviews();
    });
  });

  function shuffleReviews() {
    allReviews.sort(() => Math.random() - 0.5);
  }

  function getFilteredReviews() {
    if (currentFilter === 'all') {
      return allReviews;
    }

    return allReviews.filter((review) => review.source === currentFilter);
  }

  function updateCount(filteredReviews) {
    if (currentFilter === 'all') {
      reviewsCount.textContent = `304 отзыва в двух источниках`;
      return;
    }

    if (currentFilter === 'yandex') {
      reviewsCount.textContent = `178 отзывов в Яндекс`;
      return;
    }

    if (currentFilter === '2gis') {
      reviewsCount.textContent = `126 отзывов в 2ГИС`;
    }
  }

  function createStars(rating) {
    return '★'.repeat(rating);
  }

  function createReviewCard(review) {
    return `
      <article class="review-card">
        <div class="review-card__top">
          <img class="review-card__avatar" src="${review.avatar}" alt="${review.name}">
          <div class="review-card__meta">
            <div class="review-card__stars">${createStars(review.rating)}</div>
            <h3 class="review-card__name">${review.name}</h3>
            <p class="review-card__date">${review.date}</p>
          </div>
        </div>

        <p class="review-card__text">${review.text}</p>

        <a class="review-card__link" href="${review.link}" target="_blank" rel="noopener noreferrer">
          Ссылка на источник
        </a>
      </article>
    `;
  }

  function renderPagination(totalPages) {
    reviewsPagination.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'reviews__dot';

      if (i === currentPage) {
        dot.classList.add('reviews__dot--active');
      }

      dot.addEventListener('click', () => {
        currentPage = i;
        renderReviews();
      });

      reviewsPagination.appendChild(dot);
    }
  }

  function renderReviews() {
    const filteredReviews = getFilteredReviews();
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

    if (currentPage >= totalPages) {
      currentPage = 0;
    }

    const startIndex = currentPage * reviewsPerPage;
    const currentReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

    reviewsList.innerHTML = currentReviews.map(createReviewCard).join('');
    updateCount(filteredReviews);
    renderPagination(totalPages);
  }
});