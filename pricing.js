'use strict';

// One price source for cards, the estimate, and the Telegram draft.
const ChromaPricing = (() => {
  const formats = [
    { title: 'Лендинг', note: 'Одна страница для услуги или продукта', image: 'landing', scopes: [
      { title: 'Одна услуга', note: 'До 5 блоков: предложение, преимущества и контакты', price: 5900, image: 'landing', features: ['Одна страница', 'До 5 блоков', 'Кнопка заявки'] },
      { title: 'Расширенный лендинг', note: 'До 10 блоков: добавим кейсы, отзывы и ответы на вопросы', price: 9900, image: 'landing', features: ['До 10 блоков', 'Кейсы и отзывы', 'Вопросы и ответы'] },
    ] },
    { title: 'Сайт компании', note: 'Несколько страниц об услугах и команде', image: 'company', scopes: [
      { title: 'Основные страницы', note: 'До 3 страниц: главная, услуги и контакты', price: 11900, image: 'company', features: ['Главная', 'Услуги', 'Контакты'] },
      { title: 'Сайт с разделами', note: 'До 7 страниц с отдельными услугами и портфолио', price: 15900, image: 'company', features: ['До 7 страниц', 'Разделы услуг', 'Портфолио'] },
    ] },
    { title: 'Интернет-магазин', note: 'Товары, карточки и оформление заказов', image: 'shop', scopes: [
      { title: 'Каталог товаров', note: 'До 30 товаров и заказ через мессенджер', price: 17900, image: 'shop', features: ['До 30 товаров', 'Карточки', 'Заказ в мессенджер'] },
      { title: 'Магазин с корзиной', note: 'До 60 товаров, фильтры, корзина и оформление заказа', price: 21900, image: 'shop', features: ['До 60 товаров', 'Фильтры', 'Корзина и заказ'] },
    ] },
  ];
  const contents = [
    { title: 'Материалы готовы', note: 'Вы передаёте тексты и фото — мы размещаем их на сайте', fee: 0, image: 'ready', features: ['Ваши тексты', 'Ваши фотографии'] },
    { title: 'Нужна помощь с материалами', note: 'Подготовим тексты и подберём или сгенерируем изображения', fee: 1500, image: 'creation', features: ['Тексты для страниц', 'Подбор и генерация фото'] },
    { title: 'Пока не знаю', note: 'Разберём ваши материалы и составим план: что написать и какие фото нужны', fee: 500, image: 'plan', features: ['Разбор материалов', 'План текстов и фото'] },
  ];
  const deadlines = [
    { title: 'В ближайшие 7 дней', note: 'Приоритетная работа. Возможность срока подтвердим до старта.', fee: 1600, icon: 'bolt', days: '7', caption: 'дней' },
    { title: 'В течение двух недель', note: 'Ускоренный запуск с выделенным временем в графике.', fee: 700, icon: 'calendar', days: '14', caption: 'дней' },
    { title: 'Через месяц или позже', note: 'Плановый запуск без доплаты за срочность.', fee: 0, icon: 'clock', days: '30+', caption: 'дней' },
  ];
  function calculate(answers) {
    if (!Array.isArray(answers) || answers.length !== 4 || !answers.every(Number.isInteger)) return null;
    const format = formats[answers[0]];
    const scope = format?.scopes[answers[1]];
    const materials = contents[answers[2]];
    const deadline = deadlines[answers[3]];
    if (!scope || !materials || !deadline) return null;
    return { format, scope, materials, deadline, total: scope.price + materials.fee + deadline.fee };
  }
  return { formats, contents, deadlines, calculate };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ChromaPricing;
