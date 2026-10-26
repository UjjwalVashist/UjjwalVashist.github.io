// Theme toggle (remembered in this browser), copy-email button and Stuttgart local time.
(() => {
  const root = document.documentElement;
  root.classList.add("js");
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch {}
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme");
    if (btn) {
      const label = () => btn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
      label();
      btn.onclick = () => {
        root.dataset.theme = isDark() ? "light" : "dark";
        try { localStorage.setItem("theme", root.dataset.theme); } catch {}
        label();
      };
    }

    const copy = document.getElementById("copy");
    if (copy) copy.onclick = async () => {
      try { await navigator.clipboard.writeText(copy.dataset.mail); copy.textContent = "Copied"; }
      catch { copy.textContent = copy.dataset.mail; }
      setTimeout(() => (copy.textContent = "Copy"), 1600);
    };

    // Fade sections in as they scroll into view, and mark the current section in the menu.
    // Plain scroll checks rather than IntersectionObserver, so content can never stay hidden.
    const blocks = [...document.querySelectorAll("section.block, .case, .row, .facts")];
    const links = [...document.querySelectorAll("nav.links a")];
    const sections = [...document.querySelectorAll("main section[id]")];
    blocks.forEach(b => b.classList.add("reveal"));
    let queued = false;
    const check = () => {
      queued = false;
      const h = innerHeight;
      blocks.forEach(b => { if (b.getBoundingClientRect().top < h * 0.92) b.classList.add("in"); });
      const current = sections.filter(s => s.getBoundingClientRect().top < h * 0.45).pop();
      links.forEach(a => a.classList.toggle("on", !!current && a.hash === "#" + current.id));
    };
    const later = () => { if (!queued) { queued = true; setTimeout(check, 60); } };
    addEventListener("scroll", later, { passive: true });
    addEventListener("resize", later);
    check();
    setTimeout(check, 0);

    const clock = document.getElementById("clock");
    if (clock) {
      const tick = () => clock.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(new Date());
      tick(); setInterval(tick, 30000);
    }
  });
})();
