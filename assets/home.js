/* Home page questions: "Which sounds most like your child?" then "What does your child love?"
   Answers stay in this browser tab (sessionStorage) so the Apply page can fill them in. Nothing is sent until a parent submits a form. */
(function () {
  var quiz = document.getElementById("quiz");
  if (!quiz) return;

    var STRUGGLES = [
      { key: 'freeze', label: 'They can solve the calculation but get stuck when it becomes a word problem.', recap: 'can solve the calculation but gets stuck when it becomes a word problem',
        look: 'I’d check whether the trouble is reading the problem, finding what it’s asking, or choosing the operation, since the math itself is already there.' },
      { key: 'grades', label: 'They get good grades but can’t explain how they got the answer.', recap: 'gets good grades but can’t explain how they got the answer',
        look: 'I’d ask them to explain their thinking and use the skill in a new way. That shows whether they understand it or memorized it.' },
      { key: 'reading', label: 'They have a hard time sounding out words.', recap: 'has a hard time sounding out words',
        look: 'I’d find which letter sounds and patterns aren’t automatic yet, so reading stops taking all of their energy.' },
      { key: 'comprehension', label: 'They read the words but don’t understand what they read.', recap: 'reads the words but doesn’t understand what they read',
        look: 'I’d check whether the trouble is vocabulary, keeping track of what happened, or connecting details, so we work on the real reason.' },
      { key: 'math', label: 'They say, “I’m just bad at math.”', recap: 'says, “I’m just bad at math.”',
        look: 'I’d find the earliest math skill that’s shaky. It’s often a few grades back, and fixing it there helps today’s work make sense.' },
      { key: 'frustrated', label: 'They get frustrated and give up when the work gets hard.', recap: 'gets frustrated and gives up when the work gets hard',
        look: 'I’d find the exact point where the work stops making sense, then build lessons with smaller steps and wins they can see.' }
    ];
    var LOVES = [
      { key: 'sports', label: 'Sports', text: 'sports',
        story: 'Four seconds were left. Jada checked the clock, then the defender, then the open lane. She had one choice to make, and she had to make it fast.',
        early: 'Jada can dash. Jada can pass. Can Jada get the ball in the net?' },
      { key: 'animals', label: 'Animals', text: 'animals',
        story: 'The sea otter floated on its back with a flat rock on its belly. It had cracked shells this way a hundred times. Today, the shell would not break.',
        early: 'The cub sits on a rock. The cub is wet. Mom digs a den.' },
      { key: 'games', label: 'Video Games', text: 'video games',
        story: 'Level 7 had a locked door, three clues, and a timer. Ren read the first clue twice. Something about it didn’t add up.',
        early: 'Ren hits jump. Ren can hop the gap. Get the gem, Ren!' },
      { key: 'music', label: 'Music', text: 'music',
        story: 'The band had practiced the song in four beats. Then the drummer counted off in three, and everyone had to listen fast.',
        early: 'Tap the drum. Tap, tap, tap. The band can jam!' },
      { key: 'art', label: 'Art and Drawing', text: 'art and drawing',
        story: 'Ari had drawn the dragon’s wing five times, and each time it looked flat. On the sixth try, she noticed where the light was coming from.',
        early: 'Ari has a pen. Ari draws a fish with a big fin.' },
      { key: 'space', label: 'Space and Science', text: 'space and science',
        story: 'The rover rolled to the edge of the crater and stopped. Mission Control had twelve minutes to decide: go down or go around?',
        early: 'The ship can zip up, up, up. It lands on a big red rock.' }
    ];

    function tidyNotice(v) {
      var s = (v || '').trim().replace(/^my child\s+/i, '').replace(/[.!?]+$/, '');
      if (s.length > 1 && s.charAt(0) !== s.charAt(0).toLowerCase() && s.charAt(1) === s.charAt(1).toLowerCase()) s = s.charAt(0).toLowerCase() + s.slice(1);
      return s;
    }
    function tidyLove(v) {
      return (v || '').trim().replace(/^(my child|they)\s+loves?\s+/i, '').replace(/[.!?]+$/, '');
    }

    var EX = {
      freeze: {
        sports: ['24 ÷ 4 and “Jada’s team scored 24 points, the same in each of 4 quarters” are the same problem. I circle what’s shared (24 points) and how many groups (4). When a total is split into equal groups, I divide.', 'Kai’s team scored 20 points over 4 quarters, the same each time. What’s shared? How many groups?', 'Jada scored 30 points over 5 games, the same each game. How many points each game?'],
        animals: ['24 ÷ 4 and “Four otters share 24 clams equally” are the same problem. I circle what’s shared (24 clams) and how many groups (4 otters). When a total is split into equal groups, I divide.', 'Four otters share 20 clams equally. What’s shared? How many groups?', 'Five otters share 30 clams equally. How many clams does each otter get?'],
        games: ['24 ÷ 4 and “Ren splits 24 coins among 4 players” are the same problem. I circle what’s shared (24 coins) and how many groups (4 players). When a total is split into equal groups, I divide.', 'Ren splits 20 coins among 4 players. What’s shared? How many groups?', 'Ren splits 30 gems among 5 players. How many gems does each player get?'],
        music: ['24 ÷ 4 and “A band plays 24 songs over 4 nights, the same each night” are the same problem. I circle what’s shared (24 songs) and how many groups (4 nights). When a total is split into equal groups, I divide.', 'The band plays 20 songs over 4 nights, the same each night. What’s shared? How many groups?', 'The band plays 30 songs over 5 nights, the same each night. How many songs each night?'],
        art: ['24 ÷ 4 and “Ari puts 24 crayons into 4 boxes equally” are the same problem. I circle what’s shared (24 crayons) and how many groups (4 boxes). When a total is split into equal groups, I divide.', 'Ari puts 20 crayons into 4 boxes equally. What’s shared? How many groups?', 'Ari puts 30 crayons into 5 boxes equally. How many crayons go in each box?'],
        space: ['24 ÷ 4 and “A rover drives 24 meters in 4 minutes at the same speed” are the same problem. I circle what’s shared (24 meters) and how many groups (4 minutes). When a total is split into equal groups, I divide.', 'The rover drives 20 meters in 4 minutes at the same speed. What’s shared? How many groups?', 'The rover drives 30 meters in 5 minutes at the same speed. How far does it go each minute?']
      },
      grades: {
        sports: ['Jada scored 12 points in 6 minutes. I split 12 into 6 equal parts: 2 points each minute.', 'Kai scored 10 points in 2 minutes. Split 10 into 2 equal parts. How many each minute?', 'New game: Jada scored 16 points in 8 minutes. Kai scored 9 points in 3 minutes. Who scored more each minute? Explain how you know.'],
        animals: ['One turtle walked 12 meters in 6 minutes. I split 12 into 6 equal parts: 2 meters each minute.', 'Another turtle walked 10 meters in 2 minutes. Split 10 into 2 equal parts. How many each minute?', 'New race: One snail crawled 16 inches in 8 minutes. Another snail crawled 9 inches in 3 minutes. Which snail crawled more inches each minute? Explain how you know.'],
        games: ['Shop A sells 6 potions for 12 coins. I split 12 coins into 6 equal parts: 2 coins per potion.', 'Shop B sells 2 potions for 10 coins. Split 10 into 2 equal parts. How many coins per potion?', 'New shops: Shop C sells 8 potions for 16 coins. Shop D sells 3 potions for 9 coins. Which shop has the lower price per potion? Explain how you know.'],
        music: ['Mia learned 12 songs in 6 weeks. I split 12 into 6 equal parts: 2 songs each week.', 'Leo learned 10 songs in 2 weeks. Split 10 into 2 equal parts. How many each week?', 'New challenge: Mia learned 16 songs in 8 weeks. Leo learned 9 songs in 3 weeks. Who learned more songs each week? Explain how you know.'],
        art: ['Ari drew 12 sketches in 6 days. I split 12 into 6 equal parts: 2 sketches each day.', 'Kai drew 10 sketches in 2 days. Split 10 into 2 equal parts. How many each day?', 'New challenge: Ari drew 16 sketches in 8 days. Kai drew 9 sketches in 3 days. Who drew more sketches each day? Explain how you know.'],
        space: ['Rover A drove 12 meters in 6 minutes. I split 12 into 6 equal parts: 2 meters each minute.', 'Rover B drove 10 meters in 2 minutes. Split 10 into 2 equal parts. How many each minute?', 'New mission: Rover C drove 16 meters in 8 minutes. Rover D drove 9 meters in 3 minutes. Which rover was faster? Explain how you know.']
      },
      reading: {
        sports: ['b-a-t, bat', 'c-a-p, cap', 'Dan has a bat and a cap. Dan can bat!'],
        animals: ['c-a-t, cat', 'r-a-t, rat', 'A cat sat. A rat ran. The cat had a nap.'],
        games: ['z-a-p, zap', 'm-a-p, map', 'Sam has a map. Sam can zap a bad bat.'],
        music: ['t-a-p, tap', 'p-a-n, pan', 'Pam can tap a pan. Tap, tap, tap! Pam and Dad jam.'],
        art: ['p-a-d, pad', 't-a-n, tan', 'Nan has a pad. Nan can map a cat. The cat is tan.'],
        space: ['l-a-b, lab', 'm-a-p, map', 'Zak has a map and a cap. Zak ran to the lab.']
      },
      comprehension: {
        sports: ['“Jada usually passed to the same teammate. Today a defender stood in the way, so she bounced the ball to Kai.” I find the clue: a defender stood in the way.', 'What did Jada do because of that clue?', 'New story: “Kai saw the goalie move left, so he kicked right.” Why did Kai kick right? Use a clue.'],
        animals: ['“The small rock shifted whenever the otter struck the shell. A larger rock nearby stayed in place.” I find the clue: the small rock shifted.', 'What might the otter do because of that clue?', 'New story: “The water kept pulling the otter away from its family, so it wrapped itself in kelp before napping.” Why did the otter wrap itself in kelp? Use a clue.'],
        games: ['“The clue said to turn left after the blue door. Ren saw two blue doors.” I find the clue: there were two blue doors.', 'Why did Ren read the clue again?', 'New story: “Ren’s torch was almost out, so he ran straight to the waterfall instead of exploring the cave.” Why did Ren hurry? Use a clue.'],
        music: ['“The band practiced a slow introduction. Tonight, the drummer started much faster.” I find the clue: the drummer started much faster.', 'What did the band have to do because of that clue?', 'New story: “The singer’s microphone stopped working, so she stepped closer to the crowd and sang louder.” Why did she sing louder? Use a clue.'],
        art: ['“Ari’s dragon wing looked flat. Then she noticed the light was coming from the left.” I find the clue: the light was coming from the left.', 'What could Ari change because of that clue?', 'New story: “Ari’s paint kept dripping down the page, so she laid the paper flat on the table.” Why did Ari lay the paper flat? Use a clue.'],
        space: ['“The crater’s sides were steep, and the rover might not climb back out. Going around would take longer.” I find the clue: the rover might not climb back out.', 'Why might Mission Control choose the longer route?', 'New story: “A dust storm was coming, so the team turned the rover’s solar panels away from the wind.” Why did they turn the panels? Use a clue.']
      },
      math: {
        sports: ['Jada scores 5 points in each of 4 games. I draw 4 groups of 5 dots and count by fives: 5, 10, 15, 20.', 'Now 3 games, 5 points each. Draw it or count by fives with me.', 'Now 6 games, 5 points each. Solve it your way, then write the number sentence.'],
        animals: ['An otter eats 5 clams each hour for 4 hours. I draw 4 groups of 5 dots and count by fives: 5, 10, 15, 20.', 'Now 3 hours, 5 clams each hour. Draw it or count by fives with me.', 'Now 6 hours, 5 clams each hour. Solve it your way, then write the number sentence.'],
        games: ['Ren earns 5 coins on each of 4 levels. I draw 4 groups of 5 coins and count by fives: 5, 10, 15, 20.', 'Now 3 levels, 5 coins each. Draw it or count by fives with me.', 'Now 6 levels, 5 coins each. Solve it your way, then write the number sentence.'],
        music: ['Mia practices 5 minutes on each of 4 songs. I draw 4 groups of 5 and count by fives: 5, 10, 15, 20.', 'Now 3 songs, 5 minutes each. Draw it or count by fives with me.', 'Now 6 songs, 5 minutes each. Solve it your way, then write the number sentence.'],
        art: ['Ari draws 4 flowers with 5 petals each. I draw 4 groups of 5 petals and count by fives: 5, 10, 15, 20.', 'Now 3 flowers, 5 petals each. Draw it or count by fives with me.', 'Now 6 flowers, 5 petals each. Solve it your way, then write the number sentence.'],
        space: ['The rover collects 5 rocks at each of 4 stops. I draw 4 groups of 5 rocks and count by fives: 5, 10, 15, 20.', 'Now 3 stops, 5 rocks each. Draw it or count by fives with me.', 'Now 6 stops, 5 rocks each. Solve it your way, then write the number sentence.']
      },
      frustrated: {
        sports: ['Big question: 15 points in each of 6 games. I start small: 2 games is 15 + 15 = 30.', 'Six games make three groups of 2. Add 30 three times with me.', 'Now 15 points in each of 4 games. Which small step will you start with?'],
        animals: ['Big question: Six dolphins each eat 15 fish. I start small: 2 dolphins eat 15 + 15 = 30.', 'Six dolphins make three groups of 2. Add 30 three times with me.', 'Now 4 dolphins, 15 fish each. Which small step will you start with?'],
        games: ['Big question: 15 coins on each of 6 levels. I start small: 2 levels is 15 + 15 = 30.', 'Six levels make three groups of 2. Add 30 three times with me.', 'Now 15 coins on each of 4 levels. Which small step will you start with?'],
        music: ['Big question: Mia practices 15 minutes a day for 6 days. I start small: 2 days is 15 + 15 = 30.', 'Six days make three groups of 2. Add 30 three times with me.', 'Now 15 minutes a day for 4 days. Which small step will you start with?'],
        art: ['Big question: 15 beads for each of 6 bracelets. I start small: 2 bracelets is 15 + 15 = 30.', 'Six bracelets make three groups of 2. Add 30 three times with me.', 'Now 15 beads for each of 4 bracelets. Which small step will you start with?'],
        space: ['Big question: The rover drives 15 meters each minute for 6 minutes. I start small: 2 minutes is 15 + 15 = 30.', 'Six minutes make three groups of 2. Add 30 three times with me.', 'Now 15 meters each minute for 4 minutes. Which small step will you start with?']
      }
    };

  var st = { step: "noticing", notice: null, love: null, ownNotice: "", ownLove: "", ownNoticeOpen: false, ownLoveOpen: false };
  function $(id) { return document.getElementById(id); }
  function find(list, key) { for (var i = 0; i < list.length; i++) if (list[i].key === key) return list[i]; return null; }
  function save(data) {
    try {
      if (data) sessionStorage.setItem("tlp-answers", JSON.stringify(data));
      else sessionStorage.removeItem("tlp-answers");
    } catch (e) {}
  }
  var CHECK = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" style="flex: 0 0 auto; margin-top: 2px"><circle cx="10" cy="10" r="9" fill="none" stroke="#073f4d" stroke-width="1.5"></circle><path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="#073f4d" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  var ON = "#d5a94e", OFF = "rgba(255,253,248,0.22)";

  function setBusy() {
    var busy = st.step === "love" || (st.step === "noticing" && st.ownNoticeOpen);
    document.body.setAttribute("data-quiz-busy", busy ? "true" : "false");
  }

  function bringIntoView(el) {
    if (!el) return;
    el.focus({ preventScroll: true });
    var r = el.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.6) el.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function show(step, focusId) {
    st.step = step;
    $("step-notice").hidden = step !== "noticing";
    $("step-love").hidden = step !== "love";
    $("step-answer").hidden = step !== "answered";
    $("bar2").style.background = step === "love" || step === "answered" ? ON : OFF;
    $("bar3").style.background = step === "answered" ? ON : OFF;
    $("own-notice-box").hidden = !st.ownNoticeOpen;
    $("own-love-box").hidden = !st.ownLoveOpen;
    setBusy();
    if (step === "answered") renderAnswer();
    if (focusId) bringIntoView($(focusId));
  }

  function renderAnswer() {
    var s = find(STRUGGLES, st.notice), l = find(LOVES, st.love);
    var noticeText = st.notice === "own" ? tidyNotice(st.ownNotice) : (s ? s.recap : "");
    var loveText = st.love === "own" ? tidyLove(st.ownLove) : (l ? l.text : "");
    var endsInQuote = /[.!?]”$/.test(noticeText);
    var isReading = st.notice === "reading";
    var custom = st.notice === "own" || st.love === "own" || !EX[st.notice] || !EX[st.notice][st.love];
    var lines = custom
      ? ["I show the thinking with a story or example about " + (loveText || "what your child loves") + ".", "We practice a similar question together, with help.", "Your child tries a new one without hints and explains how they know."]
      : EX[st.notice][st.love];
    var labels = isReading
      ? ["My Turn: Model the Sounds", "Together: Practice With Help", "Your Turn: Read It Alone"]
      : ["I Show: Teach the Thinking", "We Try: Practice With Help", "You Try: On Your Own"];

    $("recap-notice").textContent = noticeText;
    $("recap-end").textContent = endsInQuote ? "" : ".";
    $("recap-love").textContent = loveText;
    $("look-for").textContent = st.notice === "own"
      ? "I’d find where learning breaks down, using what you’ve told me and what I see in the assessment."
      : (s ? s.look : "");

    var steps = $("lesson-steps");
    steps.innerHTML = "";
    lines.forEach(function (text, i) {
      var box = document.createElement("div");
      box.setAttribute("style", "padding: 14px 16px; border-radius: 14px; background: #f3ecdc");
      var lab = document.createElement("p");
      lab.setAttribute("style", "margin: 0 0 4px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #073f4d; font-weight: 700");
      lab.textContent = labels[i];
      var body = document.createElement("p");
      body.setAttribute("style", "margin: 0; font-family: Lora, Georgia, serif; font-size: 17px; line-height: 1.5; color: #073f4d");
      body.textContent = text;
      box.appendChild(lab); box.appendChild(body);
      steps.appendChild(box);
    });

    var weekly = isReading
      ? ["A custom reading plan I create for your child", "Two live 20-minute sessions a week with a reading tutor I train", "Stories about " + loveText + " at their reading level", "Systematic phonics, one sound pattern at a time", "Progress checks you can see"]
      : ["Custom lessons and games built around " + loveText, "My review of their work", "A written progress update for you", "A 20-minute live check-in each month, by video or phone"];
    var ul = $("weekly");
    ul.innerHTML = "";
    weekly.forEach(function (text) {
      var li = document.createElement("li");
      li.setAttribute("style", "display: flex; gap: 10px; align-items: flex-start; font-size: 16px; line-height: 1.45");
      li.innerHTML = CHECK;
      var span = document.createElement("span");
      span.textContent = text;
      li.appendChild(span);
      ul.appendChild(li);
    });

    $("step1-title").textContent = isReading ? "Step 1 is a Reading Check" : "Step 1 is a Personal Learning Assessment";
    $("step1-rest").textContent = isReading
      ? ", starting at $75. It shows which sounds and letter patterns your child knows, so I know where to start."
      : ", starting at $199. You’ll get a written Learning Map of your child’s strengths, gaps, and plan.";
    $("price-line").textContent = isReading ? "Reading and phonics starts at $329 a month." : "The digital program starts at $449 a month.";

    var program = isReading ? "reading-starter" : "digital";
    $("apply-answers").setAttribute("href", "apply.html?program=" + program);
    save({ notice: noticeText, love: loveText, program: program });
  }

  /* Answer buttons */
  Array.prototype.forEach.call(document.querySelectorAll("[data-notice]"), function (b) {
    b.addEventListener("click", function () {
      st.notice = b.getAttribute("data-notice");
      st.ownNoticeOpen = false;
      show("love", "h-love");
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-love]"), function (b) {
    b.addEventListener("click", function () {
      st.love = b.getAttribute("data-love");
      st.ownLoveOpen = false;
      show("answered", "h-answer");
    });
  });

  /* "Something Else" */
  $("open-own-notice").addEventListener("click", function () {
    st.ownNoticeOpen = true; show("noticing"); $("own-notice").focus();
  });
  $("open-own-love").addEventListener("click", function () {
    st.ownLoveOpen = true; show("love"); $("own-love").focus();
  });
  function continueNotice() {
    var v = $("own-notice").value.trim();
    if (!v) { $("own-notice").setAttribute("aria-invalid", "true"); $("own-notice").focus(); return; }
    $("own-notice").removeAttribute("aria-invalid");
    st.ownNotice = v; st.notice = "own"; st.ownNoticeOpen = false;
    show("love", "h-love");
  }
  function continueLove() {
    var v = $("own-love").value.trim();
    if (!v) { $("own-love").setAttribute("aria-invalid", "true"); $("own-love").focus(); return; }
    $("own-love").removeAttribute("aria-invalid");
    st.ownLove = v; st.love = "own"; st.ownLoveOpen = false;
    show("answered", "h-answer");
  }
  $("continue-notice").addEventListener("click", continueNotice);
  $("continue-love").addEventListener("click", continueLove);
  $("own-notice").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); continueNotice(); } });
  $("own-love").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); continueLove(); } });

  $("back").addEventListener("click", function () { st.ownLoveOpen = false; show("noticing", "h-notice"); });
  $("start-over").addEventListener("click", function () {
    st = { step: "noticing", notice: null, love: null, ownNotice: "", ownLove: "", ownNoticeOpen: false, ownLoveOpen: false };
    $("own-notice").value = ""; $("own-love").value = "";
    save(null);
    show("noticing", "h-notice");
  });

  show("noticing");
})();
