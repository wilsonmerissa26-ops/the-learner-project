/* Help page form. Sends to Web3Forms like the other forms. */
(function () {
  var form = document.getElementById("help-form");
  if (!form) return;
  function $(id) { return document.getElementById(id); }
  var status = $("hp-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    var name = $("hp-name"), email = $("hp-email"), msg = $("hp-msg");
    var bad = [];
    [name, email, msg].forEach(function (el) { el.removeAttribute("aria-invalid"); });
    if (!name.value.trim()) bad.push(name);
    if (!email.value.trim() || !email.checkValidity()) bad.push(email);
    if (!msg.value.trim()) bad.push(msg);
    if (bad.length) {
      bad.forEach(function (el) { el.setAttribute("aria-invalid", "true"); });
      status.textContent = "Please add your name, a valid email, and a short message.";
      bad[0].focus();
      return;
    }
    if (form.querySelector("[name=botcheck]").checked) return;
    var fields = {
      subject: "Tech support: " + $("hp-topic").value + " (" + name.value.trim() + ")",
      "Parent name": name.value.trim(),
      email: email.value.trim(),
      "Child's first name": $("hp-child").value.trim() || "Not given",
      "Topic": $("hp-topic").value,
      "Device and browser": $("hp-device").value.trim() || "Not given",
      "Message": msg.value.trim()
    };
    if (!CONFIG.WEB3FORMS_ACCESS_KEY) {
      var lines = Object.keys(fields).filter(function (k) { return k !== "subject"; }).map(function (k) { return k + ": " + fields[k]; });
      window.location.href = "mailto:" + CONFIG.CONTACT_EMAIL + "?subject=" + encodeURIComponent(fields.subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      status.textContent = "Your email app should open with your message filled in. Press send there to finish.";
      return;
    }
    var button = $("hp-submit"), original = button.textContent;
    button.disabled = true; button.textContent = "Sending...";
    tlpSend(fields).then(function (sent) {
      button.disabled = false; button.textContent = original;
      if (!sent) {
        status.textContent = "Your message didn't send. Check your connection and try again, or email " + CONFIG.CONTACT_EMAIL + ".";
        return;
      }
      $("help-body").hidden = true;
      $("hp-done").hidden = false;
      $("hp-done").focus();
      $("hp-done").scrollIntoView({ block: "start" });
    });
  });
})();
