// Fig. 01: first-digit test per user. Real output of the Audit Analytics Dashboard on its synthetic sample ledger.
(() => {
  const EXPECTED = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => Math.log10(1 + 1 / d));
  const DATA = {
    "Whole ledger": { n: 4007, mad: 0.0051, verdict: "close conformity", obs: [0.2952, 0.1726, 0.1201, 0.1078, 0.0862, 0.0583, 0.0595, 0.0522, 0.0482] },
    "KOCH_J": { n: 731, mad: 0.0232, verdict: "nonconformity", obs: [0.292, 0.1612, 0.0689, 0.1708, 0.1006, 0.0427, 0.0592, 0.0565, 0.0482] },
    "WEBER_K": { n: 668, mad: 0.0116, verdict: "acceptable conformity", obs: [0.3298, 0.1928, 0.1295, 0.0828, 0.0783, 0.0482, 0.0602, 0.0377, 0.0407] },
    "HOFFMANN_S": { n: 699, mad: 0.0106, verdict: "acceptable conformity", obs: [0.2672, 0.181, 0.1178, 0.0991, 0.0948, 0.0603, 0.0632, 0.0632, 0.0532] },
    "SCHMIDT_A": { n: 619, mad: 0.0094, verdict: "acceptable conformity", obs: [0.2871, 0.168, 0.1338, 0.1077, 0.0799, 0.0734, 0.0375, 0.0587, 0.0538] },
    "FISCHER_L": { n: 661, mad: 0.0083, verdict: "acceptable conformity", obs: [0.2988, 0.1631, 0.1341, 0.0838, 0.0823, 0.0595, 0.0762, 0.0579, 0.0442] },
    "BECKER_M": { n: 629, mad: 0.0057, verdict: "close conformity", obs: [0.2971, 0.1693, 0.1438, 0.0958, 0.0783, 0.0687, 0.0591, 0.0383, 0.0495] },
  };
  const W = 640, H = 300, L = 44, R = 12, T = 22, B = 40, MAX = 0.34;
  const ph = H - T - B, step = (W - L - R) / 9, bw = step * 0.46;
  const y = v => T + ph * (1 - v / MAX);
  const cx = i => L + step * i + step / 2;
  const pct = v => (v * 100).toFixed(1) + "%";
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent && parent.appendChild(e);
    return e;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const fig = document.querySelector("figure.chart");
    if (!fig) return;
    const old = fig.querySelector("svg.fig");
    const svg = el("svg", { class: "fig live", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-labelledby": "liveTitle" });
    const title = el("title", { id: "liveTitle" }, svg);
    for (const g of [0, 0.1, 0.2, 0.3]) {
      el("line", { class: "grid", x1: L, x2: W - R, y1: y(g), y2: y(g) }, svg);
      el("text", { class: "tick", x: L - 8, y: y(g) + 4, "text-anchor": "end" }, svg).textContent = Math.round(g * 100) + "%";
    }
    const bars = [], hits = [];
    for (let i = 0; i < 9; i++) {
      bars.push(el("rect", { class: "bar", x: cx(i) - bw / 2, y: T, width: bw, height: ph, rx: 3 }, svg));
      el("text", { class: "tick", x: cx(i), y: H - B + 18, "text-anchor": "middle" }, svg).textContent = i + 1;
    }
    el("polyline", { class: "b-exp", points: EXPECTED.map((v, i) => `${cx(i)},${y(v)}`).join(" ") }, svg);
    EXPECTED.forEach((v, i) => el("circle", { class: "b-exp-dot", cx: cx(i), cy: y(v), r: 3 }, svg));
    const callout = el("text", { class: "callout", "text-anchor": "middle" }, svg);
    el("text", { class: "tick", x: L + (W - L - R) / 2, y: H - 6, "text-anchor": "middle" }, svg).textContent = "first digit of the amount";
    for (let i = 0; i < 9; i++) hits.push(el("rect", { class: "hit", x: L + step * i, y: T, width: step, height: ph, tabindex: 0, role: "button" }, svg));
    old.replaceWith(svg);

    const picker = document.createElement("div");
    picker.className = "picker"; picker.setAttribute("role", "radiogroup"); picker.setAttribute("aria-label", "Show postings of");
    const readout = document.createElement("div");
    readout.className = "readout"; readout.setAttribute("aria-live", "polite");
    const tip = document.createElement("div");
    tip.className = "tip"; tip.hidden = true;
    fig.querySelector(".label").after(picker);
    svg.after(readout);
    fig.style.position = "relative"; fig.appendChild(tip);
    fig.querySelector(".legend").remove();

    let current = "KOCH_J";
    const verdictClass = v => v === "nonconformity" ? "bad" : v.startsWith("close") ? "good" : "ok";
    function show(name) {
      current = name;
      const d = DATA[name], bad = d.verdict === "nonconformity";
      title.textContent = `First-digit shares for ${name} against Benford's law: MAD ${d.mad}, ${d.verdict}.`;
      d.obs.forEach((v, i) => {
        bars[i].style.transform = `scaleY(${v / MAX})`;
        bars[i].classList.toggle("hot", bad && v - EXPECTED[i] > 0.02);
      });
      const top = d.obs.reduce((best, v, i) => v - EXPECTED[i] > d.obs[best] - EXPECTED[best] ? i : best, 0);
      const diff = d.obs[top] - EXPECTED[top];
      callout.setAttribute("x", cx(top)); callout.setAttribute("y", y(Math.max(d.obs[top], EXPECTED[top])) - 8);
      callout.textContent = diff >= 0.01 ? `+${(diff * 100).toFixed(1)} pp` : "";
      callout.classList.toggle("quiet", !bad);
      readout.innerHTML = `<b>${name}</b> · ${d.n.toLocaleString("en")} postings · MAD ${d.mad.toFixed(4)} <span class="verdict ${verdictClass(d.verdict)}">${d.verdict}</span>`;
      picker.querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", b.dataset.name === name));
    }
    for (const name of Object.keys(DATA)) {
      const b = document.createElement("button");
      b.type = "button"; b.dataset.name = name; b.setAttribute("role", "radio");
      b.textContent = name; b.className = DATA[name].verdict === "nonconformity" ? "flag" : "";
      b.onclick = () => show(name);
      picker.appendChild(b);
    }

    const showTip = (i) => {
      const d = DATA[current], diff = d.obs[i] - EXPECTED[i];
      tip.innerHTML = `<b>Digit ${i + 1}</b><span>${current}: ${pct(d.obs[i])}</span><span>Benford: ${pct(EXPECTED[i])}</span><span class="${diff > 0 ? "up" : ""}">${diff >= 0 ? "+" : "−"}${Math.abs(diff * 100).toFixed(1)} pp</span>`;
      const f = fig.getBoundingClientRect(), a = bars[i].getBoundingClientRect(), box = svg.getBoundingClientRect();
      tip.hidden = false;
      tip.style.left = Math.min(f.width - tip.offsetWidth - 8, Math.max(8, a.left - f.left + a.width / 2 - tip.offsetWidth / 2)) + "px";
      tip.style.top = Math.max(a.top - f.top - 6, box.top - f.top + tip.offsetHeight) + "px";  // above the bar, never over the buttons
      bars.forEach((b, j) => b.classList.toggle("dim", j !== i));
    };
    const hideTip = () => { tip.hidden = true; bars.forEach(b => b.classList.remove("dim")); };
    hits.forEach((h, i) => {
      h.setAttribute("aria-label", `Digit ${i + 1}`);
      h.addEventListener("mouseenter", () => showTip(i));
      h.addEventListener("focus", () => showTip(i));
      h.addEventListener("mouseleave", hideTip);
      h.addEventListener("blur", hideTip);
    });
    show(current);
  });
})();
