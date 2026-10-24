/* Apply page: fills in the home page answers (from this browser tab only), picks the program from the
   link the parent used, and sends the application or waitlist request through Web3Forms. */
(function () {
  var form = document.getElementById("apply-form");
  if (!form) return;
  function $(id) { return document.getElementById(id); }

  var PROGRAMS = ["digital", "reading-starter", "reading-merissa", "reading-builder", "reading-plus", "curriculum", "unsure"];
  var DETAIL = {
    "digital": "Starting price: 1 subject, 3 lessons a week.",
    "reading-starter": "Two live 20-minute virtual sessions each week with a reading tutor I train.",
    "reading-merissa": "Two live 20-minute virtual sessions each week, taught by me.",
    "reading-builder": "Three live 30-minute virtual sessions each week with a reading tutor I train.",
    "reading-plus": "Three live 45-minute virtual sessions each week with a reading tutor I train. For older readers."
  };
  var KIND = { founding: "Founding spot application", enroll: "Regular spot application", waitlist: "Waitlist request" };

  var params = new URLSearchParams(location.search);
  var stored = null;
  try { stored = JSON.parse(sessionStorage.getItem("tlp-answers") || "null"); } catch (e) { stored = null; }
  if (stored && !(stored.notice && stored.love)) stored = null;

  var program = params.get("program") || (stored && stored.program) || "unsure";
  if (program === "reading") program = "reading-starter";
  if (PROGRAMS.indexOf(program) < 0) program = "unsure";
  var wanted = params.get("choice") || "";
  if (!KIND[wanted]) wanted = "";

  var select = $("ap-program");
  select.value = program;

  /* Answers from the home page questions */
  if (stored) {
    var endsInQuote = /[.!?]”$/.test(stored.notice);
    $("ans-notice").textContent = stored.notice;
    $("ans-end").textContent = endsInQuote ? "" : ".";
    $("ans-love").textContent = stored.love;
    $("answers-box").hidden = false;
    $("ap-notice").value = "My child " + stored.notice + (endsInQuote ? "" : ".");
    $("ap-love").value = stored.love.charAt(0).toUpperCase() + stored.love.slice(1);
  }

  function radio(value) { return form.querySelector('input[name="choice"][value="' + value + '"]'); }
  function current() { var r = form.querySelector('input[name="choice"]:checked'); return r ? r.value : ""; }

  function update() {
    program = select.value;
    var isReading = program.indexOf("reading") === 0;
    var showFounding = program === "digital" || program === "unsure";
    var showEnroll = program !== "curriculum";
    $("opt-founding").hidden = !showFounding;
    $("opt-enroll").hidden = !showEnroll;

    var c = current() || wanted || (showFounding ? "founding" : "enroll");
    if (c === "founding" && !showFounding) c = showEnroll ? "enroll" : "waitlist";
    if (c === "enroll" && !showEnroll) c = "waitlist";
    radio(c).checked = true;
    ["founding", "enroll", "waitlist"].forEach(function (k) {
      $("opt-" + k).style.borderColor = k === c ? "#073f4d" : "rgba(17,17,15,0.18)";
    });

    var note = isReading ? "Founding spots are for the digital program."
      : (program === "curriculum" ? "Full Curriculum + Learning System is coming soon, so you can join the waitlist for now." : "");
    $("choice-note").textContent = note;
    $("choice-note").hidden = !note;
    $("ap-detail").textContent = DETAIL[program] || "";
    $("ap-detail").hidden = !DETAIL[program];

    var fee;
    if (c === "waitlist") fee = "There is no charge to join the waitlist.";
    else if (isReading) fee = "Reading programs start with a Reading Check: $75 virtual or $125 in person.";
    else if (c === "founding") fee = "Two founding spots are open for the digital program: 30 days at no cost, with weekly progress updates. Founding members pay $100 for the assessment instead of $199, and it’s refunded when you complete the 30 days.";
    else fee = "The digital program starts with a Personal Learning Assessment ($199).";
    $("intro-fee").textContent = fee;

    var waitlist = c === "waitlist";
    $("ap-submit").textContent = waitlist ? "Join the Waitlist" : "Send My Application";
    $("notice-optional").hidden = !waitlist;
  }
  select.addEventListener("change", function () { wanted = ""; update(); });
  Array.prototype.forEach.call(form.querySelectorAll('input[name="choice"]'), function (r) {
    r.addEventListener("change", function () { wanted = r.value; update(); });
  });
  update();

  function mark(el, bad) {
    el.setAttribute("aria-invalid", bad ? "true" : "false");
    el.classList.toggle("field-error", bad);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var status = $("ap-status");
    status.textContent = "";
    if (form.querySelector('[name="botcheck"]').checked) return;

    var c = current();
    var name = $("ap-name"), email = $("ap-email"), grade = $("ap-grade"), notice = $("ap-notice"), consent = $("ap-consent");
    var problems = [];
    mark(name, !name.value.trim()); if (!name.value.trim()) problems.push(name);
    var badEmail = !email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value.trim());
    mark(email, badEmail); if (badEmail) problems.push(email);
    mark(grade, !grade.value); if (!grade.value) problems.push(grade);
    var needNotice = c !== "waitlist" && !notice.value.trim();
    mark(notice, needNotice); if (needNotice) problems.push(notice);
    mark(consent, !consent.checked); if (!consent.checked) problems.push(consent);
    if (problems.length) {
      status.textContent = "Some required answers are missing or incomplete. Fill in the highlighted fields, then submit again.";
      problems[0].focus();
      return;
    }

    var gradeLabel = grade.options[grade.selectedIndex].text;
    var fields = {
      subject: KIND[c] + ": " + name.value.trim() + " (" + gradeLabel + ")",
      "Request": KIND[c],
      "Program": select.options[select.selectedIndex].text,
      "Parent name": name.value.trim(),
      email: email.value.trim(),
      "Phone": $("ap-phone").value.trim() || "Not given",
      "Child's grade": gradeLabel,
      "What they're noticing": notice.value.trim() || "Not given",
      "What their child loves": $("ap-love").value.trim() || "Not given",
      "Confirmed": "Parent or guardian; understands a spot is not guaranteed"
    };

    if (!CONFIG.WEB3FORMS_ACCESS_KEY) {
      var lines = Object.keys(fields).filter(function (k) { return k !== "subject"; }).map(function (k) { return k + ": " + fields[k]; });
      window.location.href = "mailto:" + CONFIG.CONTACT_EMAIL + "?subject=" + encodeURIComponent(fields.subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      status.textContent = "Your email app should open with your answers filled in. Press send there to finish. If nothing opened, email " + CONFIG.CONTACT_EMAIL + ".";
      return;
    }

    var button = $("ap-submit"), original = button.textContent;
    button.disabled = true;
    button.textContent = "Sending...";
    tlpSend(fields).then(function (sent) {
      button.disabled = false;
      button.textContent = original;
      if (!sent) {
        status.textContent = "Your form didn't send. Check your connection and try again, or email " + CONFIG.CONTACT_EMAIL + ".";
        return;
      }
      var waitlist = c === "waitlist";
      $("done-title").textContent = waitlist ? "You’re on the waitlist." : "Thank you. I have your application.";
      $("done-text").textContent = waitlist
        ? "I’ll review your request when I consider future spots, and I may contact you if your child’s needs match an opening."
        : "I’ll reply by email within 48 to 72 hours. While you wait, you can read how it works.";
      $("apply-body").hidden = true;
      $("ap-done").hidden = false;
      $("ap-done").focus();
      $("ap-done").scrollIntoView({ block: "start" });
    });
  });
})();
