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
  const tabGroups = document.querySelectorAll("[data-tabs]");

  const setThemeButtonState = (theme) => {
    themeButtons.forEach((button) => {
      button.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
      button.dataset.themeState = theme;
      button.innerHTML = theme === "light"
        ? '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"/></svg>';
    });
  };

  const captureMermaidSources = () => {
    document.querySelectorAll(".mermaid").forEach((node) => {
      if (!node.dataset.source) {
        node.dataset.source = node.textContent.trim();
      }
    });
  };

  const renderMermaid = async () => {
    if (!window.mermaid) return;

    captureMermaidSources();

    document.querySelectorAll(".mermaid").forEach((node) => {
      if (node.dataset.source) {
        node.removeAttribute("data-processed");
        node.innerHTML = node.dataset.source;
      }
    });

    window.mermaid.initialize({
      startOnLoad: true,
      theme: document.documentElement.dataset.theme === "light" ? "default" : "dark"
    });

    try {
      await window.mermaid.run({
        querySelector: ".mermaid"
      });
    } catch (error) {
      console.error("Mermaid render failed", error);
    }
  };

  const setTheme = async (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem("docs-theme", theme);
    setThemeButtonState(theme);
    await renderMermaid();
  };

  const activateTab = (group, key) => {
    const buttons = group.querySelectorAll("[data-tab-button]");
    const panels = group.querySelectorAll("[data-tab-panel]");

    buttons.forEach((button) => {
      const isActive = button.dataset.tabButton === key;
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.classList.toggle("active", isActive);
      button.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.tabPanel === key;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });
  };

  if (!root.dataset.theme) {
    root.dataset.theme = "light";
  }

  setThemeButtonState(root.dataset.theme || "light");

  themeButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
      await setTheme(nextTheme);
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

  tabGroups.forEach((group) => {
    const buttons = group.querySelectorAll("[data-tab-button]");
    const defaultButton = [...buttons].find((button) => button.getAttribute("aria-selected") === "true") || buttons[0];
    if (defaultButton) {
      activateTab(group, defaultButton.dataset.tabButton);
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activateTab(group, button.dataset.tabButton);
      });
    });
  });

  renderMermaid();
});
