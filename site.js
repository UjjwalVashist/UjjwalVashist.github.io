// Theme toggle (remembered in this browser), copy-email button and Stuttgart local time.
(() => {
  const root = document.documentElement;
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

    const clock = document.getElementById("clock");
    if (clock) {
      const tick = () => clock.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(new Date());
      tick(); setInterval(tick, 30000);
    }
  });
})();
