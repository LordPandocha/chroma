'use strict';
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const number = new Intl.NumberFormat('ru-RU');
const money = value => number.format(value) + ' ₽';
const currentTheme = () => root.dataset.theme || (systemTheme.matches ? 'dark' : 'light');

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', '#' + name);
  svg.append(use);
  return svg;
}

function syncImages() {
  document.querySelectorAll('picture[data-art]').forEach(picture => {
    const base = 'assets/' + picture.dataset.art + '-' + currentTheme();
    const source = picture.querySelector('source');
    if (source) source.srcset = base + '-480.webp';
    picture.querySelector('img').src = base + '.webp';
  });
}

// Theme works independently of the quiz and decorative effects.
(() => {
  const toggle = document.querySelector('#theme-toggle');
  let explicit = root.dataset.theme === 'dark' || root.dataset.theme === 'light';
  function syncTheme() {
    const theme = explicit ? root.dataset.theme : (systemTheme.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    toggle.firstElementChild.textContent = dark ? '☀' : '☾';
    toggle.lastElementChild.textContent = dark ? 'Светлая тема' : 'Тёмная тема';
    toggle.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    document.querySelector('meta[name="theme-color"]').content = dark ? '#080808' : '#f7f8fa';
    syncImages();
  }
  toggle.addEventListener('click', () => {
    explicit = true;
    root.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('chroma-theme', root.dataset.theme); } catch {}
    syncTheme();
  });
  systemTheme.addEventListener('change', () => { if (!explicit) syncTheme(); });
  window.addEventListener('storage', event => {
    if (event.key !== 'chroma-theme' && event.key !== null) return;
    explicit = event.newValue === 'dark' || event.newValue === 'light';
    if (explicit) root.dataset.theme = event.newValue;
    syncTheme();
  });
  syncTheme();
  toggle.hidden = false;
})();

