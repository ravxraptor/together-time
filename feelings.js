/* Optional feelings a child can add to a creation, and the conversation questions they lead to. */
const FEELINGS = [
  {id: 'happy', emoji: '😊', word: 'Happy', question: ['What made you smile the most while you were doing it?', '做的時候，甚麼最令你開心？']},
  {id: 'proud', emoji: '🤩', word: 'Proud', question: ['What part are you most proud of?', '你最自豪的是哪一部分？']},
  {id: 'calm', emoji: '😌', word: 'Calm', question: ['What helped you feel calm while you were doing it?', '做的時候，甚麼讓你覺得平靜？']},
  {id: 'silly', emoji: '🤪', word: 'Silly', question: ['What was the silliest moment? Can you show me?', '最搞笑的是哪一刻？可以做給我看嗎？']},
  {id: 'frustrated', emoji: '😣', word: 'Frustrated', question: ['What was tricky, and what could we try next time?', '哪裏有點難？下次我們可以試試甚麼？']},
];
/** Look up a feeling by its saved ID. */
function feeling(id) { return FEELINGS.find(item => item.id === id); }
/** Pick the conversation question for a creation, tailored to the feeling when one was chosen. */
function conversationQuestion(activityId, feelingId, lang = currentLanguage()) {
  const chosen = feeling(feelingId);
  return chosen ? localText(chosen.question[0], chosen.question[1], lang) : activityQuestion(activityId, lang);
}
/** Render the optional "How did it feel?" step with big, labelled emoji choices. */
function feelingChoices() {
  return `<fieldset class="feeling-step"><legend>How did it feel? <span class="optional">optional</span></legend><div class="feeling-grid">${FEELINGS.map(item => `<label class="feeling-card"><input type="radio" name="feeling" value="${item.id}"><span><b aria-hidden="true">${item.emoji}</b><small>${item.word}</small></span></label>`).join('')}</div></fieldset>`;
}
/** Show a chosen feeling as a small chip. */
function feelingChip(feelingId) {
  const chosen = feeling(feelingId);
  return chosen ? `<span class="feeling-chip">${chosen.emoji} ${esc(translate(chosen.word))}</span>` : '';
}
/** Return submissions from the last seven days, including today. */
function lastWeekSubmissions() {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);
  return state.submissions.filter(item => new Date(item.date) >= since);
}
/** Count the feelings chosen in the last seven days. */
function weeklyFeelings() {
  const items = lastWeekSubmissions();
  return FEELINGS.map(item => ({...item, count: items.filter(entry => entry.feeling === item.id).length})).filter(item => item.count);
}
/** Render the parent's "How [child] felt this week" summary, or a friendly empty state. */
function feelingSummary() {
  const counts = weeklyFeelings();
  const title = localText(`How ${state.profile.name} felt this week`, `${state.profile.name}這星期的感受`);
  const body = counts.length
    ? `<ul class="feeling-counts">${counts.map(item => `<li><span aria-hidden="true">${item.emoji}</span><b>${item.count}</b><small>${esc(translate(item.word))}</small></li>`).join('')}</ul>`
    : `<p class="empty-copy">${esc(localText(`No feelings shared yet this week. ${state.profile.name} can choose one when they share a creation.`, `這星期還未分享感受。${state.profile.name}分享作品時可以選擇感受。`))}</p>`;
  return `<section class="panel feeling-summary"><span class="eyebrow">FEELINGS · LAST 7 DAYS</span><h2>${esc(title)}</h2>${body}</section>`;
}
