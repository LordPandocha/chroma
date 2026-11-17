const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const formats = [
  {
    title: 'Лендинг', note: 'Одна страница для одной услуги или продукта', icon: 'panels', image: 'assets/quiz-landing-v4.jpg',
    scopes: [
      { title: 'Одна услуга', note: 'Описание, преимущества и контакты', price: 5900 },
      { title: 'Расширенный лендинг', note: 'Кейсы, отзывы и дополнительные блоки', price: 8900 },
    ],
  },
  {
    title: 'Сайт компании', note: 'Несколько страниц об услугах и компании', icon: 'building', image: 'assets/quiz-company-v4.jpg',
    scopes: [
      { title: 'Основные страницы', note: 'Главная, услуги и контакты', price: 10900 },
      { title: 'Сайт с разделами', note: 'Отдельные страницы услуг и кейсов', price: 14600 },
    ],
  },
  {
    title: 'Интернет-магазин', note: 'Каталог, карточки товаров и заказы', icon: 'bag', image: 'assets/quiz-shop-v4.jpg',
    scopes: [
      { title: 'Каталог товаров', note: 'Карточки и заказ через мессенджер', price: 16300 },
      { title: 'Магазин с корзиной', note: 'Корзина и оформление заказа', price: 21900 },
    ],
  },
];

const deadlines = [
  { title: 'В ближайшие 7 дней', icon: 'bolt', multiplier: 1.25 },
  { title: 'В течение двух недель', icon: 'calendar', multiplier: 1.12 },
  { title: 'Через месяц или позже', icon: 'clock', multiplier: 1 },
];

const headings = ['Какой сайт нужен?', 'Что должно быть на сайте?', 'Есть ли тексты и фотографии?', 'Когда нужен запуск?'];
const answers = Array(headings.length).fill(null);
let step = 0;

const panel = document.querySelector('#quiz-panel');
const title = document.querySelector('#step-title');
const choices = document.querySelector('#quiz-choices');
const count = document.querySelector('#step-count');
const pips = [...document.querySelectorAll('.progress-pips i')];
const actions = document.querySelector('#quiz-actions');
const next = document.querySelector('#quiz-next');
const back = document.querySelector('#quiz-back');
const result = document.querySelector('#quiz-result');
const price = document.querySelector('#result-price');
const summary = document.querySelector('#result-summary');
const contact = document.querySelector('#result-contact');
const number = new Intl.NumberFormat('ru-RU');
const formatPrice = value => number.format(value) + ' ₽';
const contents = [
  { title: 'Материалы готовы', note: 'У меня уже есть тексты и фото', fee: 0 },
  { title: 'Нужна помощь с материалами', note: 'Помогите подготовить тексты и подобрать изображения', fee: 1900 },
  { title: 'Пока не знаю', note: 'Обсудим, что нужно подготовить', fee: 0 },
];

title.tabIndex = -1;

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', '#' + name);
  svg.append(use);
  return svg;
}

function makeChoice(option, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'choice';
  button.setAttribute('aria-pressed', String(answers[step] === index));
  if (option.image) {
    const image = document.createElement('img');
    image.src = option.image;
    image.alt = '';
    button.classList.add('has-image');
    button.append(image);
  }
  const badge = document.createElement('span');
  badge.className = 'choice-icon';
  badge.append(icon(option.icon || (index === 0 ? 'panels' : 'layers')));
  const check = document.createElement('span');
  check.className = 'choice-check';
  check.append(icon('check'));
  const caption = document.createElement('span');
  caption.className = 'choice-caption';
  const label = document.createElement('strong');
  label.textContent = option.title;
  caption.append(label);
  if (option.note) {
    const note = document.createElement('small');
    note.textContent = option.note;
    caption.append(note);
  }
  button.append(badge, check, caption);
  button.addEventListener('click', () => {
    if (step === 0 && answers[0] !== index) answers[1] = null;
    answers[step] = index;
    for (const choice of choices.children) choice.setAttribute('aria-pressed', String(choice === button));
    next.disabled = false;
  });
  return button;
}

