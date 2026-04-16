const faders = document.querySelectorAll('.fade-in');

function handleScroll() {
  const triggerBottom = window.innerHeight * 0.85;
  const fadeDistance = 40;

  faders.forEach(el => {
    const rect = el.getBoundingClientRect();

    if (rect.top < triggerBottom) {
      el.classList.add('active');
    }

    if (window.scrollY < 20) {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      return;
    }

    if (rect.bottom < fadeDistance) {
      const progress = rect.bottom / fadeDistance;
      el.style.opacity = Math.max(0, progress);
      el.style.transform = `translateY(${(1 - progress) * -10}px)`;
    } else {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }
  });
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);