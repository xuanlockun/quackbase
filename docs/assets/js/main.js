const currentTheme = localStorage.getItem("docs-theme");
if (currentTheme) {
  document.documentElement.dataset.theme = currentTheme;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  const searchInputs = document.querySelectorAll("[data-nav-search]");
  const navLinks = [...document.querySelectorAll("[data-nav-link]")];
  const copyButtons = document.querySelectorAll("[data-copy-source]");

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem("docs-theme", theme);
    themeButtons.forEach((button) => {
      button.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
      button.dataset.themeState = theme;
      button.innerHTML = theme === "light"
        ? '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"/></svg>';
    });
  };

  setTheme(root.dataset.theme || "dark");

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
      setTheme(nextTheme);
    });
  });

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("is-open");
    });

    document.addEventListener("click", (event) => {
      if (!sidebar.classList.contains("is-open")) return;
      if (sidebar.contains(event.target) || sidebarToggle.contains(event.target)) return;
      sidebar.classList.remove("is-open");
    });
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.endsWith(currentPage)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    link.addEventListener("click", () => {
      if (sidebar) {
        sidebar.classList.remove("is-open");
      }
    });
  });

  const filterNav = (value) => {
    const query = value.trim().toLowerCase();
    navLinks.forEach((link) => {
      const match = link.textContent.toLowerCase().includes(query);
      link.classList.toggle("hidden", !match);
    });
  };

  searchInputs.forEach((input) => {
    input.addEventListener("input", (event) => {
      const value = event.target.value;
      searchInputs.forEach((peer) => {
        if (peer !== event.target) peer.value = value;
      });
      filterNav(value);
    });
  });

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const sourceId = button.getAttribute("data-copy-source");
      const source = sourceId ? document.getElementById(sourceId) : null;
      if (!source) return;

      try {
        await navigator.clipboard.writeText(source.innerText.trim());
        const previous = button.textContent;
        button.textContent = "Copied";
        button.classList.add("copied");
        window.setTimeout(() => {
          button.textContent = previous;
          button.classList.remove("copied");
        }, 1600);
      } catch (error) {
        button.textContent = "Failed";
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1600);
      }
    });
  });
});
