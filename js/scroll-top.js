document.addEventListener("DOMContentLoaded", () => {
  const scrollBtn = document.createElement("button");

  scrollBtn.className = "scroll-top-btn";
  scrollBtn.innerHTML = '<img src="../assets/img/arrow-up.svg" alt="Наверх">';
  scrollBtn.setAttribute("aria-label", "Наверх");

  document.body.appendChild(scrollBtn);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add("scroll-top-btn--show");
    } else {
      scrollBtn.classList.remove("scroll-top-btn--show");
    }
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});