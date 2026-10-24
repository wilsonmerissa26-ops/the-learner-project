/* Home page questions: "Which sounds most like your child?" then "What does your child love?"
   Answers stay in this browser tab (sessionStorage) so the Apply page can fill them in. Nothing is sent until a parent submits a form. */
(function () {
  var quiz = document.getElementById("quiz");
  if (!quiz) return;

    var STRUGGLES = [
      { key: 'freeze', label: 'They can do the calculations but get stuck when it becomes a word problem.', recap: 'can do the calculations but gets stuck when it becomes a word problem',
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

    /* Each example: [I Show, We Try, You Try]. Every step asks a direct question.
       I Show teaches the thinking and reaches the answer. You Try is a fresh question.
       freeze: math word problems (upper elementary). grades: science, fair tests (middle school).
       reading: phonics (early reader). comprehension: reading and vocabulary (upper elementary to middle).
       math: equal groups (elementary). frustrated: writing a first sentence (middle to high school). */
    var EX = {
      freeze: {
        sports: ["Jada’s team scored 24 points, the same number in each of 4 quarters. How many points did they score each quarter? The question asks for one equal share. The total is 24, split into 4 equal groups, so I divide: 24 ÷ 4 = 6. They scored 6 points each quarter.", "Kai’s team scored 20 points, the same number in each of 4 quarters. How many points did they score each quarter? Let’s find the total and the number of equal groups first. Which operation fits?", "Jada scored 30 points over 5 games, the same number in each game. How many points did she score in each game? Show or explain how you know."],
        animals: ["Four otters share 24 clams equally. How many clams does each otter get? The question asks for one otter’s share. The total is 24, split into 4 equal groups, so I divide: 24 ÷ 4 = 6. Each otter gets 6 clams.", "Four otters share 20 clams equally. How many clams does each otter get? Let’s find the total and the number of equal groups first. Which operation fits?", "Five otters share 30 clams equally. How many clams does each otter get? Show or explain how you know."],
        games: ["Ren splits 24 coins equally among 4 players. How many coins does each player get? The question asks for one player’s share. The total is 24, split into 4 equal groups, so I divide: 24 ÷ 4 = 6. Each player gets 6 coins.", "Ren splits 20 coins equally among 4 players. How many coins does each player get? Let’s find the total and the number of equal groups first. Which operation fits?", "Ren splits 30 gems equally among 5 players. How many gems does each player get? Show or explain how you know."],
        music: ["A band plays 24 songs over 4 nights, the same number each night. How many songs do they play each night? The question asks for one night’s share. The total is 24, split into 4 equal groups, so I divide: 24 ÷ 4 = 6. They play 6 songs each night.", "The band plays 20 songs over 4 nights, the same number each night. How many songs do they play each night? Let’s find the total and the number of equal groups first. Which operation fits?", "The band plays 30 songs over 5 nights, the same number each night. How many songs do they play each night? Show or explain how you know."],
        art: ["Ari puts 24 crayons into 4 boxes, the same number in each. How many crayons go in each box? The question asks for one box’s share. The total is 24, split into 4 equal groups, so I divide: 24 ÷ 4 = 6. Each box gets 6 crayons.", "Ari puts 20 crayons into 4 boxes, the same number in each. How many crayons go in each box? Let’s find the total and the number of equal groups first. Which operation fits?", "Ari puts 30 crayons into 5 boxes, the same number in each. How many crayons go in each box? Show or explain how you know."],
        space: ["A rover drives 24 meters in 4 minutes at a steady speed. How far does it drive each minute? The question asks for one minute’s share. The total is 24 meters over 4 equal minutes, so I divide: 24 ÷ 4 = 6. It drives 6 meters each minute.", "The rover drives 20 meters in 4 minutes at a steady speed. How far does it drive each minute? Let’s find the total and the number of equal parts first. Which operation fits?", "The rover drives 30 meters in 5 minutes at a steady speed. How far does it drive each minute? Show or explain how you know."]
      },
      grades: {
        sports: ["Does the floor surface change how high a ball bounces? To find out, I change only the floor. I keep the same ball, drop it from the same height, and measure the highest bounce the same way each time, then repeat. If I changed two things at once, I couldn’t tell which one caused a difference. One change makes it a fair test.", "A student drops a small ball on one floor and a large ball on the other. Is that a fair test? Let’s find the extra change together and fix the plan.", "Jada wants to know if drop height changes how high a ball bounces. What should she change, what should she keep the same, and what should she measure? Explain why."],
        animals: ["Does a ramp’s surface change how far a toy cart rolls past the bottom of the ramp? I change only the surface. I keep the same cart, the same toy fox riding in it, and the same ramp height, then measure how far it rolls past the bottom and repeat. One change makes it a fair test.", "A student changes the ramp surface and also takes the toy fox out of the cart for the second run. Is that a fair test? Let’s find the extra change together and fix the plan.", "Sam wants to know if ramp height changes how far the cart rolls past the bottom of the ramp. What should he change, keep the same, and measure? Explain why."],
        games: ["Ren builds a racecourse like the one in his game. Does ramp height change how far a toy car rolls past the bottom of the ramp? I change only the height. I keep the same car, ramp surface, and floor, then measure how far it rolls past the bottom and repeat. One change makes it a fair test.", "A student uses a different car and a higher ramp in the second run. Is that a fair test? Let’s find the extra change together and fix the plan.", "Ren wants to know if the floor surface changes how far the car rolls past the bottom of the ramp. What should he change, keep the same, and measure? Explain why."],
        music: ["Does the amount of rice in a shaker change how loud it sounds? I change only the amount of rice. I keep the same shaker, shake it the same way, and hold it the same distance from a sound meter, then read the sound level on the meter and repeat. One change makes it a fair test.", "A student adds more rice and also moves farther from the sound meter. Is that a fair test? Let’s find the extra change together and fix the plan.", "Mia wants to know if distance changes the sound level the meter shows for the same shaker. What should she change, keep the same, and measure? Explain why."],
        art: ["Does the type of paper change how far a drop of watercolor spreads? I change only the paper. I keep the same paint mix and the same size drop, then measure how wide the spot spreads on each paper after the same waiting time, and repeat. One change makes it a fair test.", "A student changes the paper and also uses a bigger drop on the second paper. Is that a fair test? Let’s find the extra change together and fix the plan.", "Ari wants to know if adding more water to the paint changes how far a drop spreads. What should she change, keep the same, and measure? Explain why."],
        space: ["Does drop height change how wide a crater is in a tray of sand? I change only the drop height. I keep the same ball and the same sand depth, and smooth the sand the same way each time, then measure the crater’s width and repeat. One change makes it a fair test.", "A student uses a heavier ball and a higher drop in the second test. Is that a fair test? Let’s find the extra change together and fix the plan.", "The team wants to know if sand depth changes how wide the crater is. What should they change, keep the same, and measure? Explain why."]
      },
      reading: {
        sports: ["What word do these letters make? b-a-t. I point to each letter, say its sound, and blend them from left to right: bat.", "What word is this? Let’s say each sound together, then blend: s-a-t, sat.", "Can you read this word on your own, before you see a picture? cap. Then a short sentence made only of sounds you know: Sam can bat."],
        animals: ["What word do these letters make? c-a-t. I point to each letter, say its sound, and blend them from left to right: cat.", "What word is this? Let’s say each sound together, then blend: s-a-t, sat.", "Can you read this word on your own, before you see a picture? ram. Then a short sentence made only of sounds you know: Cats can nap."],
        games: ["What word do these letters make? m-a-p. I point to each letter, say its sound, and blend them from left to right: map.", "What word is this? Let’s say each sound together, then blend: s-a-t, sat.", "Can you read this word on your own, before you see a picture? gap. Then a short sentence made only of sounds you know: Sam can tap."],
        music: ["What word do these letters make? t-a-p. I point to each letter, say its sound, and blend them from left to right: tap.", "What word is this? Let’s say each sound together, then blend: s-a-t, sat.", "Can you read this word on your own, before you see a picture? rap. Then a short sentence made only of sounds you know: Pam can tap."],
        art: ["What word do these letters make? r-a-g. I point to each letter, say its sound, and blend them from left to right: rag.", "What word is this? Let’s say each sound together, then blend: s-a-t, sat.", "Can you read this word on your own, before you see a picture? pad. Then a short sentence made only of sounds you know: Nan can dab."],
        space: ["What word do these letters make? l-a-b. I point to each letter, say its sound, and blend them from left to right: lab.", "What word is this? Let’s say each sound together, then blend: s-a-t, sat.", "Can you read this word on your own, before you see a picture? bag. Then a short sentence made only of sounds you know: Sam can map."]
      },
      comprehension: {
        sports: ["Why did Jada pass to Kai? I read: “A defender blocked Jada’s path. Kai was open, with nobody guarding him.” Blocked means something is in the way. Open means free to get the ball. Those two details explain it: her path was blocked, and Kai was open, so she passed to him.", "Why did Kai pass back to Jada? “A defender guarded Kai closely. Jada moved into open space.” Let’s find what guarded means, then the detail that explains his choice.", "Why did Sam step sideways? “A taller player stood in front of Sam. He stepped sideways until he had a clear view of the basket.” Use a detail from the text to explain."],
        animals: ["Why did the otter move to the larger rock? I read: “The small rock rolled whenever the otter struck a shell against it. A larger rock stayed firmly in place.” Firmly means without moving. The small rock rolled, and the large one stayed still, so the otter moved to the rock that held steady.", "Why did the fox go uphill? “Deep water covered the fox’s usual path. A dry path led up the hill.” Let’s find the problem first, then the detail that explains the fox’s choice.", "Why did the rabbit move under the bush? “The sun heated the bare ground. Under the bush, the ground was shaded and cooler.” Use a detail from the text to explain."],
        games: ["Why did Ren enter the room? I read: “Ren’s energy bar was almost empty. A sign marked the room as a charging station.” A charging station is a place to refill energy. Low energy and a place to recharge explain his choice.", "Why did Sam pick up the health pack? “Sam’s character had one heart left. A health pack lay beside the path.” Let’s find what a health pack does, then the detail that explains the choice.", "Why did Ren leave the chest behind? “A warning said the bridge could not hold heavy objects. Ren set the heavy treasure chest on the bank before crossing.” Use a detail from the text to explain."],
        music: ["Why did the singer step closer and sing louder? I read: “The audience could barely hear the singer after her microphone stopped working.” Barely means almost not at all. Without a working microphone, they could hardly hear her, so she moved closer and sang louder.", "Why did the drummer play more softly? “The drums were much louder than the flute. The audience could not hear the flute.” Let’s find the problem first, then the detail that explains the drummer’s choice.", "Why did Mia switch guitars? “One string on Mia’s guitar had broken. A spare guitar stood nearby.” Use a detail from the text to explain."],
        art: ["Why did Ari lay her paper flat? I read: “Wet paint ran down Ari’s upright paper.” Upright means standing up straight. Paint runs down paper that stands up, so she laid it flat to stop the drips.", "Why did Ari choose thicker paper? “Ari’s thin paper tore when she added water.” Let’s find the problem first, then the detail that explains her choice.", "Why did Ari press more lightly? “Ari’s pencil lines were too dark to erase easily. In her next sketch, she pressed more lightly.” Use a detail from the text to explain."],
        space: ["Why did the team choose the longer route? I read: “The crater’s sides were too steep for the rover to climb safely.” Steep means rising sharply. The rover couldn’t climb out safely, so going around was the safer choice.", "Why did the team change the rover’s route? “Loose sand made the rover’s wheels sink. A firm, rocky path lay nearby.” Let’s find what firm means, then the detail that explains the choice.", "Why did the team clean the camera lens? “Dust covered the rover’s camera lens, and its pictures were blurry.” Use a detail from the text to explain."]
      },
      math: {
        sports: ["How many balls are in 4 baskets with 5 balls each? Each basket is a group of 5. I add a 5 for each basket: 5 + 5 + 5 + 5 = 20. Four groups of 5 is also 4 × 5 = 20. There are 20 balls.", "How many balls are in 3 baskets with 5 balls each? Let’s add a 5 for each basket together. What does the 3 stand for? What does the 5 stand for?", "There are 6 baskets with 5 balls in each. How many balls are there in all? Show or explain how you know."],
        animals: ["How many food pieces are on 4 trays with 5 pieces each? Each tray is a group of 5. I add a 5 for each tray: 5 + 5 + 5 + 5 = 20. Four groups of 5 is also 4 × 5 = 20. There are 20 food pieces.", "How many food pieces are on 3 trays with 5 pieces each? Let’s add a 5 for each tray together. What does the 3 stand for? What does the 5 stand for?", "There are 6 trays with 5 food pieces on each. How many food pieces are there in all? Show or explain how you know."],
        games: ["How many coins are in 4 treasure chests with 5 coins each? Each chest is a group of 5. I add a 5 for each chest: 5 + 5 + 5 + 5 = 20. Four groups of 5 is also 4 × 5 = 20. There are 20 coins.", "How many coins are in 3 chests with 5 coins each? Let’s add a 5 for each chest together. What does the 3 stand for? What does the 5 stand for?", "There are 6 treasure chests with 5 coins in each. How many coins are there in all? Show or explain how you know."],
        music: ["Mia practices 4 songs for 5 minutes each. How many minutes does she practice? Each song is a group of 5 minutes. I add a 5 for each song: 5 + 5 + 5 + 5 = 20. Four groups of 5 is also 4 × 5 = 20. She practices 20 minutes.", "Mia practices 3 songs for 5 minutes each. How many minutes is that? Let’s add a 5 for each song together. What does the 3 stand for? What does the 5 stand for?", "Mia practices 6 songs for 5 minutes each. How many minutes does she practice in all? Show or explain how you know."],
        art: ["How many petals are on 4 flowers with 5 petals each? Each flower is a group of 5. I add a 5 for each flower: 5 + 5 + 5 + 5 = 20. Four groups of 5 is also 4 × 5 = 20. There are 20 petals.", "How many petals are on 3 flowers with 5 petals each? Let’s add a 5 for each flower together. What does the 3 stand for? What does the 5 stand for?", "Ari draws 6 flowers with 5 petals on each. How many petals are there in all? Show or explain how you know."],
        space: ["How many rocks are in 4 sample boxes with 5 rocks each? Each box is a group of 5. I add a 5 for each box: 5 + 5 + 5 + 5 = 20. Four groups of 5 is also 4 × 5 = 20. There are 20 rocks.", "How many rocks are in 3 boxes with 5 rocks each? Let’s add a 5 for each box together. What does the 3 stand for? What does the 5 stand for?", "There are 6 sample boxes with 5 rocks in each. How many rocks are there in all? Show or explain how you know."]
      },
      frustrated: {
        sports: ["Should student athletes need passing grades to play? When an essay feels too big, I start with one sentence that answers the question and gives a reason: “Student athletes should need passing grades to play because school comes first.” One clear sentence is a real first step.", "Should practices start later on school days? Pick your side. Here is the start: “Practices should ___ start later on school days because ___.” What reason fits your side? Different opinions are welcome when the reasoning makes sense.", "Should every player get equal playing time? Write one sentence that answers the question and gives a reason."],
        animals: ["Should people adopt pets from shelters? When an essay feels too big, I start with one sentence that answers the question and gives a reason: “People should adopt pets from shelters because those animals need homes.” One clear sentence is a real first step.", "Should schools have a class pet? Pick your side. Here is the start: “Schools should ___ have a class pet because ___.” What reason fits your side? Different opinions are welcome when the reasoning makes sense.", "Should dogs be allowed off the leash in parks? Write one sentence that answers the question and gives a reason."],
        games: ["Should schools use video games to teach? When an essay feels too big, I start with one sentence that answers the question and gives a reason: “Schools should use some video games to teach because games give quick feedback.” One clear sentence is a real first step.", "Should there be a daily limit on screen time? Pick your side. Here is the start: “There should ___ be a daily limit on screen time because ___.” What reason fits your side? Different opinions are welcome when the reasoning makes sense.", "Should video games count as a sport? Write one sentence that answers the question and gives a reason."],
        music: ["Should every student learn an instrument? When an essay feels too big, I start with one sentence that answers the question and gives a reason: “Every student should learn an instrument because practice builds patience.” One clear sentence is a real first step.", "Should students listen to music while they study? Pick your side. Here is the start: “Students should ___ listen to music while they study because ___.” What reason fits your side? Different opinions are welcome when the reasoning makes sense.", "Should schools offer music class every year? Write one sentence that answers the question and gives a reason."],
        art: ["Should art class be required in high school? When an essay feels too big, I start with one sentence that answers the question and gives a reason: “Art class should be required because it teaches students to solve problems creatively.” One clear sentence is a real first step.", "Should student art be displayed around the school? Pick your side. Here is the start: “Student art should ___ be displayed around the school because ___.” What reason fits your side? Different opinions are welcome when the reasoning makes sense.", "Should students be allowed to paint murals on school walls? Write one sentence that answers the question and gives a reason."],
        space: ["Should people try to live on Mars? When an essay feels too big, I start with one sentence that answers the question and gives a reason: “People should not try to live on Mars yet because the planet has no breathable air.” One clear sentence is a real first step.", "Should countries spend more money exploring space? Pick your side. Here is the start: “Countries should ___ spend more money exploring space because ___.” What reason fits your side? Different opinions are welcome when the reasoning makes sense.", "Should schools teach more about space? Write one sentence that answers the question and gives a reason."]
      }
    };
    /* Pictures for the worked example: equal groups (what each group is, what each dot stands for) and phonics sound dots. */
    var VIS = {
      math: {
        sports: ["Basket", "ball"], animals: ["Tray", "food piece"], games: ["Chest", "coin"],
        music: ["Song", "minute"], art: ["Flower", "petal"], space: ["Box", "rock"]
      },
      reading: { sports: "bat", animals: "cat", games: "map", music: "tap", art: "rag", space: "lab" }
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

  /* A small picture for the worked example: labeled equal groups, or letters with sound dots. */
  function picture(notice, love) {
    var wrap = document.createElement("div");
    if (notice === "math" && VIS.math[love]) {
      var unit = VIS.math[love][0], item = VIS.math[love][1];
      wrap.setAttribute("role", "img");
      wrap.setAttribute("aria-label", "4 groups labeled " + unit + " 1 to " + unit + " 4, each with 5 dots. Each dot is a " + item + ".");
      wrap.setAttribute("style", "margin-top: 12px");
      var grid = document.createElement("div");
      grid.setAttribute("style", "display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px");
      for (var g = 1; g <= 4; g++) {
        var cell = document.createElement("div");
        cell.setAttribute("style", "padding: 6px 2px 8px; border-radius: 10px; background: #fffdf8; border: 1px solid rgba(7,63,77,0.18); text-align: center");
        var name = document.createElement("div");
        name.setAttribute("style", "font-size: 11px; font-weight: 600; color: #073f4d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis");
        name.textContent = unit + " " + g;
        var dots = document.createElement("div");
        dots.setAttribute("style", "margin-top: 6px; display: flex; flex-wrap: nowrap; justify-content: center; gap: 2px");
        for (var d = 0; d < 5; d++) {
          var dot = document.createElement("span");
          dot.setAttribute("style", "width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: #073f4d; display: inline-block");
          dots.appendChild(dot);
        }
        cell.appendChild(name); cell.appendChild(dots); grid.appendChild(cell);
      }
      var cap = document.createElement("p");
      cap.setAttribute("style", "margin: 6px 0 0; font-size: 13px; color: #5f5a50");
      cap.textContent = "Each dot is a " + item + ".";
      wrap.appendChild(grid); wrap.appendChild(cap);
      return wrap;
    }
    if (notice === "reading" && VIS.reading[love]) {
      var word = VIS.reading[love];
      wrap.setAttribute("role", "img");
      wrap.setAttribute("aria-label", "The letters " + word.split("").join(", ") + ", each with a sound dot, blend into the word " + word + ".");
      wrap.setAttribute("style", "margin-top: 12px; display: flex; align-items: flex-end; gap: 14px");
      var row = document.createElement("div");
      row.setAttribute("style", "display: inline-flex; flex-direction: column; gap: 4px");
      var letters = document.createElement("div");
      letters.setAttribute("style", "display: flex; gap: 22px; padding: 0 6px");
      word.split("").forEach(function (ch) {
        var col = document.createElement("div");
        col.setAttribute("style", "display: flex; flex-direction: column; align-items: center; gap: 4px");
        var l = document.createElement("span");
        l.setAttribute("style", "font-family: Lora, Georgia, serif; font-size: 28px; font-weight: 700; line-height: 1; color: #073f4d");
        l.textContent = ch;
        var dt = document.createElement("span");
        dt.setAttribute("style", "width: 7px; height: 7px; border-radius: 50%; background: #073f4d; display: inline-block");
        col.appendChild(l); col.appendChild(dt); letters.appendChild(col);
      });
      var arrow = document.createElement("div");
      arrow.setAttribute("style", "position: relative; height: 2px; background: #073f4d; margin-right: 6px");
      var head = document.createElement("span");
      head.setAttribute("style", "position: absolute; right: -6px; top: -5px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 9px solid #073f4d");
      arrow.appendChild(head);
      row.appendChild(letters); row.appendChild(arrow);
      var whole = document.createElement("span");
      whole.setAttribute("style", "font-family: Lora, Georgia, serif; font-size: 28px; font-weight: 700; line-height: 1; color: #073f4d; padding-bottom: 6px");
      whole.textContent = word;
      wrap.appendChild(row); wrap.appendChild(whole);
      return wrap;
    }
    return null;
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
      if (i === 0 && !custom) { var pic = picture(st.notice, st.love); if (pic) box.appendChild(pic); }
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
