// Shared English/Arabic switch for every page.
//
// English text is whatever is written in the HTML: edit it there.
// Arabic text lives in the AR list at the bottom of each page, matched by name:
//   <p data-i18n="tagline">English…</p>      ->  AR.tagline
//   data-i18n-title / data-i18n-aria-label / data-i18n-content  translate those attributes.
// If an Arabic entry is missing, the English text is shown instead.
(function () {
  var root = document.documentElement;

  // Pick the language before the page draws, so the layout never flips after loading.
  // Order: ?lang=ar / ?lang=en in the address, then the visitor's last choice.
  var start = new URLSearchParams(location.search).get('lang');
  if (start !== 'ar' && start !== 'en') {
    try { start = localStorage.getItem('lang'); } catch (e) {}
  }
  if (start !== 'ar') start = 'en';
  root.lang = start;
  root.dir = start === 'ar' ? 'rtl' : 'ltr';

  var SWITCH = {
    en: { text: 'العربية', label: 'اقرأ الصفحة بالعربية', lang: 'ar' },
    ar: { text: 'English', label: 'Read this page in English', lang: 'en' }
  };
  var ATTRS = ['title', 'aria-label', 'content'];

  document.addEventListener('DOMContentLoaded', function () {
    var AR = window.AR || {};
    var EN = {};
    var items = [];

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      EN[key] = el.innerHTML;
      items.push({ el: el, key: key });
    });
    ATTRS.forEach(function (attr) {
      document.querySelectorAll('[data-i18n-' + attr + ']').forEach(function (el) {
        var key = el.getAttribute('data-i18n-' + attr);
        EN[key] = el.getAttribute(attr);
        items.push({ el: el, key: key, attr: attr });
      });
    });

    var btn = document.getElementById('lang-switch');

    function setLanguage(lang, remember) {
      var t = lang === 'ar' ? AR : EN;
      root.lang = lang;
      root.dir = lang === 'ar' ? 'rtl' : 'ltr';
      items.forEach(function (item) {
        var value = t[item.key] != null ? t[item.key] : EN[item.key];
        if (item.attr) item.el.setAttribute(item.attr, value);
        else item.el.innerHTML = value;
      });
      if (btn) {
        btn.textContent = SWITCH[lang].text;
        btn.lang = SWITCH[lang].lang;
        btn.setAttribute('aria-label', SWITCH[lang].label);
      }
      if (remember) {
        try { localStorage.setItem('lang', lang); } catch (e) {}
      }
    }

    setLanguage(start, false);
    if (btn) {
      btn.addEventListener('click', function () {
        setLanguage(root.lang === 'ar' ? 'en' : 'ar', true);
      });
    }
  });
})();
