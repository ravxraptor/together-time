/* Separate language preferences and child-friendly spoken navigation. */
let listenMode = false;
/** Get the current view's saved language, defaulting to English. */
function currentLanguage() { return state.languages?.[state.view] || 'en'; }
/** Translate known interface text; user-provided content is preserved. */
function translate(text) {
  if (currentLanguage() === 'en') return text;
  const chinese = value => currentLanguage() === 'zh-CN' ? simplifyChinese(value) : value;
  if (ZH[text]) return chinese(ZH[text]);
  const greeting = text.match(/^Hi, (.+)!$/);
  if (greeting) return `你好，${greeting[1]}！`;
  const match = text.match(/^(\s*(?:[🎂🎨👨‍👩‍👧🐾🌈⭐🌍⏱️🧺✨♡◷✿]+\s*)?)(.*?)(\s*)$/u);
  return match && ZH[match[2]] ? match[1] + chinese(ZH[match[2]]) + match[3] : text;
}
/** Pick English or Chinese wording for built sentences; Mandarin gets simplified characters. */
function localText(en, zh, lang = currentLanguage()) {
  if (lang === 'en') return en;
  return lang === 'zh-CN' ? simplifyChinese(zh) : zh;
}
/** Translate text in a rendered interface without touching form values. */
function localizeUI(root) {
  if (!root || !document.createTreeWalker || currentLanguage() === 'en') return;
  const walker = document.createTreeWalker(root, 4);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest('textarea, script, style, [data-no-translate]')) continue;
    node.nodeValue = translate(node.nodeValue);
  }
  root.querySelectorAll('[placeholder]').forEach(element => {
    if (ZH[element.placeholder]) element.placeholder = translate(element.placeholder);
  });
}
/** Render a language selector for either the parent or child view. */
function languageControl() {
  const lang = currentLanguage();
  return `<label class="language-control"><span>🌐</span><span class="sr-only">Choose a language</span><select id="language-choice" aria-label="Choose a language"><option value="en" ${lang === 'en' ? 'selected' : ''}>English</option><option value="zh" ${lang === 'zh' ? 'selected' : ''}>繁體中文（廣東話）</option><option value="zh-CN" ${lang === 'zh-CN' ? 'selected' : ''}>简体中文（普通话）</option></select></label>`;
}
/** Render listening controls in the child's space. */
function listenControls() {
  const lang = currentLanguage();
  const page = lang === 'zh-CN' ? '听这页' : lang === 'zh' ? '聽這頁' : 'Listen to this page';
  const mode = lang === 'zh-CN' ? (listenMode ? '点选朗读：开' : '点选朗读：关') : lang === 'zh' ? (listenMode ? '點選朗讀：開' : '點選朗讀：關') : (listenMode ? 'Tap to listen: on' : 'Tap to listen: off');
  return `<div class="listen-tools"><button data-action="read-page">🔊 ${page}</button><button data-action="listen-mode" aria-pressed="${listenMode}">👆🔊 ${mode}</button><button data-action="stop-reading">■ ${lang === 'en' ? 'Stop' : '停止'}</button></div>`;
}
/** Read text using the device's available English or Cantonese speech voice. */
function speakText(text) {
  if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') { toast(currentLanguage() !== 'en' ? '此裝置不支援朗讀。' : 'Read-aloud is not available on this device.'); return; }
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = currentLanguage() === 'zh-CN' ? 'zh-CN' : currentLanguage() === 'zh' ? 'zh-HK' : 'en-HK';
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(item => item.lang.toLowerCase() === utterance.lang.toLowerCase());
  if (voice) utterance.voice = voice;
  utterance.rate = .85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
/** Change language without changing the other family member's preference. */
document.addEventListener('change', event => {
  if (event.target.id !== 'language-choice') return;
  const survey = document.querySelector('#survey-form');
  const draft = survey ? new FormData(survey) : null;
  state.languages = {...state.languages, [state.view]: ['zh','zh-CN'].includes(event.target.value) ? event.target.value : 'en'};
  saveState(); render();
  if (draft) {
    const refreshed = document.querySelector('#survey-form');
    refreshed?.querySelectorAll('input, select, textarea').forEach(field => {
      if (!field.name) return;
      if (field.type === 'checkbox' || field.type === 'radio') field.checked = draft.getAll(field.name).includes(field.value);
      else if (draft.has(field.name)) field.value = draft.get(field.name);
    });
    const animal = draft.get('animal');
    const result = refreshed?.querySelector('.animal-result');
    if (result && animal) result.textContent = `⭐ ${translate('Your favourite so far')}: ${translate(animal)}`;
  }
});
/** In listening mode, tapping a visible part reads it instead of activating it. */
document.addEventListener('click', event => {
  if (!listenMode || state.view !== 'child') return;
  if (event.target.closest('[data-action="listen-mode"], [data-action="stop-reading"], [data-action="read-page"], #language-choice')) return;
  const part = event.target.closest('button, label, h1, h2, h3, p, .calendar-event, .notice, .tag');
  if (!part) return;
  event.preventDefault(); event.stopImmediatePropagation();
  speakText(part.innerText || part.textContent);
}, true);
