(() => {
  // Theme toggle (persisted)
  const root = document.documentElement;
  const themeSwitch = document.getElementById("themeSwitch");

  function setTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    localStorage.setItem("bs-theme", theme);
    if (themeSwitch) {
      themeSwitch.checked = theme === "dark";
    }
  }

  const savedTheme = localStorage.getItem("bs-theme");
  setTheme(savedTheme === "dark" ? "dark" : "light");
  if (themeSwitch) {
    themeSwitch.addEventListener("change", () =>
      setTheme(themeSwitch.checked ? "dark" : "light"),
    );
  }

  // Data (loaded from static JSON)
  const PLACEHOLDER_LOGO = "/static/images/placeholder.png";

  let entries = [];
  let items = [];
  const listEl = document.getElementById("list");
  const searchEl = document.getElementById("search");
  const categoryEl = document.getElementById("category");
  const noResultsEl = document.getElementById("noResults");

  async function loadEntries() {
    try {
      const res = await fetch("/static/js/entries.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      entries = await res.json();
      renderList();
    } catch (err) {
      console.error("Failed to load entries", err);
      if (listEl) {
        listEl.innerHTML =
          '<div class="alert alert-danger mb-0" role="alert">Failed to load directory data.</div>';
      }
      items = [];
    }
  }

  function escapeAttr(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function entryToCard(e) {
    const website = e.website || "/index.html";
    const dataText = (e.keywords || `${e.name} ${e.bullets.join(" ")}`).toLowerCase();

    return `
        <article class="card shadow-sm group-item" data-cat="${escapeAttr(e.cat)}" data-text="${escapeAttr(dataText)}">
          <div class="card-body">
            <div class="row g-3 align-items-start">
              <div class="col-auto">
                <a class="d-inline-block ratio ratio-1x1 logo-wrapper" href="${escapeAttr(website)}">
                  <img
                    class="w-100 h-100 img-fluid logo-img rounded-3 border"
                    src="${escapeAttr(e.logo || PLACEHOLDER_LOGO)}"
                    alt="${escapeAttr(e.name)}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='${escapeAttr(PLACEHOLDER_LOGO)}';"
                  />
                </a>
              </div>
              <div class="col">
                <h2 class="h6 mb-1">
                  <a class="text-decoration-none" href="${escapeAttr(website)}">${e.name}</a>
                </h2>
                <ul class="small mb-0 mt-2 ps-3">
                  ${e.bullets.map((b) => `<li>${b}</li>`).join("")}
                </ul>
              </div>
            </div>
          </div>
        </article>
      `;
  }

  function renderList() {
    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    if (listEl) {
      listEl.innerHTML = sorted.map(entryToCard).join("");
      items = Array.from(document.querySelectorAll(".group-item"));
      applyFilters();
    }
  }

  function applyFilters() {
    if (!searchEl || !categoryEl || !noResultsEl) return;

    const q = (searchEl.value || "").trim().toLowerCase();
    const cat = categoryEl.value;

    let visible = 0;

    items.forEach((item) => {
      const hay = (item.dataset.text || "").toLowerCase();
      const itemCat = item.dataset.cat || "";
      const show = (cat === "all" || itemCat === cat) && (!q || hay.includes(q));
      item.classList.toggle("d-none", !show);
      if (show) visible++;
    });

    noResultsEl.classList.toggle("d-none", visible !== 0);
  }

  if (searchEl) searchEl.addEventListener("input", applyFilters);
  if (categoryEl) categoryEl.addEventListener("change", applyFilters);

  loadEntries();
})();
