// Ridealong landing page: lead forms + revenue calculator.

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
          body: JSON.stringify({ email, source: form.closest("section")?.id || "hero", page: location.href }),
        });
        if (!res.ok) throw new Error("Request failed");
      } catch (err) {
        button.disabled = false;
        alert("Something went wrong. Please try again or email us directly.");
        return;
      }
    }
    showSent();
  });
});

// ---- Revenue calculator --------------------------------------------------
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const inputs = {};
document.querySelectorAll("input[data-k]").forEach((el) => (inputs[el.dataset.k] = el));

function setOut(key, text) {
  document.querySelectorAll(`[data-out="${key}"]`).forEach((el) => (el.textContent = text));
}

function update() {
  const reps = Number(inputs.reps.value);
  const appts = Number(inputs.appts.value);
  const ticket = Number(inputs.ticket.value);
  const lift = Number(inputs.lift.value);
  const deals = reps * appts * (52 / 12) * (lift / 100);
  const monthly = deals * ticket;
  setOut("reps", reps);
  setOut("appts", appts);
  setOut("lift", lift);
  setOut("ticketLabel", money(ticket));
  setOut("deals", deals < 10 ? deals.toFixed(1) : Math.round(deals).toString());
  setOut("monthly", money(monthly));
  setOut("yearly", money(monthly * 12));
}

Object.values(inputs).forEach((el) => el.addEventListener("input", update));
update();
