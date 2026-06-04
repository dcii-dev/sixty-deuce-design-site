(function () {
  "use strict";

  /**
   * Fetches a same-origin HTML partial and injects it before a mount element.
   * @param {string} url      Relative path to the partial HTML file.
   * @param {string} mountId  ID of the element to insert before.
   * @return {Promise<void>}
   */
  async function injectPartial(url, mountId) {
    const mount = document.getElementById(mountId);
    if (!mount) {
      return;
    }
    try {
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) {
        throw new Error(`Failed to load ${url}: ${res.status}`);
      }
      const responseOrigin = new URL(res.url).origin;
      if (responseOrigin !== window.location.origin) {
        throw new Error(`Cross-origin partial rejected: ${res.url}`);
      }
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      mount.before(...doc.body.childNodes);
    } catch (err) {
      console.warn("Component inject error:", err);
    }
  }

  /**
   * Marks the nav link whose href matches the current page as active.
   */
  function markActiveLink() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".site-header__nav a").forEach((link) => {
      const linkPage = link.getAttribute("href").split("/").pop();
      const isActive = linkPage === current;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  /**
   * Initialises the sticky header scroll shadow.
   */
  function initStickyHeader() {
    const header = document.querySelector(".site-header");
    if (!header) {
      return;
    }
    const onScroll = () => {
      header.classList.toggle("site-header--scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /**
   * Boot: inject partials, then initialise interactive components.
   */
  async function initializeApp() {
    await Promise.all([
      injectPartial("partials/nav.html", "nav-mount"),
      injectPartial("partials/footer.html", "footer-mount"),
    ]);
    markActiveLink();
    initStickyHeader();
  }

  if (document.readyState === "complete") {
    initializeApp();
  } else {
    window.addEventListener("load", initializeApp, { once: true });
  }
})();
