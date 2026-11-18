/* A daily, browser-local calendar shared by the child and caregiver. */
const DAY_START = 6 * 60;
const DAY_END = 24 * 60;
const HOUR_HEIGHT = 64;
/** Return the minutes represented by an HH:MM time. */
function minutes(value) {
  const [hours, mins] = String(value).split(':').map(Number);
  return hours * 60 + mins;
}
/** Format a minute count as a time within the displayed day. */
function clockTime(value) {
  const hours = Math.floor(value / 60);
  return `${String(hours).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}
/** Read calendar blocks, including for profiles created before this feature. */
function planBlocks() { return activePlan().blocks || []; }
/** Display the two-lane daily calendar and its optional editing controls. */
function plannerMarkup(parent) {
  const blocks = planBlocks().filter(block => occursOn(block, plannerDate));
  const hours = Array.from({length: 18}, (_, i) => `<div class="time-label">${clockTime((i + 6) * 60)}</div>`).join('');
  const lane = type => `<div class="calendar-lane" data-lane="${type}">${blocks.filter(b => b.type === type).map(b => {
    const top = (minutes(b.start) - DAY_START) / 60 * HOUR_HEIGHT;
    const height = (minutes(b.end) - minutes(b.start)) / 60 * HOUR_HEIGHT;
    const choice = b.chosenByDate?.[plannerDate] || b.chosen;
    const summary = b.type === 'activity' ? (b.activityMode === 'all' ? 'All activities' : b.activityMode === 'ai' ? 'Idea helper chooses' : [...CATALOG.filter(a => (b.activityIds || []).includes(a.id)).map(a => a.title), ...(b.options || [])].join(' · ')) : b.type === 'homework' ? (b.doneDates?.[plannerDate] ? '✓ Marked done' : (b.notes || 'Time for homework')) : `${b.apps.join(', ')}${b.unlockGoal ? ' · ' + rewardLabel(b, plannerDate) : ''}`;
    return `<div class="calendar-event ${type}" style="top:${top}px;min-height:${height}px" aria-label="${esc(b.start)} to ${esc(b.end)}: ${esc(b.title)}">
      <strong>${esc(b.title)}</strong><span>${esc(b.start)}–${esc(b.end)}</span><small>${esc(summary)}</small>
      ${parent ? `<button data-plan-action="edit" data-id="${esc(b.id)}">Edit</button>` : b.type === 'activity' ? `<button data-plan-action="choose" data-id="${esc(b.id)}">See activity plan</button>` : b.type === 'homework' ? `<button data-plan-action="homework-done" data-id="${esc(b.id)}">${b.doneDates?.[plannerDate] ? 'Undo done' : 'I did this ✓'}</button>` : ''}
    </div>`;
  }).join('')}</div>`;
  const tools = parent ? `<div class="planner-tools"><button type="button" class="button primary small" data-plan-action="add-activity">+ Activity choices</button><button type="button" class="button outline small" data-plan-action="add-restriction">+ Block apps</button><button type="button" class="button outline small" data-plan-action="add-homework">+ Homework</button></div>
    <p class="helper">Drag an idea onto the activity column, or use the buttons. Tap a block to edit its times and repeat days.</p>
    <div class="drag-ideas">${CATALOG.filter(a => state.family.approved.includes(a.id)).map(a => `<button type="button" class="drag-idea" draggable="true" data-drag-activity="${esc(a.id)}" title="Drag onto the activity column">${a.icon} ${esc(a.title)}</button>`).join('')}</div>` : '<p class="helper">Choose an activity from a play block. Your grown-up can change the plan.</p>';
  return `<section class="panel planner-panel"><div class="panel-heading"><div><span class="eyebrow">YOUR DAILY PLAN</span><h2>${parent ? 'Plan their day' : 'My day, at a glance'}</h2></div></div>${planPicker(parent)}${tools}
    <div class="calendar-scroll"><div class="calendar-head"><span>TIME</span><b>✿ OFFLINE PLAY</b><b>◷ APP RESTRICTIONS</b><b>✏ HOMEWORK</b></div><div class="calendar-body"><div class="calendar-times">${hours}</div>${lane('activity')}${lane('restriction')}${lane('homework')}</div></div>
    <p class="helper">Demo only: calendar blocks do not lock apps or run automatically. Other times are not defined by these blocks.</p></section>`;
}
/** Open a block editor, optionally populated from a dragged activity. */
function editPlanBlock(type, id = '', start = '15:00', activityTitle = '') {
  const block = planBlocks().find(item => item.id === id);
  const editing = Boolean(block);
  const item = block || {type, start, end: clockTime(Math.min(minutes(start) + 60, DAY_END - 1)), title: type === 'activity' ? 'Choose an offline activity' : type === 'homework' ? 'Homework time' : 'Entertainment break', options: activityTitle ? [activityTitle] : [], apps: []};
  const fields = type === 'activity' ? activityPlanFields(item) : type === 'homework' ? `<label class="field">Homework details <small>Optional</small><textarea name="notes" rows="3" placeholder="e.g. Maths worksheet">${esc(item.notes || '')}</textarea></label><p class="helper">The child can mark this as done. It is not checked automatically and does not count toward the activity goal.</p>` : `<label class="field">Apps or categories to restrict <small>One per line, for example Games or YouTube</small><textarea name="apps" rows="4" placeholder="Games&#10;Video apps">${esc(item.apps.join('\n'))}</textarea></label><label class="field">Allow a demo unlock after how many approved activities? <small>0 means wait until the scheduled end</small><input type="number" name="unlockGoal" min="0" max="10" step="1" value="${Number(item.unlockGoal || 0)}"></label><p class="helper">Counts activities submitted during this time block and approved in the current plan. An immediate parent lock stays on.</p>`;
  dialog(`<span class="eyebrow">${type === 'activity' ? 'OFFLINE PLAY' : type === 'homework' ? 'HOMEWORK' : 'APP RESTRICTIONS'} · PLAN</span><h2>${editing ? 'Edit this block' : 'Add to the calendar'}</h2><form id="plan-form" data-type="${type}" data-id="${esc(id)}">
    <label class="field">Block name<input name="title" required maxlength="60" value="${esc(item.title)}"></label>
    <div class="field-row"><label class="field">Starts<input type="time" name="start" required value="${esc(item.start)}"></label><label class="field">Ends<input type="time" name="end" required value="${esc(item.end)}"></label></div>${fields}${repeatFields(item)}
    <p class="helper">Blocks run between 06:00 and 23:59 on their selected days. Restrictions are a visual demo.</p><button type="submit" class="button primary full">Save block</button>
    ${editing ? `<button type="button" class="button outline full" data-plan-action="delete" data-id="${esc(id)}">Remove block</button>` : ''}</form>`);
}
/** Save a validated block and prevent overlaps within the same lane. */
function savePlanBlock(form) {
  const data = new FormData(form);
  const type = form.dataset.type;
  const id = form.dataset.id;
  const start = String(data.get('start'));
  const end = String(data.get('end'));
  const title = String(data.get('title') || '').trim();
  const entries = String(data.get(type === 'activity' ? 'options' : 'apps') || '').split('\n').map(x => x.trim()).filter(Boolean).slice(0, 12);
  const mode = data.get('activityMode') || 'selected';
  const ids = data.getAll('activityIds').filter(id => CATALOG.some(item => item.id === id));
  if (type === 'activity' && !['selected','all','ai'].includes(mode)) { toast('Choose an activity mode.'); return; }
  const goal = Number(data.get('unlockGoal') || 0);
  if (type === 'restriction' && (!Number.isInteger(goal) || goal < 0 || goal > 10)) { toast('Choose an activity goal between 0 and 10.'); return; }
  const repeat = data.get('repeat') || 'weekly';
  const days = data.getAll('days');
  const date = String(data.get('date') || '');
  if (!['weekly', 'once'].includes(repeat) || (repeat === 'weekly' && !days.length) || (repeat === 'once' && !/^\d{4}-\d{2}-\d{2}$/.test(date))) { toast('Choose repeat days or a date for this block.'); return; }
  const schedule = {repeat, days, date};
  if (!title || (type === 'restriction' && !entries.length) || (type === 'activity' && mode === 'selected' && !entries.length && !ids.length) || !start || !end || minutes(start) < DAY_START || minutes(end) >= DAY_END || minutes(end) <= minutes(start)) {
    toast('Add a name, at least one choice or app, and valid times between 06:00 and 23:59.'); return;
  }
  if (planBlocks().some(b => b.id !== id && b.type === type && recurrencesOverlap(schedule, b) && minutes(start) < minutes(b.end) && minutes(end) > minutes(b.start))) {
    toast('Blocks in the same column cannot overlap. Adjust the times.'); return;
  }
  const previous = planBlocks().find(b => b.id === id);
  const updated = {id: id || crypto.randomUUID(), type, title, start, end, ...schedule,
    ...(type === 'activity' ? {options: entries, activityMode: mode, activityIds: ids, chosen: entries.includes(previous?.chosen) ? previous.chosen : '', chosenByDate: Object.fromEntries(Object.entries(previous?.chosenByDate || {}).filter(([, choice]) => entries.includes(choice)))} : type === 'homework' ? {notes: String(data.get('notes') || '').trim().slice(0, 300), doneDates: previous?.doneDates || {}} : {apps: entries, unlockGoal: goal})};
  setPlanBlocks([...planBlocks().filter(b => b.id !== id), updated]);
  saveState(); closeDialog(); render(); toast('Daily plan saved.');
}
/** Present choices in a child-friendly dialog. */
function choosePlanBlock(id) {
  const block = planBlocks().find(b => b.id === id && b.type === 'activity');
  if (!block) return;
  const mode = block.activityMode || 'selected';
  const names = [...CATALOG.filter(item => (block.activityIds || []).includes(item.id)).map(item => item.title), ...(block.options || [])];
  const detail = mode === 'all' ? 'All activities will be available.' : mode === 'ai' ? 'The idea helper will choose from approved activities.' : `Activities: ${names.join(', ')}`;
  const isNow = currentActivityBlock()?.id === id && plannerDate === localDate();
  dialog(`<span class="eyebrow">${esc(block.start)}–${esc(block.end)} · YOUR CHOICE</span><h2>Activity plan</h2><p>${esc(detail)}</p><p class="helper">${isNow ? 'These choices are available now.' : 'These choices are available during this planned time.'}</p>${isNow ? '<button class="button primary full" data-action="open-available">See available activities →</button>' : ''}`);
}
/** Fill the parent's editor with familiar, preference-based sample ideas. */
function samplePlanIdeas() {
  const output = document.querySelector('#plan-ai-status');
  const input = document.querySelector('#plan-form textarea[name="options"]');
  if (!output || !input) return;
  const ideas = [...CATALOG].sort((a,b) => Number(state.profile.interests.includes(b.category)) - Number(state.profile.interests.includes(a.category))).slice(0,3);
  input.value = ideas.map(item => item.title).join('\n');
  output.textContent = 'These are built-in sample ideas, not AI-generated. Review them before saving.';
}
/** Generate editable options; a caregiver must review them before saving. */
async function generatePlanIdeas() {
  const output = document.querySelector('#plan-ai-status');
  const input = document.querySelector('#plan-form textarea[name="options"]');
  if (!output || !input) return;
  output.textContent = translate('Thinking of an idea…');
  const lines = text => String(text).split('\n').map(x => x.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim()).filter(x => x && x.length <= 60).slice(0, 3);
  const prompt = `Suggest three simple, safe offline activities for a child aged ${state.profile.age}. Interests: ${state.profile.interests.join(', ')}. Activities with a grown-up: ${state.profile.together.join(', ')}. Materials: ${state.profile.materials}. Write exactly three short activity names, each on its own line, with no numbering. A caregiver will check them.`;
  const result = await askAI({ prompt, validate: (text, p) => usableAIText(text, p, 400) && lines(text).length >= 2, fallback: () => ({
    ideas: [...CATALOG].sort((a,b) => Number(state.profile.interests.includes(b.category)) - Number(state.profile.interests.includes(a.category))).slice(0,3).map(item => item.title),
  }) });
  if (document.querySelector('#plan-ai-status') !== output) return;
  input.value = (result.source === 'ai' ? lines(result.text) : result.ideas).join('\n');
  output.textContent = result.source === 'ai' ? translate('Please review and edit these ideas, then save the block.') : demoLabel(result.reason);
}
/** Route calendar interactions without changing the rest of the app. */
document.addEventListener('click', event => {
  const button = event.target.closest('[data-plan-action]');
  if (!button) return;
  const {planAction: action, id, index} = button.dataset;
  if (action === 'add-activity') editPlanBlock('activity');
  if (action === 'add-restriction') editPlanBlock('restriction');
  if (action === 'add-homework') editPlanBlock('homework');
  if (action === 'homework-done') { const block = planBlocks().find(b => b.id === id && b.type === 'homework'); if (block) { block.doneDates = {...block.doneDates, [plannerDate]: !block.doneDates?.[plannerDate]}; saveState(); render(); toast('Homework status updated.'); } }
  if (action === 'edit') { const block = planBlocks().find(b => b.id === id); if (block) editPlanBlock(block.type, id); }
  if (action === 'choose') choosePlanBlock(id);
  if (action === 'generate') generatePlanIdeas();
  if (action === 'samples') samplePlanIdeas();
  if (action === 'delete') { setPlanBlocks(planBlocks().filter(b => b.id !== id)); saveState(); closeDialog(); render(); toast('Block removed.'); }
  if (action === 'select') {
    const block = planBlocks().find(b => b.id === id);
    if (block && block.options[Number(index)]) { block.chosenByDate = {...block.chosenByDate, [plannerDate]: block.options[Number(index)]}; delete block.chosen; saveState(); closeDialog(); render(); toast('Your choice is saved!'); }
  }
});
document.addEventListener('submit', event => { if (event.target.id === 'plan-form') { event.preventDefault(); savePlanBlock(event.target); } });
/** Allow a parent to drag an activity idea onto the calendar. */
document.addEventListener('dragstart', event => {
  const source = event.target.closest('[data-drag-activity]');
  if (source) event.dataTransfer.setData('text/plain', source.dataset.dragActivity);
});
document.addEventListener('dragover', event => { if (event.target.closest('[data-lane="activity"]')) event.preventDefault(); });
document.addEventListener('drop', event => {
  const lane = event.target.closest('[data-lane="activity"]');
  if (!lane || state.view !== 'parent') return;
  event.preventDefault();
  const item = activity(event.dataTransfer.getData('text/plain'));
  if (!item || !state.family.approved.includes(item.id)) return;
  const offset = event.clientY - lane.getBoundingClientRect().top;
  const start = Math.max(DAY_START, Math.min(DAY_END - 30, DAY_START + Math.floor(offset / HOUR_HEIGHT * 2) * 30));
  editPlanBlock('activity', '', clockTime(start), item.title);
});