(() => {
  const { formats, contents, deadlines, calculate } = ChromaPricing;
  const headings = ['Какой сайт нужен?', 'Что должно быть на сайте?', 'Есть ли тексты и фотографии?', 'Когда нужен запуск?'];
  const answers = Array(4).fill(null);
  const panel = document.querySelector('#quiz-panel');
  const title = document.querySelector('#step-title');
  const choices = document.querySelector('#quiz-choices');
  const count = document.querySelector('#step-count');
  const pips = [...document.querySelectorAll('.progress-pips i')];
  const next = document.querySelector('#quiz-next');
  const back = document.querySelector('#quiz-back');
  const result = document.querySelector('#quiz-result');
  const price = document.querySelector('#result-price');
  const summary = document.querySelector('#result-summary');
  const contact = document.querySelector('#result-contact');
  const estimate = document.querySelector('#live-estimate');
  let step = 0;
  let entrance;
  title.tabIndex = -1;

  function makeChoice(option, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    button.setAttribute('aria-pressed', String(answers[step] === index));
    if (option.image) {
      const picture = document.createElement('picture');
      picture.dataset.art = option.image;
      const source = document.createElement('source');
      source.media = '(max-width: 640px)';
      const image = document.createElement('img');
      image.alt = '';
      image.width = 768;
      image.height = 512;
      image.decoding = 'async';
      picture.append(source, image);
      button.classList.add('has-image');
      button.append(picture);
    } else {
      const visual = document.createElement('span');
      visual.className = 'deadline-visual';
      visual.setAttribute('aria-hidden', 'true');
      const days = document.createElement('b');
      days.textContent = option.days;
      const caption = document.createElement('small');
      caption.textContent = option.caption;
      visual.append(icon(option.icon), days, caption);
      button.append(visual);
    }
    const check = document.createElement('span');
    check.className = 'choice-check';
    check.append(icon('check'));
    const caption = document.createElement('span');
    caption.className = 'choice-caption';
    const label = document.createElement('strong');
    label.textContent = option.title;
    const note = document.createElement('small');
    note.textContent = option.note;
    caption.append(label, note);
    if (option.features) {
      const features = document.createElement('span');
      features.className = 'choice-features';
      option.features.forEach(text => {
        const item = document.createElement('span');
        item.textContent = text;
        features.append(item);
      });
      caption.append(features);
    }
    button.append(check, caption);
    button.addEventListener('click', () => {
      if (step === 0 && answers[0] !== index) answers[1] = null;
      answers[step] = index;
      for (const choice of choices.children) choice.setAttribute('aria-pressed', String(choice === button));
      next.disabled = false;

    });
    return button;
  }

  function showResult() {
    const quote = calculate(answers);
    if (!quote) return;
    const { format, scope, materials, deadline, total } = quote;
    price.textContent = money(total);
    const lines = [
      ['Формат', format.title],
      ['Состав', scope.title + ' · ' + money(scope.price)],
      ['Материалы', materials.title + ' · ' + money(materials.fee)],
      ['Срок', deadline.title + ' · ' + money(deadline.fee)],
    ];
    summary.replaceChildren(...lines.map(([key, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = key;
      dd.textContent = value;
      row.append(dt, dd);
      return row;
    }));
    const draft = ['Привет! Хочу обсудить сайт CHROMA.', ...lines.map(([key, value]) => key + ': ' + value), 'Ориентировочная стоимость: ' + money(total), 'Давайте уточним задачи и сроки.'].join('\n');
    const url = new URL('https://t.me/LordPandocha');
    url.searchParams.set('text', draft);
    contact.href = url.href;
  }

  function renderQuiz(focus = true) {
    const done = step === headings.length;
    panel.hidden = done;
    result.hidden = !done;
    next.hidden = done;
    back.hidden = step === 0;
    document.querySelector('#quiz-restart').hidden = !done;
    document.querySelector('#quiz-help').hidden = done;
    count.textContent = done ? 'Ваш расчёт' : 'Шаг ' + (step + 1) + ' из 4';
    pips.forEach((pip, index) => {
      pip.classList.toggle('done', index < step);
      pip.classList.toggle('current', index === step);
    });
    if (done) showResult();
    else {
      title.textContent = headings[step];
      const options = [formats, formats[answers[0]]?.scopes, contents, deadlines][step];
      choices.replaceChildren(...options.map(makeChoice));
      syncImages();
      next.replaceChildren(step === 3 ? 'Узнать цену' : 'Далее', icon('arrow-right'));
      next.disabled = answers[step] === null;
    }

    entrance?.cancel();
    if (focus) {
      const visiblePanel = done ? result : panel;
      if (!reducedMotion.matches && !root.classList.contains('motion-stopped') && visiblePanel.animate) {
        entrance = visiblePanel.animate([{ opacity: .3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)' });
      }
      (done ? price : title).focus({ preventScroll: true });
      const quiz = document.querySelector('#quiz');
      if (quiz.getBoundingClientRect().top < -100) quiz.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
  }
  next.addEventListener('click', () => { if (step < 4 && answers[step] !== null) { step++; renderQuiz(); } });
  back.addEventListener('click', () => { if (step > 0) { step--; renderQuiz(); } });
  document.querySelector('#quiz-restart').addEventListener('click', () => { answers.fill(null); step = 0; renderQuiz(); });
  document.querySelector('#quiz-actions').hidden = false;
  renderQuiz(false);
})();

// Small compositor-driven layers: no continuous full-screen canvas loop.
(() => {
  const sky = document.querySelector('.starfield');
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 58; i++) {
    const star = document.createElement('i');
    star.className = 'star' + (i % 8 === 0 ? ' star-bright' : '');
    star.style.left = ((i * 61.8 + 7) % 100) + '%';
    star.style.top = ((i * 37.3 + 11) % 100) + '%';
    star.style.setProperty('--size', (i % 8 === 0 ? 3.8 : 1.3 + i % 3 * .5) + 'px');
    star.style.animationDelay = -(i % 13) + 's';
    star.style.animationDuration = 7 + i % 9 + 's';
    fragment.append(star);
  }
  for (let i = 0; i < 4; i++) {
    const shooting = document.createElement('i');
    shooting.className = 'shooting-star';
    shooting.style.left = 12 + i * 23 + '%';
    shooting.style.top = 9 + i * 18 + '%';
    shooting.style.animationDelay = i * 3.1 + 's';
    fragment.append(shooting);
  }
  sky.append(fragment);
  function pauseMotion() { root.classList.toggle('motion-paused', document.hidden); }
  document.addEventListener('visibilitychange', pauseMotion);
  pauseMotion();
  document.querySelector('#motion-toggle').addEventListener('click', event => {
    const paused = root.classList.toggle('motion-stopped');
    event.currentTarget.setAttribute('aria-pressed', String(paused));
    event.currentTarget.textContent = paused ? 'Включить анимацию' : 'Остановить анимацию';
  });
})();

(() => {
  let flight;
  document.querySelector('.header').addEventListener('click', event => {
    const link = event.target.closest('.nav a');
    if (!link || reducedMotion.matches || root.classList.contains('motion-stopped') || event.detail === 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!Element.prototype.animate) return;
    flight?.cancel();
    const bounds = link.getBoundingClientRect();
    const plane = icon('send');
    plane.classList.add('nav-plane');
    plane.style.left = bounds.left + bounds.width / 2 + 'px';
    plane.style.top = bounds.bottom + 'px';
    document.body.append(plane);
    flight = plane.animate([
      { transform: 'translate(-50%,0) rotate(15deg)', opacity: 0 },
      { transform: 'translate(25px,45px) rotate(65deg)', opacity: 1, offset: .35 },
      { transform: 'translate(0,150px) rotate(110deg)', opacity: 0 },
    ], { duration: 650, easing: 'cubic-bezier(.23,1,.32,1)' });
    flight.finished.then(() => plane.remove(), () => plane.remove());
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) flight?.cancel(); });
})();
