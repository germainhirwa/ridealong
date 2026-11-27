// Ridealong landing page: lead forms, revenue calculator, small motion.

// ---- Lead forms ----------------------------------------------------------
// Set FORM_ENDPOINT to wherever leads should go (Formspree, Basin, a Vercel
// function, etc.). It receives a JSON POST: { email, source, page }.
// Left empty, the forms just show the thank-you message.
const FORM_ENDPOINT = "";

function showSent() {
  document.querySelectorAll(".when-open").forEach((el) => (el.hidden = true));
  document.querySelectorAll(".when-sent").forEach((el) => (el.hidden = false));
}

document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value.trim();
    const button = form.querySelector('button[type="submit"]');
    if (FORM_ENDPOINT) {
      button.disabled = true;
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email, source: form.dataset.source || "page", page: location.href }),
        });
        if (!res.ok) throw new Error("Request failed");
      } catch (err) {
        button.disabled = false;
        button.textContent = "Try again";
        return;
      }
    }
    showSent();
  });
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Revenue calculator --------------------------------------------------
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const inputs = {};
document.querySelectorAll("input[data-k]").forEach((el) => (inputs[el.dataset.k] = el));
const setOut = (key, text) =>
  document.querySelectorAll(`[data-out="${key}"]`).forEach((el) => (el.textContent = text));

let shownMonthly = 0;
let anim = 0;
function animateMonthly(target) {
  cancelAnimationFrame(anim);
  if (reduceMotion) { shownMonthly = target; setOut("monthly", money(target)); return; }
  const from = shownMonthly, start = performance.now(), dur = 700;
  const step = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    shownMonthly = from + (target - from) * eased;
    setOut("monthly", money(shownMonthly));
    if (t < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}

let calcSeen = false;
function update() {
  const reps = +inputs.reps.value, appts = +inputs.appts.value, ticket = +inputs.ticket.value, lift = +inputs.lift.value;
  const deals = reps * appts * (52 / 12) * (lift / 100);
  const monthly = deals * ticket;
  setOut("reps", reps);
  setOut("appts", appts);
  setOut("lift", lift);
  setOut("ticketLabel", money(ticket));
  setOut("deals", deals < 10 ? deals.toFixed(1) : Math.round(deals).toString());
  setOut("yearly", money(monthly * 12));
  if (calcSeen) animateMonthly(monthly);
  else setOut("monthly", money(monthly));
  return monthly;
}
Object.values(inputs).forEach((el) => el.addEventListener("input", update));
update();

// ---- On-scroll effects ---------------------------------------------------
if ("IntersectionObserver" in window && !reduceMotion) {
  // Count the calculator result up the first time it comes into view.
  const out = document.querySelector(".roi-out");
  if (out) {
    shownMonthly = 0; setOut("monthly", money(0));
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { calcSeen = true; update(); obs.disconnect(); }
    }, { threshold: 0.4 }).observe(out);
  }

  // Facts strip counters.
  document.querySelectorAll(".count").forEach((el) => {
    const to = +el.dataset.to;
    if (to < 2) return;
    el.textContent = "0";
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 900);
        el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 }).observe(el);
  });

  // Gentle reveal for cards and section heads.
  const targets = document.querySelectorAll(".pain-card, .feat, .team, .roi, .steps li, .trade, .founding, .faq, .kitchen-fig, .next li");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  targets.forEach((el, i) => {
    if (el.getBoundingClientRect().top < innerHeight) return; // already on screen
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 60 + "ms";
    io.observe(el);
  });
} else {
  calcSeen = true;
}

// ---- Mobile sticky CTA: hide while a form is on screen -------------------
const mobileCta = document.querySelector(".mobile-cta");
if (mobileCta && "IntersectionObserver" in window) {
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    mobileCta.classList.toggle("away", visible.size > 0);
  });
  document.querySelectorAll(".hero-copy, #start").forEach((el) => io.observe(el));
}
