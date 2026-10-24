/* The Learner Project: shared script for every page.
   Web3Forms sends form answers to thelearnerproject2026@gmail.com and deletes its copy within 7 days.
   If the access key is ever removed, forms open the parent's email app with their answers filled in. */
var CONFIG = {
  WEB3FORMS_ACCESS_KEY: "1e8e51ab-5f62-4dbd-8712-f82cf2072d2b",
  CONTACT_EMAIL: "thelearnerproject2026@gmail.com"
};

/* Send a form to Web3Forms. Resolves true when it arrived, false when it didn't. */
function tlpSend(fields) {
  if (!CONFIG.WEB3FORMS_ACCESS_KEY) return Promise.resolve(false);
  var body = Object.assign({ access_key: CONFIG.WEB3FORMS_ACCESS_KEY, from_name: "The Learner Project website" }, fields);
  return fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body)
  }).then(function (r) {
    return r.json().catch(function () { return {}; }).then(function (res) { return r.ok && res.success === true; });
  }).catch(function () { return false; });
}

/* Free checklist offer. On a computer it opens once after a parent reads about half the page or spends
   30 seconds. On a phone it shows a small bar instead. Never during the home page questions, and it stays
   closed for 14 days after a parent closes it. */
(function () {
  var KEY = "tlp-lead";
  var pop = document.getElementById("lead-pop"), bar = document.getElementById("lead-bar");
  var form = document.getElementById("lead-form"), done = document.getElementById("lead-done");
  var status = document.getElementById("lead-status");
  if (!pop || !form) return;
  var lastFocus = null, triggered = false, started = Date.now();

  function readState() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function writeState(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function blocked() {
    var s = readState();
    if (!s) return false;
    if (s.state === "done") return true;
    return s.state === "dismissed" && Date.now() < s.until;
  }
  function busy() { return document.body.getAttribute("data-quiz-busy") === "true"; }
  function isPhone() { return window.matchMedia && window.matchMedia("(max-width: 640px)").matches; }

  function focusables() {
    return Array.prototype.filter.call(pop.querySelectorAll("a[href], button, input:not(.hp), [tabindex]:not([tabindex='-1'])"), function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }
  function open() {
    if (!pop.hidden) return;
    lastFocus = document.activeElement;
    bar.hidden = true;
    document.body.classList.remove("lead-bar-on");
    pop.hidden = false;
    document.body.classList.add("lead-open");
    var first = form.hidden ? done : document.getElementById("lead-first");
    if (first) first.focus();
  }
  function close(remember) {
    pop.hidden = true;
    document.body.classList.remove("lead-open");
    if (remember && (readState() || {}).state !== "done") writeState({ state: "dismissed", until: Date.now() + 14 * 24 * 60 * 60 * 1000 });
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  function trigger() {
    if (triggered || busy() || blocked()) return;
    triggered = true;
    if (isPhone()) { bar.hidden = false; document.body.classList.add("lead-bar-on"); } else { open(); }
  }

  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight;
    if (h > 0 && (window.scrollY + window.innerHeight) / h >= 0.5) trigger();
  }, { passive: true });
  setTimeout(trigger, 30000);
  document.addEventListener("mouseout", function (e) {
    if (!e.relatedTarget && e.clientY <= 0 && Date.now() - started > 8000) trigger();
  });

  pop.addEventListener("click", function (e) {
    var c = e.target.closest("[data-lead-close]");
    if (c) close(true);
  });
  document.addEventListener("keydown", function (e) {
    if (pop.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(true); return; }
    if (e.key === "Tab") {
      var f = focusables(); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  document.getElementById("lead-bar-open").addEventListener("click", function () { triggered = true; open(); });
  document.getElementById("lead-bar-x").addEventListener("click", function () {
    bar.hidden = true;
    document.body.classList.remove("lead-bar-on");
    writeState({ state: "dismissed", until: Date.now() + 14 * 24 * 60 * 60 * 1000 });
  });

  function source() {
    var q = new URLSearchParams(location.search);
    return q.get("from") || q.get("utm_source") || "direct";
  }
  function referrer() {
    try { return document.referrer ? new URL(document.referrer).hostname : "none"; } catch (e) { return "none"; }
  }
  function showDone(sent, emailsOk) {
    form.hidden = true;
    done.hidden = false;
    document.getElementById("lead-done-text").textContent = sent
      ? (emailsOk ? "I'll also email you now and then with tips and openings." : "Thanks for reading. If you have questions, email " + CONFIG.CONTACT_EMAIL + ".")
      : "Your request didn't reach me, but the checklist is yours. If you'd like to talk, email " + CONFIG.CONTACT_EMAIL + ".";
    done.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    var first = document.getElementById("lead-first"), email = document.getElementById("lead-email");
    var problems = [];
    [first, email].forEach(function (el) { el.removeAttribute("aria-invalid"); });
    if (!first.value.trim()) problems.push(first);
    if (!email.value.trim() || !email.checkValidity()) problems.push(email);
    if (problems.length) {
      problems.forEach(function (el) { el.setAttribute("aria-invalid", "true"); });
      status.textContent = "Please add your first name and a valid email.";
      problems[0].focus();
      return;
    }
    if (form.querySelector("[name=botcheck]").checked) return;
    var grade = document.getElementById("lead-grade").value.trim();
    var emailsOk = document.getElementById("lead-ok").checked;
    var button = form.querySelector("button[type=submit]");
    button.disabled = true; button.textContent = "Sending...";
    tlpSend({
      subject: "Checklist request: " + first.value.trim() + (grade ? " (" + grade + ")" : ""),
      "Parent first name": first.value.trim(),
      email: email.value.trim(),
      "Child's grade": grade || "Not shared",
      "OK to send occasional emails": emailsOk ? "Yes" : "No",
      "Came from": source(),
      "Referring site": referrer()
    }).then(function (sent) {
      button.disabled = false; button.textContent = "Send Me the Checklist";
      writeState({ state: "done" });
      showDone(sent, emailsOk);
    });
  });

  window.__tlpLead = { open: open, trigger: trigger, state: readState };
})();
