const faders = document.querySelectorAll('.fade-in');
let scrollTimeout;

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

  // Scroll-triggered visibility for banner, basket, and support
  handleScrollVisibility();
}

function handleScrollVisibility() {
  const topBanner = document.getElementById('topBanner');
  const bannerWrap = document.querySelector('.banner-wrap');
  const announcementBar = document.querySelector('.announcement-bar');
  const basketLauncher = document.querySelector('.basket-launcher');
  const supportWidget = document.getElementById('supportWidget');
  
  let scrollThreshold = 150;
  
  // On mobile, use smaller threshold
  if (window.innerWidth < 768) {
    scrollThreshold = 100;
  }
  
  const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  
  if (scrollPos > scrollThreshold) {
    // Hide elements when scrolling down
    if (topBanner && bannerWrap) {
      topBanner.classList.add('fade-out');
      bannerWrap.classList.add('fade-out');
    }
    if (announcementBar) {
      announcementBar.classList.add('fade-out');
    }
    if (basketLauncher) {
      basketLauncher.classList.add('fade-out');
    }
    if (supportWidget) {
      supportWidget.classList.add('fade-out');
    }
  } else {
    // Show elements when at top
    if (topBanner && bannerWrap) {
      topBanner.classList.remove('fade-out');
      bannerWrap.classList.remove('fade-out');
    }
    if (announcementBar) {
      announcementBar.classList.remove('fade-out');
    }
    if (basketLauncher) {
      basketLauncher.classList.remove('fade-out');
    }
    if (supportWidget) {
      supportWidget.classList.remove('fade-out');
    }
  }
}

// Use passive event listener for better mobile performance
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('touchmove', handleScroll, { passive: true });
window.addEventListener('load', handleScroll);
window.addEventListener('resize', handleScroll);