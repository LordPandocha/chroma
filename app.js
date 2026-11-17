const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const formats = [
  {
    title: 'Лендинг', note: 'от 5 000 ₽', icon: 'panels', image: 'assets/landing.jpg',
    scopes: [
      { title: 'Одна услуга', note: 'Описание, преимущества и контакты', price: 5000 },
      { title: 'Расширенный лендинг', note: 'Кейсы, отзывы и дополнительные блоки', price: 10000 },
    ],
  },
  {
    title: 'Сайт компании', note: 'от 10 000 ₽', icon: 'building', image: 'assets/company.jpg',
    scopes: [
      { title: 'Основные страницы', note: 'Главная, услуги и контакты', price: 10000 },
      { title: 'Сайт с разделами', note: 'Отдельные страницы услуг и кейсов', price: 15000 },
    ],
  },
  {
    title: 'Интернет-магазин', note: 'от 15 000 ₽', icon: 'bag', image: 'assets/shop.jpg',
    scopes: [
      { title: 'Каталог товаров', note: 'Карточки и заказ через мессенджер', price: 15000 },
      { title: 'Магазин с корзиной', note: 'Корзина и оформление заказа', price: 20000 },
    ],
  },
];

const deadlines = [
  { title: 'Как можно скорее', icon: 'bolt' },
  { title: 'В течение месяца', icon: 'calendar' },
  { title: 'Срок пока открыт', icon: 'clock' },
];

const headings = ['Какой сайт нужен?', 'Что должно быть на сайте?', 'Когда нужен запуск?'];
const answers = [null, null, null];
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
  const total = number.format(scope.price) + ' ₽';
  const lines = [['Формат', format.title], ['Состав', scope.title], ['Срок', deadlines[answers[2]].title]];
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
  count.textContent = done ? 'Результат' : 'Шаг ' + (step + 1) + ' из 3';
  pips.forEach((pip, index) => {
    pip.classList.toggle('done', index < step);
    pip.classList.toggle('current', index === step);
  });

  if (done) {
    showResult();
  } else {
    title.textContent = headings[step];
    const options = [formats, formats[answers[0]]?.scopes, deadlines][step];
    choices.replaceChildren(...options.map(makeChoice));
    next.replaceChildren(step === 2 ? 'Узнать цену' : 'Далее', icon('arrow-right'));
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

// The hero's light follows a slow orbit at rest and moves toward the pointer or a tap.
for (const surface of document.querySelectorAll('[data-light]')) {
  const canvas = surface.querySelector('canvas');
  const context = canvas?.getContext('2d');
  const hero = Boolean(context);
  let width = 0;
  let height = 0;
  let density = 1;
  let visible = true;
  let frame = 0;
  let point = null;
  let tapUntil = 0;
  let x = .68;
  let y = .48;
  let intensity = .28;

  function draw(time) {
    const phase = time * .00041;
    const centerX = width * (.66 + (x - .68) * .34);
    const centerY = height * (.46 + (y - .48) * .29);
    const radiusX = width * (width < 640 ? .52 : .38);
    const radiusY = height * (width < 640 ? .22 : .30);

    context.setTransform(density, 0, 0, density, 0, 0);
    context.clearRect(0, 0, width, height);
    for (let orbit = 0; orbit < 3; orbit++) {
      const scale = 1 - orbit * .106;
      const tilt = -.29 + orbit * .22;
      context.beginPath();
      context.ellipse(centerX, centerY, radiusX * scale, radiusY * scale, tilt, 0, Math.PI * 2);
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(255,255,255,' + (.09 - orbit * .017 + intensity * .09) + ')';
      context.stroke();

      const angle = phase * (1 + orbit * .17) + orbit * 2.1;
      const glintX = Math.cos(angle) * radiusX * scale;
      const glintY = Math.sin(angle) * radiusY * scale;
      const px = centerX + glintX * Math.cos(tilt) - glintY * Math.sin(tilt);
      const py = centerY + glintX * Math.sin(tilt) + glintY * Math.cos(tilt);
      const glow = context.createRadialGradient(px, py, 0, px, py, 28);
      glow.addColorStop(0, '#ffffffa0');
      glow.addColorStop(1, '#ffffff00');
      context.fillStyle = glow;
      context.fillRect(px - 28, py - 28, 56, 56);
      context.fillStyle = '#fff';
      context.beginPath();
      context.arc(px, py, 1.65, 0, Math.PI * 2);
      context.fill();
    }
  }

  function start() {
    if (!frame && visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate);
  }

  function animate(time) {
    frame = 0;
    if (!visible || document.hidden || reducedMotion.matches) return;
    if (tapUntil && time > tapUntil) {
      point = null;
      tapUntil = 0;
    }
    const idleX = hero ? .68 + Math.sin(time * .00078) * .19 : .68;
    const idleY = hero ? .47 + Math.cos(time * .00065) * .14 : .48;
    const targetX = point?.x ?? idleX;
    const targetY = point?.y ?? idleY;
    const targetPower = point ? .81 : .28;
    x += (targetX - x) * .12;
    y += (targetY - y) * .12;
    intensity += (targetPower - intensity) * .12;
    surface.style.setProperty('--mx', (x * 100) + '%');
    surface.style.setProperty('--my', (y * 100) + '%');
    if (hero) {
      surface.style.setProperty('--tx', ((x - .68) * 42) + 'px');
      surface.style.setProperty('--ty', ((y - .48) * 28) + 'px');
      surface.style.setProperty('--light', intensity);
      draw(time);
    }
    const settling = Math.abs(targetX - x) + Math.abs(targetY - y) > .001;
    if (hero || settling || tapUntil) start();
  }

  function reposition(event) {
    const bounds = surface.getBoundingClientRect();
    point = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    start();
  }

  surface.addEventListener('pointermove', event => {
    if (!reducedMotion.matches && event.pointerType !== 'touch') {
      tapUntil = 0;
      reposition(event);
    }
  });
  surface.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') {
      point = null;
      tapUntil = 0;
      start();
    }
  });
  surface.addEventListener('pointerdown', event => {
    if (!reducedMotion.matches && event.pointerType === 'touch') {
      tapUntil = performance.now() + 1250;
      reposition(event);
    }
  }, { passive: true });

  if (hero) {
    const resize = new ResizeObserver(() => {
      const bounds = surface.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      density = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      start();
    });
    resize.observe(surface);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    intersection.observe(surface);
    document.addEventListener('visibilitychange', start);
  }

  reducedMotion.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    point = null;
    tapUntil = 0;
    x = .68;
    y = .48;
    intensity = .28;
    for (const property of ['--mx', '--my', '--tx', '--ty', '--light']) surface.style.removeProperty(property);
    start();
  });
}
