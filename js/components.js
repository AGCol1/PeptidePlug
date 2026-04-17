function renderAnnouncementBar() {
  if (!window.SITE_CONFIG || !window.SITE_CONFIG.announcementText) return;

  const existingBar = document.querySelector(".announcement-bar");
  if (existingBar) return;

  const bar = document.createElement("div");
  bar.className = "announcement-bar";
  bar.textContent = window.SITE_CONFIG.announcementText;

  document.body.prepend(bar);
  document.body.classList.add("has-announcement");
}

document.addEventListener("DOMContentLoaded", renderAnnouncementBar);