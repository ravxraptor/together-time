/* Multiple family plans and calendar recurrence, stored in this browser. */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Return a date in the browser's local calendar, without UTC conversion. */
function localDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}
let plannerDate = localDate();
/** Migrate the previous single-plan data without removing it. */
function ensurePlans() {
  if (!Array.isArray(state.family.plans) || !state.family.plans.length) {
    state.family.plans = [{id: 'first-plan', name: 'My first plan', blocks: state.family.planBlocks || []}];
    state.family.activePlan = 'first-plan';
    saveState();
  }
  if (!state.family.plans.some(plan => plan.id === state.family.activePlan)) state.family.activePlan = state.family.plans[0].id;
  return state.family.plans;
}
/** Look up the active plan, shared between parent and child views. */
function activePlan() { return ensurePlans().find(plan => plan.id === state.family.activePlan); }
/** Replace the active plan's blocks without affecting other plans. */
function setPlanBlocks(blocks) { activePlan().blocks = blocks; }
/** Work out the weekday of a date in local time. */
function dayOf(date) { return new Date(`${date}T12:00:00`).getDay(); }
/** True when a block appears on the date; older blocks repeat daily. */
function occursOn(block, date) {
  if (!block.repeat || block.repeat === 'weekly') return (block.days || ['0','1','2','3','4','5','6']).includes(String(dayOf(date)));
  return block.date === date;
}
/** Test whether two recurrences share any calendar day. */
function recurrencesOverlap(a, b) {
  if (a.repeat === 'once') return occursOn(b, a.date);
  if (b.repeat === 'once') return occursOn(a, b.date);
  const days = a.days || ['0','1','2','3','4','5','6'];
  const other = b.days || ['0','1','2','3','4','5','6'];
  return days.some(day => other.includes(day));
}
/** Show plan controls to parents and the active plan name to children. */
function planPicker(parent) {
  const plans = ensurePlans();
  const picker = parent ? `<label>Active family plan <select id="active-plan">${plans.map(plan => `<option value="${esc(plan.id)}" ${plan.id === state.family.activePlan ? 'selected' : ''}>${esc(plan.name)}</option>`).join('')}</select></label><button type="button" class="button outline small" data-plan-action="new-plan">+ New plan</button>` : `<span>Family plan: <b>${esc(activePlan().name)}</b></span>`;
  return `<div class="plan-picker">${picker}<label>View date <input type="date" id="planner-date" value="${esc(plannerDate)}"></label></div>`;
}
/** Render a recurrence editor for a new or existing block. */
function repeatFields(item) {
  const repeat = item.repeat || 'weekly';
  const days = item.days || ['0','1','2','3','4','5','6'];
  return `<label class="field">Repeat <select name="repeat"><option value="weekly" ${repeat === 'weekly' ? 'selected' : ''}>Every week on selected days</option><option value="once" ${repeat === 'once' ? 'selected' : ''}>One time only</option></select></label>
    <fieldset class="repeat-days"><legend>For weekly repeat: choose days</legend>${WEEKDAYS.map((day, i) => `<label><input type="checkbox" name="days" value="${i}" ${days.includes(String(i)) ? 'checked' : ''}> ${day}</label>`).join('')}</fieldset>
    <label class="field">For one time only: choose date<input type="date" name="date" value="${esc(item.date || plannerDate)}"></label>`;
}
/** Create a named empty plan and make it active. */
function createPlan(form) {
  const name = String(new FormData(form).get('name') || '').trim();
  if (!name) { toast('Please enter a plan name.'); return; }
  ensurePlans().push({id: crypto.randomUUID(), name: name.slice(0, 40), blocks: []});
  state.family.activePlan = state.family.plans[state.family.plans.length - 1].id;
  saveState(); closeDialog(); render(); toast('New plan is active.');
}
/** Handle plan creation, changing plans, and viewing a different day. */
document.addEventListener('click', event => {
  const button = event.target.closest('[data-plan-action="new-plan"]');
  if (button) dialog('<span class="eyebrow">FAMILY PLANS</span><h2>Create a new plan</h2><p>Try a school-day, weekend or holiday routine.</p><form id="new-plan-form"><label class="field">Plan name<input name="name" maxlength="40" required placeholder="e.g. School holidays"></label><button class="button primary full" type="submit">Create and activate plan</button></form>');
});
document.addEventListener('submit', event => { if (event.target.id === 'new-plan-form') { event.preventDefault(); createPlan(event.target); } });
document.addEventListener('change', event => {
  if (event.target.id === 'active-plan' && state.view === 'parent' && ensurePlans().some(plan => plan.id === event.target.value)) {
    state.family.activePlan = event.target.value; saveState(); render(); toast('Active family plan changed.');
  }
  if (event.target.id === 'planner-date' && event.target.value) { plannerDate = event.target.value; render(); }
});
