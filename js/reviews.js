document.addEventListener('DOMContentLoaded', async () => {
  const reviewsList = document.getElementById('reviewsList');
  const reviewsPagination = document.getElementById('reviewsPagination');
  const reviewsCount = document.getElementById('reviewsCount');
  const tabs = document.querySelectorAll('.reviews__tab');

  if (!reviewsList || !reviewsPagination || !reviewsCount || !tabs.length) return;

  let allReviews = [];
  let currentFilter = 'all';
  let currentPage = 0;
  let autoSlide = null;

  let touchStartX = 0;
  let touchEndX = 0;

  try {
    const response = await fetch('./data/reviews.json');

    if (!response.ok) {
      throw new Error(`Ошибка загрузки отзывов: ${response.status}`);
    }

    allReviews = await response.json();
    shuffleReviews();
    renderReviews();
    startAutoSlide();
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
      restartAutoSlide();
    });
  });

  window.addEventListener('resize', () => {
    currentPage = 0;
    renderReviews();
    restartAutoSlide();
  });

  function getReviewsPerPage() {
    const width = window.innerWidth;

    if (width <= 767) {
      return 1;
    }

    if (width <= 1024) {
      return 2;
    }

    return 4;
  }

  function shuffleReviews() {
    allReviews.sort(() => Math.random() - 0.5);
  }

  function getFilteredReviews() {
    if (currentFilter === 'all') {
      return allReviews;
    }

    return allReviews.filter((review) => review.source === currentFilter);
  }

  function updateCount() {
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

  function renderPagination() {
    reviewsPagination.innerHTML = '';
  }

  function getTotalPages() {
    const filteredReviews = getFilteredReviews();
    const reviewsPerPage = getReviewsPerPage();
    return Math.ceil(filteredReviews.length / reviewsPerPage);
  }

  function goToNextPage() {
    const totalPages = getTotalPages();
    if (totalPages <= 1) return;

    currentPage = (currentPage + 1) % totalPages;
    renderReviews();
  }

  function goToPrevPage() {
    const totalPages = getTotalPages();
    if (totalPages <= 1) return;

    currentPage = (currentPage - 1 + totalPages) % totalPages;
    renderReviews();
  }

  function renderReviews() {
    const filteredReviews = getFilteredReviews();
    const reviewsPerPage = getReviewsPerPage();
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

    if (currentPage >= totalPages) {
      currentPage = 0;
    }

    const startIndex = currentPage * reviewsPerPage;
    const currentReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

    reviewsList.innerHTML = currentReviews.map(createReviewCard).join('');
    updateCount();
    renderPagination();
  }

  function startAutoSlide() {
    stopAutoSlide();

    autoSlide = setInterval(() => {
      goToNextPage();
    }, 5000);
  }

  function stopAutoSlide() {
    if (autoSlide) {
      clearInterval(autoSlide);
      autoSlide = null;
    }
  }

  function restartAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  reviewsList.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    stopAutoSlide();
  }, { passive: true });

  reviewsList.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].clientX;

    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }

    startAutoSlide();
  }, { passive: true });

  reviewsList.addEventListener('mouseenter', stopAutoSlide);
  reviewsList.addEventListener('mouseleave', startAutoSlide);
});