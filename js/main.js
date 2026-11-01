(function () {
  'use strict';

  if (window.top !== window.self) {
    document.documentElement.style.display = 'none';
    try {
      window.top.location = window.self.location;
    } catch (e) {
      document.documentElement.style.display = 'none';
    }
  }
})();

(function () {
  'use strict';

  // Highlights the nav tab for the section on screen. On phones the nav is a
  // bottom tab bar; the sliding indicator follows the active tab.
  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  var indicator = nav.querySelector('.nav-indicator');
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var sections = links.map(function (link) {
    return document.getElementById(link.getAttribute('href').slice(1));
  });
  var header = document.querySelector('.site-header');
  var active = -1;
  var lockUntil = 0;
  var ticking = false;

  function setActive(index) {
    if (index === active) return;
    active = index;
    links.forEach(function (link, i) {
      if (i === index) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (indicator) indicator.style.setProperty('--nav-index', index);
  }

  function sectionInView() {
    var doc = document.documentElement;
    if (window.innerHeight + window.pageYOffset >= doc.scrollHeight - 4) {
      return sections.length - 1;
    }
    var line = (header ? header.offsetHeight : 0) + window.innerHeight * 0.35;
    var index = 0;
    sections.forEach(function (section, i) {
      if (section && section.getBoundingClientRect().top <= line) index = i;
    });
    return index;
  }

  function update() {
    ticking = false;
    if (Date.now() < lockUntil) return;
    setActive(sectionInView());
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  window.addEventListener('resize', update);

  // Tapping a tab moves the highlight straight away, without flicking
  // through the sections passed on the way.
  links.forEach(function (link, i) {
    link.addEventListener('click', function () {
      setActive(i);
      lockUntil = Date.now() + 1200;
    });
  });

  if ('onscrollend' in window) {
    window.addEventListener('scrollend', function () {
      lockUntil = 0;
      update();
    });
  }

  update();
})();

(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    history.replaceState(null, '', '#' + id);
    // Wait a frame so an open detail panel can close and unlock scrolling.
    requestAnimationFrame(function () {
      var offset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();

(function () {
  'use strict';

  var EMAIL = '12250025.gcit@rub.edu.bt';
  var GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL);
  var links = document.querySelectorAll('a[href^="mailto:"]');

  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function () {
      var handled = false;

      var timer = setTimeout(function () {
        if (!handled && !document.hidden) {
          window.open(GMAIL, '_blank', 'noopener,noreferrer');
        }
      }, 1200);

      function cancel() {
        handled = true;
        clearTimeout(timer);
      }

      window.addEventListener('blur', cancel, { once: true });

      document.addEventListener('visibilitychange', function onVisible() {
        if (document.hidden) {
          cancel();
          document.removeEventListener('visibilitychange', onVisible);
        }
      });
    });
  });
})();

(function () {
  'use strict';

  var h1 = document.querySelector('.hero-title');
  if (!h1) return;

  var lineEls = [
    h1.querySelector('.title-line-1'),
    h1.querySelector('.title-line-2')
  ];
  if (!lineEls[0] || !lineEls[1]) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var PHRASES = [
    ['Find X \u2014 Find a greener', 'way forward.'],
    ['Find X \u2014 Where sustainable development', 'meets action.'],
    ['Find X \u2014 Helping businesses grow', 'responsibly.'],
    ['Find X \u2014 Smarter solutions.', 'Better use of resources.']
  ];

  var START_DELAY = 600;
  var TYPE_MS = 120;
  var ERASE_MS = 70;
  var HOLD_MS = 2500;
  var PAUSE_MS = 800;
  var PAUSED_CHECK_MS = 250;

  h1.setAttribute('aria-label', PHRASES[0][0] + ' ' + PHRASES[0][1]);

  var node1 = document.createTextNode('');
  var node2 = document.createTextNode('');
  lineEls[0].textContent = '';
  lineEls[1].textContent = '';
  lineEls[0].appendChild(node1);
  lineEls[1].appendChild(node2);

  var cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  var phraseIndex = 0;
  var count = 0;
  var typing = true;

  function current() {
    return PHRASES[phraseIndex];
  }

  function render() {
    var p = current();
    var len1 = p[0].length;

    node1.nodeValue = p[0].slice(0, Math.min(count, len1));
    node2.nodeValue = p[1].slice(0, Math.max(0, count - len1));

    var activeLine = count > len1 ? lineEls[1] : lineEls[0];
    activeLine.appendChild(cursor);
  }

  function panelIsOpen() {
    return document.documentElement.classList.contains('panel-open');
  }

  function step() {
    if (panelIsOpen()) {
      setTimeout(step, PAUSED_CHECK_MS);
      return;
    }

    var p = current();
    var delay;

    if (typing) {
      var fullLength = p[0].length + p[1].length;
      if (count < fullLength) {
        count++;
        delay = TYPE_MS;
      } else {
        typing = false;
        delay = HOLD_MS;
      }
    } else {
      if (count > 0) {
        count--;
        delay = ERASE_MS;
      } else {
        phraseIndex = (phraseIndex + 1) % PHRASES.length;
        typing = true;
        delay = PAUSE_MS;
      }
    }

    render();
    setTimeout(step, delay);
  }

  render();
  setTimeout(step, START_DELAY);
})();

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHAR_MS = 80;
  var CURSOR_HIDE = 1500;
  var root = document.documentElement;

  var cards = Array.prototype.slice.call(
    document.querySelectorAll('.approach-card, .vision-slide')
  ).filter(function (card) {
    return card.querySelector('.card-detail');
  });
  if (!cards.length) return;

  var typers = cards.map(function (card) {
    var detail = card.querySelector('.card-detail');
    var titleEl = card.querySelector('.card-title, .vision-kicker');
    var lead = detail && detail.querySelector('.detail-lead');
    var strong = lead && lead.querySelector('strong');
    if (!detail || !strong) return { start: function () {}, full: function () {} };

    if (!detail.querySelector('.panel-close')) {
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'panel-close';
      closeBtn.setAttribute('aria-label', 'Close');

      var closeImg = document.createElement('img');
      closeImg.src = 'assets/icons/close.svg';
      closeImg.alt = '';
      closeImg.width = 20;
      closeImg.height = 20;
      closeImg.setAttribute('decoding', 'async');
      closeImg.setAttribute('draggable', 'false');

      closeBtn.appendChild(closeImg);
      detail.insertBefore(closeBtn, detail.firstChild);

      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(cards.indexOf(card), false);
      });
    }

    if (titleEl && !detail.querySelector('.panel-label')) {
      var label = document.createElement('p');
      label.className = 'panel-label';
      label.textContent = titleEl.textContent;
      detail.insertBefore(label, detail.firstChild.nextSibling);
    }

    var fullText = strong.textContent;
    var textNode = document.createTextNode(fullText);
    strong.textContent = '';
    strong.appendChild(textNode);

    var cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.setAttribute('aria-hidden', 'true');

    var timer = null;

    function removeCursor() {
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
    }

    function showFull() {
      clearTimeout(timer);
      textNode.nodeValue = fullText;
      removeCursor();
    }

    function startTyping() {
      if (reduce) { showFull(); return; }
      clearTimeout(timer);
      textNode.nodeValue = '';
      lead.appendChild(cursor);

      var i = 0;
      (function tick() {
        i++;
        textNode.nodeValue = fullText.slice(0, i);
        if (i < fullText.length) {
          timer = setTimeout(tick, CHAR_MS);
        } else {
          timer = setTimeout(removeCursor, CURSOR_HIDE);
        }
      })();
    }

    return { start: startTyping, full: showFull };
  });

  function anyOpen() {
    return cards.some(function (card) { return card.classList.contains('is-open'); });
  }

  function setOpen(index, open) {
    var card = cards[index];
    card.classList.toggle('is-open', open);
    if (open) typers[index].start();
    else typers[index].full();
    root.classList.toggle('panel-open', anyOpen());
  }

  cards.forEach(function (card, index) {
    card.addEventListener('click', function () {
      setOpen(index, !card.classList.contains('is-open'));
    });

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(index, !card.classList.contains('is-open'));
      }
    });
  });

  document.addEventListener('click', function (e) {
    cards.forEach(function (card, index) {
      if (card.classList.contains('is-open') && !card.contains(e.target)) {
        setOpen(index, false);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    cards.forEach(function (card, index) {
      if (card.classList.contains('is-open')) setOpen(index, false);
    });
  });
})();

(function () {
  'use strict';

  var stage = document.getElementById('vision-stage');
  if (!stage) return;

  var slides = Array.prototype.slice.call(stage.querySelectorAll('.vision-slide'));
  if (!slides.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  var TITLE_CHAR_MS = 80;
  var TITLE_DELAY = 300;
  var SHOW_MS = 7000;
  var LEAVE_MS = 900;
  var PANEL_CHECK_MS = 400;

  var titleEls = slides.map(function (s) { return s.querySelector('.vision-title'); });
  var fullTexts = titleEls.map(function (el) { return el.textContent; });
  var textNodes = titleEls.map(function (el) {
    var node = document.createTextNode('');
    el.textContent = '';
    el.appendChild(node);
    return node;
  });

  var cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  var current = -1;
  var typeTimer = null;
  var started = false;

  function typeTitle(i) {
    clearTimeout(typeTimer);
    var full = fullTexts[i];
    var node = textNodes[i];

    if (reduce) {
      node.nodeValue = full;
      return;
    }

    node.nodeValue = '';
    titleEls[i].appendChild(cursor);

    var n = 0;
    (function tick() {
      n++;
      node.nodeValue = full.slice(0, n);
      if (n < full.length) {
        typeTimer = setTimeout(tick, TITLE_CHAR_MS);
      } else {
        typeTimer = setTimeout(function () {
          if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        }, 1200);
      }
    })();
  }

  function show(i) {
    if (current >= 0) {
      var prev = slides[current];
      prev.classList.remove('is-active', 'is-live');
      prev.classList.add('is-leaving');
      setTimeout(function () { prev.classList.remove('is-leaving'); }, LEAVE_MS);
    }

    current = i;
    var s = slides[i];
    s.classList.add('is-active', 'is-live');

    setTimeout(function () {
      if (current === i) typeTitle(i);
    }, TITLE_DELAY);
  }

  function next() {
    if (root.classList.contains('panel-open')) {
      setTimeout(next, PANEL_CHECK_MS);
      return;
    }
    show((current + 1) % slides.length);
    setTimeout(next, SHOW_MS);
  }

  function start() {
    if (started) return;
    started = true;

    show(0);
    if (!reduce) setTimeout(next, SHOW_MS);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, observer) {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        start();
      }
    }, { threshold: 0.3 });
    io.observe(stage);
  } else {
    start();
  }
})();