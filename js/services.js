document.addEventListener("DOMContentLoaded", () => {
    const extraServices = document.querySelector("[data-extra-services]");
    if (!extraServices) return;

    const cards = Array.from(extraServices.querySelectorAll("[data-extra-card]"));

    const setActiveCard = (activeIndex) => {
        extraServices.dataset.active = String(activeIndex);

        cards.forEach((item, index) => {
            const isCurrent = index === activeIndex;
            item.classList.toggle("is-active", isCurrent);
            item.querySelector(".extra-service-card__toggle")?.setAttribute("aria-expanded", String(isCurrent));
        });
    };

    const startIndex = cards.findIndex((card) => card.classList.contains("is-active"));
    setActiveCard(startIndex >= 0 ? startIndex : 0);

    cards.forEach((card, index) => {
        const button = card.querySelector(".extra-service-card__toggle");
        button?.addEventListener("click", () => setActiveCard(index));
    });
});