function showResult() {
  const format = formats[answers[0]];
  const scope = format.scopes[answers[1]];
  const materials = contents[answers[2]];
  const deadline = deadlines[answers[3]];
  const total = formatPrice(Math.round((scope.price + materials.fee) * deadline.multiplier / 100) * 100);
  const lines = [['Формат', format.title], ['Состав', scope.title], ['Материалы', materials.title], ['Срок', deadline.title]];
  price.textContent = total;
  summary.replaceChildren(...lines.map(([key, value]) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = key;
    dd.textContent = value;
    row.append(dt, dd);
    return row;
  }));
  const draft = ['Привет! Хочу обсудить сайт CHROMA', ...lines.map(([key, value]) => key + ': ' + value), 'Ориентир: ' + total].join('\n');
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
  count.textContent = done ? 'Результат' : 'Шаг ' + (step + 1) + ' из ' + headings.length;
  pips.forEach((pip, index) => {
    pip.classList.toggle('done', index < step);
    pip.classList.toggle('current', index === step);
  });

  if (done) {
    showResult();
  } else {
    title.textContent = headings[step];
    const options = [formats, formats[answers[0]]?.scopes, contents, deadlines][step];
    choices.replaceChildren(...options.map(makeChoice));
    next.replaceChildren(step === headings.length - 1 ? 'Узнать цену' : 'Далее', icon('arrow-right'));
    next.disabled = answers[step] === null;
  }

  const visiblePanel = done ? result : panel;
  if (focus) {
    visiblePanel.classList.remove('quiz-enter');
    void visiblePanel.offsetWidth;
    visiblePanel.classList.add('quiz-enter');
    (done ? price : title).focus();
  }
}

next.addEventListener('click', () => {
  if (step < headings.length && answers[step] !== null) {
    step++;
    renderQuiz();
  }
});
back.addEventListener('click', () => {
  if (step > 0) {
    step--;
    renderQuiz();
  }
});
actions.hidden = false;
renderQuiz(false);

const themeToggle = document.querySelector('#theme-toggle');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;
const currentTheme = () => root.dataset.theme || (systemTheme.matches ? 'dark' : 'light');

function syncTheme() {
  const dark = currentTheme() === 'dark';
  themeToggle.firstElementChild.textContent = dark ? '☀' : '☾';
  themeToggle.lastElementChild.textContent = dark ? 'Светлая тема' : 'Тёмная тема';
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.content = dark ? '#080808' : '#f2eaff';
  }
}

themeToggle.addEventListener('click', () => {
  root.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('chroma-theme', root.dataset.theme); } catch {}
  syncTheme();
});
systemTheme.addEventListener('change', syncTheme);
syncTheme();
themeToggle.hidden = false;

let flight;
document.querySelector('.header').addEventListener('click', event => {
  const link = event.target.closest('.nav a');
  if (!link || reducedMotion.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  flight?.cancel();
  const bounds = link.getBoundingClientRect();
  const plane = icon('send');
  plane.classList.add('nav-plane');
  plane.style.left = bounds.left + bounds.width / 2 + 'px';
  plane.style.top = bounds.bottom + 'px';
  document.body.append(plane);
  const drift = Math.min(115, (innerWidth - bounds.right) / 2);
  flight = plane.animate([
    { transform: 'translate(-50%, 0) rotate(35deg) scale(.65)', opacity: 0 },
    { transform: 'translate(' + drift + 'px, 65px) rotate(75deg) scale(1.2)', opacity: 1, offset: .35 },
    { transform: 'translate(15px, 175px) rotate(125deg) scale(.75)', opacity: 0 },
  ], { duration: 650, easing: 'cubic-bezier(.24,.65,.25,1)' });
  flight.finished.then(() => plane.remove(), () => plane.remove());
});

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) flight?.cancel();
});

