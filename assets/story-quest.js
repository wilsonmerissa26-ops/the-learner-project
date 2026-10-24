/* Story Quest demo for the website only. Sample words, nothing saved. */
(function () {
  var root = document.getElementById("mini-quest");
  if (!root) return;

  var PETS = {
    fox: { emoji: "🦊", name: "Fox", line: "Read the question, then jump." },
    panda: { emoji: "🐼", name: "Panda", line: "Slow and steady. Think it through." }
  };
  var ITEMS = [
    { answer: "Character", question: "Which story word means a person or animal in the story?", options: ["Setting", "Character", "Problem", "Solution"] },
    { answer: "Setting", question: "Which story word means where and when the story takes place?", options: ["Problem", "Solution", "Setting", "Character"] },
    { answer: "Problem", question: "Which story word means the challenge a character faces?", options: ["Character", "Problem", "Solution", "Setting"] },
    { answer: "Solution", question: "Which story word means how the main problem is worked out?", options: ["Solution", "Setting", "Character", "Problem"] }
  ];
  var canSpeak = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  var s = null;

  function fresh(pet) {
    return { pet: pet || "fox", i: 0, xp: 0, coins: 0, hearts: 3, streak: 0, broken: [], cleared: false, done: false, miss: "" };
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function button(cls, text, onClick) {
    var b = el("button", cls, text);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  function choose(word) {
    var item = ITEMS[s.i];
    if (s.cleared || s.broken.indexOf(word) !== -1) return;
    if (word === item.answer) {
      s.cleared = true;
      s.xp += 10;
      s.coins += 3;
      s.streak += 1;
      s.miss = "";
    } else {
      s.broken.push(word);
      s.streak = 0;
      s.hearts -= 1;
      s.miss = "That block broke. Read the question again and choose another word.";
      if (s.hearts <= 0) {
        s.hearts = 3;
        s.miss += " Hearts refilled.";
      }
    }
    render("answer");
  }

  function next() {
    if (s.i === ITEMS.length - 1) {
      s.done = true;
    } else {
      s.i += 1;
      s.cleared = false;
      s.broken = [];
      s.miss = "";
    }
    render("next");
  }

  /* Read-aloud voice: pick the clearest English voice this device offers.
     Voices differ by device, so this ranks what is available instead of naming one voice. */
  var NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;
  var PREFERRED = /samantha|ava|allison|susan|zoe|nicky|aria|jenny|emma|michelle|google us english/i;
  var chosenVoice = null;

  function scoreVoice(v) {
    var lang = (v.lang || "").replace("_", "-").toLowerCase();
    if (lang.indexOf("en") !== 0 || NOVELTY.test(v.name)) return -1;
    var score = 1;
    if (lang === "en-us") score += 50;
    if (/natural|neural|premium|enhanced/i.test(v.name)) score += 40;
    if (PREFERRED.test(v.name)) score += 30;
    if (v["default"]) score += 5;
    return score;
  }

  function pickVoice() {
    if (!canSpeak) return null;
    var best = null, bestScore = 0;
    window.speechSynthesis.getVoices().forEach(function (v) {
      var sc = scoreVoice(v);
      if (sc > bestScore) { best = v; bestScore = sc; }
    });
    chosenVoice = best;
    return best;
  }

  if (canSpeak) {
    pickVoice();
    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    }
  }

  function speak() {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    var item = ITEMS[s.i];
    var opts = item.options;
    var line = new SpeechSynthesisUtterance(item.question + " Is it " + opts.slice(0, -1).join(", ") + ", or " + opts[opts.length - 1] + "?");
    var voice = chosenVoice || pickVoice();
    if (voice) { line.voice = voice; line.lang = voice.lang; } else { line.lang = "en-US"; }
    line.rate = 0.9;
    line.pitch = 1;
    window.speechSynthesis.speak(line);
  }

  function render(reason) {
    var pet = PETS[s.pet];
    var active = document.activeElement;
    var lastKey = active && root.contains(active) ? active.getAttribute("data-k") : null;
    root.textContent = "";

    var top = el("div", "mq-top");
    var pets = el("div", "mq-pets");
    pets.appendChild(el("span", "", "Your companion:"));
    Object.keys(PETS).forEach(function (key) {
      var b = button("", PETS[key].emoji + " " + PETS[key].name, function () { s.pet = key; render("pet"); });
      b.setAttribute("data-k", "pet-" + key);
      b.setAttribute("aria-pressed", String(s.pet === key));
      pets.appendChild(b);
    });
    var restart = button("", "Restart", function () { s = fresh(s.pet); render("restart"); });
    restart.setAttribute("data-k", "restart");
    pets.appendChild(restart);
    top.appendChild(pets);

    var hud = el("div", "mq-hud");
    hud.appendChild(el("span", "mq-chip", "⭐ " + s.xp + " XP"));
    hud.appendChild(el("span", "mq-chip", "🪙 " + s.coins));
    hud.appendChild(el("span", "mq-chip", "❤️".repeat(s.hearts)));
    hud.appendChild(el("span", "mq-chip", "🔥 " + s.streak));
    hud.appendChild(el("span", "mq-chip", s.done ? "Quest complete" : "Checkpoint " + (s.i + 1) + " / " + ITEMS.length));
    top.appendChild(hud);
    root.appendChild(top);

    var scene = el("div", "mq-scene" + (s.cleared || s.done ? " cleared" : ""));
    scene.setAttribute("aria-hidden", "true");
    scene.appendChild(el("div", "mq-plat spawn", "START"));
    scene.appendChild(el("div", "mq-plat goal", "🏁 GOAL"));
    scene.appendChild(el("div", "mq-avatar", pet.emoji));
    root.appendChild(scene);

    var focusTarget = null;
    var panel = el("div", "mq-panel");

    if (s.done) {
      panel.appendChild(el("div", "mq-tag", "🏆 QUEST COMPLETE"));
      panel.appendChild(el("p", "mq-q", "You and " + pet.name + " explored four story words."));
      panel.appendChild(el("p", "mq-note", "Points are just for practice. They don't measure mastery."));
      focusTarget = button("mq-btn mq-next", "Play again", function () { s = fresh(s.pet); render("restart"); });
      panel.appendChild(focusTarget);
      root.appendChild(panel);
    } else {
      var item = ITEMS[s.i];
      panel.appendChild(el("div", "mq-tag", "🎯 QUESTION"));
      panel.appendChild(el("p", "mq-q", item.question));
      panel.appendChild(el("p", "mq-note", "Pick the right word to unlock the next platform."));
      var grid = el("div", "mq-grid");
      item.options.forEach(function (word, n) {
        var b = button("mq-ans", "", function () { choose(word); });
        b.setAttribute("data-k", "ans-" + word);
        b.appendChild(el("span", "mq-key", "ABCD".charAt(n)));
        b.appendChild(el("span", "", word));
        if (s.broken.indexOf(word) !== -1) {
          b.disabled = true;
          b.setAttribute("aria-label", word + ", wrong choice");
        }
        if (s.cleared && word !== item.answer) b.disabled = true;
        if (s.cleared && word === item.answer) b.className += " right";
        grid.appendChild(b);
      });
      panel.appendChild(grid);

      var tools = el("div", "mq-tools");
      var say = el("div", "mq-say");
      say.appendChild(el("span", "", pet.emoji));
      say.appendChild(el("span", "", pet.line));
      tools.appendChild(say);
      if (canSpeak) tools.appendChild(button("mq-btn", "🔊 Read question", speak));
      panel.appendChild(tools);
      root.appendChild(panel);

      var fb = el("div", "mq-feedback" + (s.cleared ? " good" : s.miss ? " miss" : ""));
      fb.setAttribute("role", "status");
      if (s.cleared) {
        fb.appendChild(el("span", "", "⭐ Checkpoint cleared! " + item.answer + " unlocks the platform. +10 XP, +3 coins."));
        focusTarget = button("mq-btn mq-next", s.i === ITEMS.length - 1 ? "Finish the quest" : "Next checkpoint", next);
        fb.appendChild(focusTarget);
      } else if (s.miss) {
        fb.appendChild(el("span", "", s.miss));
      }
      root.appendChild(fb);
    }

    if (focusTarget && (reason === "answer" || reason === "next")) {
      focusTarget.focus({ preventScroll: true });
    } else if (reason !== "start") {
      var same = lastKey ? root.querySelector('[data-k="' + lastKey + '"]') : null;
      var target = same && !same.disabled ? same : root.querySelector(".mq-ans:not([disabled])");
      if (target) target.focus({ preventScroll: true });
    }
  }

  s = fresh("fox");
  render("start");
})();
