// app.js - Streamix frontend
(async function () {
  const api = "/api/movies";
  let movies = [];
  let catalogEl = document.getElementById("catalog");
  const searchInput = document.getElementById("search");
  const loginBtn = document.getElementById("loginBtn");

  // Player modal
  const playerModal = document.getElementById("playerModal");
  const playerEl = document.getElementById("player");
  const closePlayer = document.getElementById("closePlayer");
  const playerTitle = document.getElementById("player-title");
  const playerDesc = document.getElementById("player-desc");
  const heroPlay = document.getElementById("hero-play");

  closePlayer.addEventListener("click", hidePlayer);
  playerModal.addEventListener("click", (e) => { if (e.target === playerModal.querySelector(".modal-backdrop")) hidePlayer(); });

  // login demo
  loginBtn.addEventListener("click", async () => {
    const email = prompt("Email for demo login (any):");
    if (!email) return;
    const res = await fetch("/api/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email, password: "demo" }) });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("streamix_token", data.token);
      alert("Logged in as " + (data.user?.email || email));
      loginBtn.textContent = "Account";
    }
  });

  // Fetch movies
  async function load() {
    try {
      const r = await fetch(api);
      movies = await r.json();
      renderCatalog(movies);
      setHero(movies[0]);
    } catch (err) {
      console.error("Failed to load movies", err);
      catalogEl.innerHTML = "<div style='color:var(--muted)'>Failed to load catalog.</div>";
    }
  }

  function setHero(m) {
    const heroTitle = document.getElementById("hero-title");
    const heroDesc = document.getElementById("hero-desc");
    const heroEl = document.getElementById("hero");
    if (!m) return;
    heroTitle.textContent = m.title;
    heroDesc.textContent = m.description;
    if (m.thumbnail) heroEl.style.backgroundImage = `url('${m.thumbnail}')`;
    heroPlay.onclick = () => playMovie(m);
  }

  function renderCatalog(list) {
    // group by category
    const categories = {};
    list.forEach(item => {
      const cat = item.category || "Other";
      categories[cat] = categories[cat] || [];
      categories[cat].push(item);
    });

    catalogEl.innerHTML = "";
    Object.keys(categories).forEach(cat => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<h2>${cat}</h2><div class="small"></div>`;
      catalogEl.appendChild(row);

      const carousel = document.createElement("div");
      carousel.className = "carousel";
      categories[cat].forEach(m => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${m.thumbnail}" alt="${escapeHtml(m.title)}">
          <h3>${escapeHtml(m.title)}</h3>
          <p>${escapeHtml(m.year + " • " + m.duration)}</p>
        `;
        card.onclick = () => playMovie(m);
        carousel.appendChild(card);
      });
      catalogEl.appendChild(carousel);
    });
  }

  function playMovie(m) {
    if (!m || !m.video) {
      alert("No video available for this item. Replace demo assets with real video files.");
      return;
    }
    playerTitle.textContent = m.title;
    playerDesc.textContent = m.description;
    playerEl.src = m.video;
    playerEl.currentTime = 0;
    playerEl.play().catch(()=>{});
    playerModal.classList.remove("hidden");
    playerModal.setAttribute("aria-hidden", "false");
  }

  function hidePlayer() {
    playerEl.pause();
    playerEl.src = "";
    playerModal.classList.add("hidden");
    playerModal.setAttribute("aria-hidden", "true");
  }

  // search
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return renderCatalog(movies);
    const filtered = movies.filter(m => (m.title + " " + (m.description || "") + " " + (m.category || "")).toLowerCase().includes(q));
    renderCatalog(filtered);
  });

  // util
  function escapeHtml(s){ return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

  // init
  await load();
})();