// Flight path and plane geometry adapted from LordPandocha's route transition.
const intro = document.querySelector('.intro');
if (!reducedMotion.matches && !navigator.connection?.saveData) {
  const trail = intro.querySelector('.intro-trail');
  const aircraft = intro.querySelector('.intro-aircraft');
  intro.classList.add('is-playing');
  const length = trail.getTotalLength();
  trail.style.strokeDasharray = String(length);
  trail.style.strokeDashoffset = String(length);
  const start = performance.now();

  function animateIntro(now) {
    if (reducedMotion.matches || document.hidden) {
      intro.classList.remove('is-playing');
      return;
    }
    const progress = Math.min((now - start) / 1050, 1);
    const distance = length * progress * progress * (3 - 2 * progress);
    const point = trail.getPointAtLength(distance);
    const before = trail.getPointAtLength(Math.max(0, distance - 3));
    const after = trail.getPointAtLength(Math.min(length, distance + 3));
    const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    aircraft.setAttribute('transform', 'translate(' + point.x + ' ' + point.y + ') rotate(' + angle + ') scale(.85)');
    aircraft.setAttribute('opacity', '1');
    trail.style.strokeDashoffset = String(length - distance);
    if (progress < 1) requestAnimationFrame(animateIntro);
  }

  intro.addEventListener('animationend', () => intro.classList.remove('is-playing'), { once: true });
  requestAnimationFrame(animateIntro);
}

const dotsCanvas = document.querySelector('.ambient-dots');
const dotsContext = dotsCanvas.getContext('2d');

if (dotsContext) {
  let particles = [];
  let pointer = null;
  let frame = 0;
  let density = 1;
  let color = '';
  const finePointer = matchMedia('(pointer: fine)');

  function drawDots(now) {
    frame = 0;
    dotsContext.clearRect(0, 0, dotsCanvas.width / density, dotsCanvas.height / density);
    dotsContext.fillStyle = color;
    const active = finePointer.matches && !reducedMotion.matches ? pointer : null;

    for (const dot of particles) {
      const dx = active ? dot.x - active.x : 0;
      const dy = active ? dot.y - active.y : 0;
      const distance = Math.hypot(dx, dy);
      const influence = active ? Math.max(0, 1 - distance / 135) : 0;
      if (reducedMotion.matches) {
        dot.offsetX = 0;
        dot.offsetY = 0;
      } else {
        dot.offsetX += (dx * influence * .32 - dot.offsetX) * .12;
        dot.offsetY += (dy * influence * .32 - dot.offsetY) * .12;
      }
      const drift = reducedMotion.matches ? 0 : Math.sin(now * .00065 + dot.phase) * 4;
      dotsContext.globalAlpha = dot.opacity + influence * .20;
      dotsContext.beginPath();
      dotsContext.arc(dot.x + dot.offsetX + drift, dot.y + dot.offsetY, dot.radius, 0, Math.PI * 2);
      dotsContext.fill();
    }

    if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(drawDots);
  }

  function refreshDots() {
    cancelAnimationFrame(frame);
    color = getComputedStyle(dotsCanvas).color;
    const { clientWidth: width, clientHeight: height } = dotsCanvas;
    density = Math.min(devicePixelRatio || 1, 1.5);
    dotsCanvas.width = Math.round(width * density);
    dotsCanvas.height = Math.round(height * density);
    dotsContext.setTransform(density, 0, 0, density, 0, 0);
    const count = Math.min(115, Math.max(30, Math.round(width * height / 13000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: .6 + Math.random() * 1.1,
      opacity: .13 + Math.random() * .27,
      phase: Math.random() * Math.PI * 2,
      offsetX: 0,
      offsetY: 0,
    }));
    drawDots(performance.now());
  }

  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse') pointer = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer = null; });
  window.addEventListener('resize', refreshDots, { passive: true });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) drawDots(performance.now());
  });
  themeToggle.addEventListener('click', refreshDots);
  systemTheme.addEventListener('change', refreshDots);
  reducedMotion.addEventListener('change', refreshDots);
  refreshDots();
}
