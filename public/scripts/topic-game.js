/* Shared engine for the interactive "משחק לימודי" game embedded on many guide pages.
 * Each page defines window.TG_CONFIG (gameId + modes/data) in an inline <script> right
 * before loading this file. This engine is topic-agnostic - it only knows about the
 * generic game mechanics (menu, quiz/match/order stages, timer, scoring, results).
 *
 * DOM contract expected on the page (see any "*-משחק-לימודי-*.md" file for the markup):
 *   #tg (root, dir="rtl") > .tg-screen[data-screen="menu"|"play"|"result"]
 *   #tg-modes, #tg-quit, #tg-mode-name, #tg-lives, #tg-score, #tg-streak,
 *   #tg-progress, #tg-timer-wrap, #tg-timer, #tg-stage, #tg-feedback, #tg-next,
 *   #tg-result, #tg-again, #tg-menu
 *
 * Re-initializes on 'astro:page-load' (Starlight's client-side navigation) as well as on
 * ordinary full page loads, guarded so a given DOM instance is only wired up once.
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function sampleN(arr, n) {
    var shuffled = shuffle(arr);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }

  function initTopicGame() {
    var config = window.TG_CONFIG;
    var root = document.getElementById('tg');
    if (!config || !root || root.dataset.tgInit === 'true') return;
    root.dataset.tgInit = 'true';

    var gameId = config.gameId || 'game';
    var MODES = config.modes || [];

    var $ = function (id) { return document.getElementById(id); };

    var els = {
      modes: $('tg-modes'),
      quit: $('tg-quit'),
      modeName: $('tg-mode-name'),
      lives: $('tg-lives'),
      score: $('tg-score'),
      streak: $('tg-streak'),
      progress: $('tg-progress'),
      timerWrap: $('tg-timer-wrap'),
      timer: $('tg-timer'),
      stage: $('tg-stage'),
      feedback: $('tg-feedback'),
      next: $('tg-next'),
      result: $('tg-result'),
      again: $('tg-again'),
      menuBtn: $('tg-menu')
    };

    if (!els.modes || !els.stage) return;

    var screens = {};
    Array.prototype.forEach.call(root.querySelectorAll('.tg-screen'), function (el) {
      screens[el.getAttribute('data-screen')] = el;
    });

    function showScreen(name) {
      Object.keys(screens).forEach(function (k) {
        screens[k].classList.toggle('is-active', k === name);
      });
    }

    function bestKey(modeKey) { return 'tg-best-' + gameId + '-' + modeKey; }

    function getBest(modeKey) {
      try {
        var raw = localStorage.getItem(bestKey(modeKey));
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }

    function setBest(modeKey, score) {
      try {
        var cur = getBest(modeKey);
        if (!cur || score > cur.score) {
          localStorage.setItem(bestKey(modeKey), JSON.stringify({ score: score }));
          return true;
        }
      } catch (e) { /* private mode / storage disabled - ignore */ }
      return false;
    }

    var state = null;

    function renderMenu() {
      els.modes.innerHTML = '';
      MODES.forEach(function (mode) {
        var best = getBest(mode.key);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tg-mode';
        btn.innerHTML =
          '<span class="tg-mode-icon">' + mode.icon + '</span>' +
          '<span class="tg-mode-body">' +
            '<span class="tg-mode-name">' + esc(mode.name) + '</span>' +
            '<span class="tg-mode-desc">' + esc(mode.desc) + '</span>' +
          '</span>' +
          (best ? '<span class="tg-mode-best">שיא: ' + best.score + '</span>' : '');
        btn.addEventListener('click', function () { startMode(mode); });
        els.modes.appendChild(btn);
      });
    }

    function startMode(mode) {
      var order = sampleN(mode.data.map(function (_, i) { return i; }), mode.sample || mode.data.length);

      state = {
        mode: mode,
        order: order,
        qi: 0,
        score: 0,
        streak: 0,
        bestStreak: 0,
        lives: 3,
        wrongLog: [],
        answered: false,
        timerId: null,
        timeLimit: mode.time || 0,
        matchSel: null,
        matchDone: 0,
        orderPicked: []
      };

      els.modeName.textContent = mode.icon + ' ' + mode.name;
      updateHud();
      showScreen('play');
      renderStage();
    }

    function updateHud() {
      var hearts = '';
      for (var i = 0; i < 3; i++) {
        hearts += '<span class="tg-heart' + (i < state.lives ? '' : ' is-lost') + '">' + (i < state.lives ? '❤️' : '🖤') + '</span>';
      }
      els.lives.innerHTML = hearts;
      els.score.textContent = state.score;
      els.streak.textContent = state.streak;
    }

    function updateProgress() {
      var pct = state.order.length ? (state.qi / state.order.length) * 100 : 0;
      els.progress.style.width = pct + '%';
    }

    function clearTimer() {
      if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
      }
    }

    function startTimer(onTimeout) {
      clearTimer();
      if (!state.timeLimit) {
        els.timerWrap.hidden = true;
        return;
      }
      els.timerWrap.hidden = false;
      els.timer.classList.remove('is-low');
      els.timer.style.width = '100%';
      var start = Date.now();
      var duration = state.timeLimit;
      state.timerId = setInterval(function () {
        var elapsed = Date.now() - start;
        var remaining = Math.max(0, duration - elapsed);
        var pct = (remaining / duration) * 100;
        els.timer.style.width = pct + '%';
        els.timer.classList.toggle('is-low', pct < 30);
        if (remaining <= 0) {
          clearTimer();
          onTimeout();
        }
      }, 100);
    }

    function setFeedback(kind, headText, whyHtml) {
      if (!headText) {
        els.feedback.className = 'tg-feedback';
        els.feedback.innerHTML = '';
        return;
      }
      els.feedback.className = 'tg-feedback is-' + kind;
      els.feedback.innerHTML =
        '<div class="tg-fb-head">' + esc(headText) + '</div>' +
        (whyHtml ? '<div class="tg-fb-why">' + whyHtml + '</div>' : '');
    }

    function renderStage() {
      updateProgress();
      setFeedback(null);
      els.next.hidden = true;
      els.stage.innerHTML = '';
      state.answered = false;

      var mode = state.mode;
      if (mode.type === 'quiz') renderQuiz();
      else if (mode.type === 'match') renderMatch();
      else if (mode.type === 'order') renderOrder();
    }

    /* ---------- מצבי שאלה (quiz) ---------- */
    function renderQuiz() {
      var mode = state.mode;
      var q = mode.data[state.order[state.qi]];
      var html = '<div class="tg-qnum">שאלה ' + (state.qi + 1) + ' מתוך ' + state.order.length + '</div>';
      if (mode.showCode && q.code) {
        html += '<pre class="tg-code">' + esc(q.code) + '</pre>';
      }
      html += '<div class="tg-q">' + q.q + '</div>';
      html += '<div class="tg-opts">';
      q.o.forEach(function (opt, i) {
        html += '<button type="button" class="tg-opt" data-i="' + i + '"><span class="tg-key">' + (i + 1) + '</span><span>' + opt + '</span></button>';
      });
      html += '</div>';
      els.stage.innerHTML = html;

      Array.prototype.forEach.call(els.stage.querySelectorAll('.tg-opt'), function (btn) {
        btn.addEventListener('click', function () {
          answerQuiz(parseInt(btn.getAttribute('data-i'), 10));
        });
      });

      startTimer(function () { answerQuiz(-1); });
    }

    function answerQuiz(idx) {
      if (state.answered) return;
      state.answered = true;
      clearTimer();

      var mode = state.mode;
      var q = mode.data[state.order[state.qi]];
      var correct = idx === q.a;
      var opts = els.stage.querySelectorAll('.tg-opt');

      Array.prototype.forEach.call(opts, function (btn) {
        var i = parseInt(btn.getAttribute('data-i'), 10);
        btn.disabled = true;
        if (i === q.a) btn.classList.add('is-right');
        else if (i === idx) btn.classList.add('is-wrong');
      });

      registerAnswer(correct, q.q.replace(/<[^>]+>/g, ''), q.o[q.a].replace(/<[^>]+>/g, ''), q.w, idx === -1);
    }

    /* ---------- מצב התאמה (match) ---------- */
    function renderMatch() {
      var mode = state.mode;
      var round = mode.data[state.order[state.qi]];
      state.matchSel = null;
      state.matchDone = 0;

      var leftOrder = shuffle(round.pairs.map(function (_, i) { return i; }));
      var rightOrder = shuffle(round.pairs.map(function (_, i) { return i; }));

      var html = '<div class="tg-qnum">סבב ' + (state.qi + 1) + ' מתוך ' + state.order.length + ' - ' + esc(round.title) + '</div>';
      html += '<div class="tg-q">בחרו פריט, ואז את ההתאמה הנכונה לו</div>';
      html += '<div class="tg-match">';
      html += '<div class="tg-match-col" id="tg-match-left">';
      leftOrder.forEach(function (pi) {
        html += '<button type="button" class="tg-mi" data-pi="' + pi + '" data-side="l">' + round.pairs[pi].l + '</button>';
      });
      html += '</div><div class="tg-match-col" id="tg-match-right">';
      rightOrder.forEach(function (pi) {
        html += '<button type="button" class="tg-mi" data-pi="' + pi + '" data-side="r">' + esc(round.pairs[pi].r) + '</button>';
      });
      html += '</div></div>';
      els.stage.innerHTML = html;

      Array.prototype.forEach.call(els.stage.querySelectorAll('.tg-mi'), function (btn) {
        btn.addEventListener('click', function () { handleMatchClick(btn, round); });
      });
    }

    function handleMatchClick(btn, round) {
      var side = btn.getAttribute('data-side');
      var pi = parseInt(btn.getAttribute('data-pi'), 10);

      if (side === 'l') {
        var prevSel = els.stage.querySelector('.tg-mi.is-sel');
        if (prevSel) prevSel.classList.remove('is-sel');
        state.matchSel = { btn: btn, pi: pi };
        btn.classList.add('is-sel');
        return;
      }

      if (!state.matchSel) return;
      var leftBtn = state.matchSel.btn;
      var correct = state.matchSel.pi === pi;

      if (correct) {
        leftBtn.classList.remove('is-sel');
        leftBtn.classList.add('is-done');
        leftBtn.disabled = true;
        btn.classList.add('is-done');
        btn.disabled = true;
        state.matchSel = null;
        state.matchDone++;
        state.score += 60 + state.streak * 10;
        state.streak++;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        updateHud();

        if (state.matchDone >= round.pairs.length) {
          setFeedback('right', '🎉 הסבב הושלם!', 'התאמתם נכון את כל ' + round.pairs.length + ' הזוגות.');
          els.next.hidden = false;
        }
      } else {
        btn.classList.add('tg-shake');
        setTimeout(function () { btn.classList.remove('tg-shake'); }, 300);
        state.streak = 0;
        state.lives--;
        updateHud();
        checkGameOver();
      }
    }

    /* ---------- מצב סידור (order) ---------- */
    function renderOrder() {
      var mode = state.mode;
      var round = mode.data[state.order[state.qi]];
      state.orderPicked = [];

      var poolOrder = shuffle(round.steps.map(function (_, i) { return i; }));

      var html = '<div class="tg-qnum">סבב ' + (state.qi + 1) + ' מתוך ' + state.order.length + ' - ' + esc(round.title) + '</div>';
      html += '<div class="tg-q">לחצו על השלבים לפי הסדר הנכון</div>';
      html += '<ol class="tg-picked" id="tg-order-picked"></ol>';
      html += '<div class="tg-pool" id="tg-order-pool">';
      poolOrder.forEach(function (si) {
        html += '<button type="button" class="tg-step" data-si="' + si + '">' + esc(round.steps[si]) + '</button>';
      });
      html += '</div>';
      els.stage.innerHTML = html;

      Array.prototype.forEach.call(els.stage.querySelectorAll('.tg-step'), function (btn) {
        btn.addEventListener('click', function () { handleOrderClick(btn, round); });
      });
    }

    function handleOrderClick(btn, round) {
      if (btn.disabled) return;
      var si = parseInt(btn.getAttribute('data-si'), 10);
      var expected = state.orderPicked.length;

      if (si === expected) {
        btn.disabled = true;
        state.orderPicked.push(si);
        var picked = $('tg-order-picked');
        var li = document.createElement('li');
        li.className = 'tg-picked-item';
        li.textContent = round.steps[si];
        picked.appendChild(li);

        state.score += 60 + state.streak * 10;
        state.streak++;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        updateHud();

        if (state.orderPicked.length >= round.steps.length) {
          setFeedback('right', '🎉 הרצף הושלם!', 'סידרתם נכון את כל ' + round.steps.length + ' השלבים.');
          els.next.hidden = false;
        }
      } else {
        btn.classList.add('tg-shake');
        setTimeout(function () { btn.classList.remove('tg-shake'); }, 300);
        state.streak = 0;
        state.lives--;
        updateHud();
        checkGameOver();
      }
    }

    /* ---------- לוגיקה משותפת ---------- */
    function registerAnswer(correct, questionText, correctText, whyHtml, timedOut) {
      if (correct) {
        state.score += 100 + state.streak * 20;
        state.streak++;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        setFeedback('right', '✅ נכון!', whyHtml);
      } else {
        state.streak = 0;
        state.lives--;
        setFeedback('wrong', timedOut ? '⏱️ נגמר הזמן' : '❌ לא נכון', 'התשובה הנכונה: ' + esc(correctText) + (whyHtml ? '<br>' + whyHtml : ''));
        state.wrongLog.push({ q: questionText, a: correctText, w: whyHtml });
      }
      updateHud();
      if (!checkGameOver()) {
        els.next.hidden = false;
      }
    }

    function checkGameOver() {
      if (state.lives <= 0) {
        clearTimer();
        setTimeout(function () { endGame(false); }, 700);
        return true;
      }
      return false;
    }

    function nextStep() {
      state.qi++;
      if (state.qi >= state.order.length) {
        endGame(true);
      } else {
        renderStage();
      }
    }

    function rankFor(finished) {
      if (!finished) {
        return { icon: '🔄', name: 'כדאי לחזור על החומר', note: 'נגמרו לכם הלבבות - אבל זה בדיוק מה שהמשחק נועד להראות. עברו שוב על ההסברים למטה ונסו שוב.' };
      }
      var lost = 3 - state.lives;
      if (lost === 0) return { icon: '🏆', name: 'מומחה', note: 'סבב מושלם בלי אף טעות. מרשים!' };
      if (lost === 1) return { icon: '💪', name: 'שולט היטב', note: 'כמעט מושלם - טעות אחת בלבד.' };
      return { icon: '📘', name: 'בדרך הנכונה', note: 'יש עוד קצת ללמוד, אבל הכיוון טוב.' };
    }

    function endGame(finished) {
      clearTimer();
      showScreen('result');
      var rank = rankFor(finished);
      var isNewBest = setBest(state.mode.key, state.score);
      var best = getBest(state.mode.key);

      var html = '<div class="tg-rank">' +
        '<span class="tg-rank-icon">' + rank.icon + '</span>' +
        '<span class="tg-rank-name">' + esc(rank.name) + '</span>' +
        '<span class="tg-rank-note">' + esc(rank.note) + '</span>' +
        '</div>';

      html += '<div class="tg-stats">' +
        '<div class="tg-stat"><span class="tg-stat-v">' + state.score + '</span><span class="tg-stat-k">ניקוד</span></div>' +
        '<div class="tg-stat"><span class="tg-stat-v">' + state.bestStreak + '</span><span class="tg-stat-k">רצף שיא</span></div>' +
        '<div class="tg-stat"><span class="tg-stat-v">' + state.lives + ' / 3</span><span class="tg-stat-k">לבבות שנותרו</span></div>' +
        '<div class="tg-stat"><span class="tg-stat-v">' + state.wrongLog.length + '</span><span class="tg-stat-k">טעויות</span></div>' +
        '</div>';

      if (isNewBest) {
        html += '<div class="tg-record">🎉 שיא חדש במצב הזה: ' + state.score + ' נקודות!</div>';
      } else if (best) {
        html += '<div class="tg-record tg-record--muted">השיא שלכם במצב הזה: ' + best.score + ' נקודות</div>';
      }

      if (state.wrongLog.length) {
        html += '<div class="tg-review"><h3 class="tg-review-h">מה כדאי לחזור עליו</h3>';
        state.wrongLog.forEach(function (item) {
          html += '<div class="tg-review-item">' +
            '<div class="tg-review-q">' + item.q + '</div>' +
            '<div class="tg-review-a">✔️ ' + esc(item.a) + '</div>' +
            (item.w ? '<div class="tg-review-a">' + item.w + '</div>' : '') +
            '</div>';
        });
        html += '</div>';
      }

      els.result.innerHTML = html;
    }

    /* ---------- מאזיני אירועים ---------- */
    if (els.next) els.next.addEventListener('click', nextStep);
    if (els.quit) els.quit.addEventListener('click', function () { clearTimer(); showScreen('menu'); renderMenu(); });
    if (els.again) els.again.addEventListener('click', function () { startMode(state.mode); });
    if (els.menuBtn) els.menuBtn.addEventListener('click', function () { showScreen('menu'); renderMenu(); });

    // listen on document so the number/Enter keys work regardless of focus;
    // guarded on root.dataset.tgInit + document.body.contains(root) so a stale
    // closure from a previous page (pre view-transition swap) never double-fires
    document.addEventListener('keydown', function (e) {
      if (root.dataset.tgInit !== 'true' || !document.body.contains(root)) return;
      if (!screens.play || !screens.play.classList.contains('is-active')) return;
      if (!state || state.mode.type !== 'quiz') return;
      if (!state.answered && e.key >= '1' && e.key <= '9') {
        var idx = parseInt(e.key, 10) - 1;
        var opts = els.stage.querySelectorAll('.tg-opt');
        if (idx < opts.length) answerQuiz(idx);
      } else if (state.answered && e.key === 'Enter' && !els.next.hidden) {
        nextStep();
      }
    });

    renderMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTopicGame);
  } else {
    initTopicGame();
  }
  document.addEventListener('astro:page-load', initTopicGame);
})();
