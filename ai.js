/* On-device AI using Chrome's Prompt API, with a clearly labelled demo fallback.
   Raw errors and prompt text are never shown: anything that goes wrong returns
   the built-in example instead, marked as "Demo AI (simulated)". */
const AI_TIMEOUT = 25000;
/** Describe the inputs and outputs the on-device model must support. */
function modelOptions(withImage) {
  const inputs = [{ type: 'text', languages: ['en'] }];
  if (withImage) inputs.push({ type: 'image' });
  return { expectedInputs: inputs, expectedOutputs: [{ type: 'text', languages: ['en'] }] };
}
/** Report whether this browser can run the on-device model, without throwing. */
async function localModelAvailable(withImage) {
  if (!('LanguageModel' in window)) return false;
  try { return (await window.LanguageModel.availability(modelOptions(withImage))) !== 'unavailable'; }
  catch { return false; }
}
/** Create a model session after checking the current browser's capabilities. */
async function createLocalModel(withImage) {
  if (!(await localModelAvailable(withImage))) throw new Error('unavailable');
  return window.LanguageModel.create(modelOptions(withImage));
}
/** Stop waiting for a slow model (for example a first-time download). */
function withTimeout(promise, ms = AI_TIMEOUT) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms); })]).finally(() => clearTimeout(timer));
}
/** Tidy model output: trim, drop markdown emphasis and collapse blank lines. */
function cleanAIText(text) {
  return String(text || '').replace(/\*\*|__|^#+\s*/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}
/** Reject empty, refused, echoed or overly long model output. */
function usableAIText(text, prompt, max = 1200) {
  if (!text || text.length < 12 || text.length > max) return false;
  if (/^(i'?m sorry|sorry|i cannot|i can't|as an ai)/i.test(text)) return false;
  if (/https?:\/\//i.test(text)) return false;
  return !text.includes(String(prompt).slice(0, 60));
}
/** Explain, in the chosen language, why a demo example is shown instead of AI. */
function demoLabel(reason, kind = 'idea', lang = currentLanguage()) {
  const what = kind === 'photo'
    ? ['this note is a built-in example', '這個筆記是內置示範']
    : ['this example comes from our built-in idea engine', '這個例子來自內置點子引擎'];
  const why = {
    unsupported: ['your browser doesn’t have on-device AI', '你的瀏覽器沒有裝置內 AI'],
    language: ['on-device AI only writes in English', '裝置內 AI 只能用英文回答'],
    invalid: ['the on-device AI didn’t give a usable answer', '裝置內 AI 未能給出合用的答案'],
  }[reason] || ['your browser doesn’t have on-device AI', '你的瀏覽器沒有裝置內 AI'];
  return localText(`Demo AI (simulated) – ${why[0]}, so ${what[0]}.`, `示範 AI（模擬）——${why[1]}，所以${what[1]}。`, lang);
}
/**
 * Try the on-device model and fall back to a labelled built-in result.
 * Never throws; resolves to {source:'ai', text} or {source:'demo', reason, ...fallback()}.
 */
async function askAI({ prompt, image = null, validate = usableAIText, fallback = () => ({}), lang = currentLanguage() }) {
  let reason = lang !== 'en' ? 'language' : '';
  if (!reason && !(await localModelAvailable(Boolean(image)))) reason = 'unsupported';
  if (!reason) {
    let session;
    let abandoned = false;
    try {
      const creating = window.LanguageModel.create(modelOptions(Boolean(image)));
      creating.then(made => { if (abandoned) made.destroy(); }, () => {});
      session = await withTimeout(creating);
      const photo = typeof image === 'function' ? await image() : image;
      const input = photo ? [{ role: 'user', content: [{ type: 'text', value: prompt }, { type: 'image', value: photo }] }] : prompt;
      const text = cleanAIText(await withTimeout(session.prompt(input)));
      if (validate(text, prompt)) return { source: 'ai', text };
      reason = 'invalid';
    } catch {
      reason = 'unsupported';
    } finally {
      abandoned = true;
      try { session?.destroy(); } catch { /* already closed */ }
    }
  }
  return { source: 'demo', reason, ...fallback() };
}
/** Show a small badge saying whether a result came from AI or the built-in library. */
function aiBadge(source, aiText = 'On-device AI', demoText = 'Demo AI (simulated)') {
  return `<span class="ai-badge ${source === 'ai' ? 'is-ai' : 'is-demo'}">${source === 'ai' ? '✨ ' + esc(translate(aiText)) : '◇ ' + esc(translate(demoText))}</span>`;
}

/** Request a tailored activity idea for the parent, or a profile-based demo idea. */
async function aiSuggest() {
  const output = document.querySelector('#ai-result');
  if (!output) return;
  output.innerHTML = `<p class="helper">${esc(translate('Thinking of an idea…'))}</p>`;
  const profile = state.profile;
  const prompt = `Suggest one safe, simple offline activity for a child aged ${profile.age}. ` +
    `Interests: ${profile.interests.join(', ') || 'drawing'}. Together activities: ${profile.together.join(', ') || 'storytelling'}. ` +
    `Time: ${profile.time} minutes. Available materials: ${profile.materials || 'paper'}. ` +
    'Write a short title, two clear numbered steps and one parent-child conversation question. Keep it under 120 words.';
  const result = await askAI({ prompt, fallback: () => ({ idea: profileIdea(profile) }) });
  if (document.querySelector('#ai-result') !== output) return;
  output.innerHTML = result.source === 'ai'
    ? `${aiBadge('ai', 'On-device AI idea')}<div class="ai-text">${esc(result.text)}</div><p class="helper">Please check the idea before you try it.</p>`
    : `${aiBadge('demo')}${ideaCardMarkup(result.idea)}<p class="helper">${esc(demoLabel(result.reason))}</p>`;
  localizeUI(output);
}
/** Render a structured idea with a title, two steps and a conversation question. */
function ideaCardMarkup(idea) {
  return `<div class="idea-card"><h3>${idea.icon} ${esc(idea.title)}</h3><p class="helper">${esc(idea.why)}</p><ol><li>${esc(idea.steps[0])}</li><li>${esc(idea.steps[1])}</li></ol><div class="question-card"><b>${esc(translate('Talk about it together'))}</b><p>“${esc(idea.question)}”</p></div></div>`;
}

/** Run the photo check for a submission and save the note on it. */
async function aiCheckSubmission(id, lang = currentLanguage()) {
  const submission = state.submissions.find(item => item.id === id);
  if (!submission || !submission.image) return null;
  const prompt = `The activity is "${submission.title}". In two or three short sentences, describe what is visible ` +
    'and say whether the picture appears related to the activity. Be honest if you are uncertain. ' +
    'Do not identify or describe people, and do not judge the child or say whether the task was completed. The caregiver decides.';
  const result = await askAI({ prompt, lang, image: async () => (await fetch(submission.image)).blob(), validate: (text, p) => usableAIText(text, p, 700) });
  const current = state.submissions.find(item => item.id === id);
  if (!current) return null;
  current.aiNote = { source: result.source, reason: result.reason || '', text: result.text || '', date: new Date().toISOString() };
  saveState();
  return current.aiNote;
}
/** Render a saved AI note (real or demo) for the caregiver. */
function aiNoteMarkup(item) {
  const note = item?.aiNote;
  if (!note) return '';
  const body = note.source === 'ai' ? note.text : localText(
    `Demo AI note: this looks like a photo submitted for “${item.title}”. AI can’t confirm the activity was done – please check with your child.`,
    `示範 AI 筆記：這看來是為「${ZH[item.title] || item.title}」提交的相片。AI 無法確認活動已經完成，請和孩子確認。`);
  return `<div class="ai-note">${aiBadge(note.source, 'On-device AI note')}<p>${esc(body)}</p>${note.source === 'demo' ? `<small>${esc(demoLabel(note.reason, 'photo'))}</small>` : ''}<small>${esc(translate('AI can be wrong. You make the final decision.'))}</small></div>`;
}
/** Ask for (or simulate) a photo note and show it in the open review dialog. */
async function aiDescribe(id) {
  const output = document.querySelector('#ai-result');
  if (!output) return;
  output.innerHTML = `<p class="helper">${esc(translate('Checking the photo…'))}</p>`;
  const note = await aiCheckSubmission(id);
  if (document.querySelector('#ai-result') !== output) return;
  output.innerHTML = note ? aiNoteMarkup(state.submissions.find(item => item.id === id)) : '';
  localizeUI(output);
  if (state.view === 'parent' && state.parent === 'reviews') render();
}
