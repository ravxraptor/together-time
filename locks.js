/* Immediate lock settings and child-friendly status for the local demo. */
/** Return the items included in an immediate lock, including old demo data. */
function lockItems() {
  return Array.isArray(state.family.lockItems) ? state.family.lockItems : (state.family.apps || []);
}
/** Describe a parent's chosen lock in plain language. */
function lockDescription() {
  if (state.family.lockScope === 'screen') return 'Whole screen';
  const items = lockItems();
  return items.length ? items.join(', ') : 'Entertainment apps (not specified)';
}
/** Show the current configuration beneath a parent's quick-lock button. */
function lockDetails() {
  return `<p class="helper"><b>${state.family.manualLock ? 'Locked in this demo' : 'Entertainment can include'}:</b> ${esc(lockDescription())}</p>${state.family.manualLock ? '<button type="button" class="plain-link" data-action="edit-lock">Change what is locked →</button>' : '<p class="helper">Choose apps or the whole screen after pressing the lock button.</p>'}`;
}
/** Ask what the parent wants an immediate lock to cover. */
function showLockSettings() {
  const scope = state.family.lockScope || 'apps';
  dialog(`<span class="eyebrow">PARENT CONTROL · DEMO</span><h2>What should be locked?</h2>
    <p>Choose what your child will see as unavailable until you unlock it.</p>
    <form id="immediate-lock-form">
      <label class="radio-row"><input type="radio" name="scope" value="apps" ${scope === 'apps' ? 'checked' : ''}> Selected entertainment apps or categories</label>
      <label class="field">What does entertainment include? <small>Write one app or category per line</small>
        <textarea name="items" rows="4" placeholder="YouTube\nGames\nVideo apps">${esc(lockItems().join('\n'))}</textarea></label>
      <label class="radio-row"><input type="radio" name="scope" value="screen" ${scope === 'screen' ? 'checked' : ''}> Whole screen</label>
      <p class="helper">This prototype shows the choice only; it cannot lock a device or other apps.</p>
      <button class="button primary full" type="submit">${state.family.manualLock ? 'Save lock changes' : 'Lock now'}</button>
    </form>`);
}
/** Save the parent's chosen scope and activate the demo lock. */
function saveImmediateLock(form) {
  const data = new FormData(form);
  const scope = data.get('scope');
  const items = String(data.get('items') || '').split('\n').map(item => item.trim()).filter(Boolean).slice(0, 20);
  if (!['apps', 'screen'].includes(scope)) { toast('Choose what to lock.'); return; }
  if (scope === 'apps' && !items.length) { toast('Add at least one app or category, or choose the whole screen.'); return; }
  state.family.lockScope = scope;
  state.family.lockItems = items;
  state.family.manualLock = true;
  saveState(); document.querySelector('#modal-root').innerHTML = ''; render();
  toast('Parent demo lock is on.');
}
/** Identify current scheduled restrictions as a plan, not an actual lock. */
function scheduledRestrictions() {
  const now = new Date();
  const time = now.getHours() * 60 + now.getMinutes();
  return planBlocks().filter(block => block.type === 'restriction' && occursOn(block, localDate()) && minutes(block.start) <= time && time < minutes(block.end) && !rewardProgress(block, localDate()).reached);
}
/** Make a clear status message for child pages. */
function childLockStatus() {
  const parts = [];
  if (state.family.manualLock) parts.push(`<b>Parent's demo lock:</b> ${esc(lockDescription())}.`);
  if (state.family.paused) parts.push(`<b>Activity break:</b> ${esc((state.family.apps || []).join(', ') || 'Entertainment apps (not specified)')}.`);
  const planned = scheduledRestrictions();
  if (planned.length) parts.push(`<b>Scheduled for this time:</b> ${esc(planned.flatMap(block => block.apps).join(', '))} (plan only).`);
  return parts.length ? `<div class="notice lock-notice">${parts.join('<br>')}<br><span>Demo only: the device and other apps are not actually locked.</span></div>` : '';
}
/** Handle immediate-lock form submission. */
document.addEventListener('submit', event => {
  if (event.target.id === 'immediate-lock-form') { event.preventDefault(); saveImmediateLock(event.target); }
});

/** Summarise today's demo restrictions without inventing an end time. */
function childDayStatus() {
  const messages = [];
  if (state.family.manualLock) messages.push(`<strong>${esc(lockDescription())}</strong> is on a parent-set demo break until your grown-up unlocks it.`);
  if (state.family.paused) messages.push(`<strong>${esc((state.family.apps || []).join(', ') || 'Entertainment apps')}</strong> are on a demo activity break until an activity is approved or your grown-up ends it.`);
  for (const block of scheduledRestrictions()) messages.push(`<strong>${esc(block.apps.join(', '))}</strong> ${block.apps.length === 1 ? 'is' : 'are'} scheduled for a break until <strong>${esc(block.end)}</strong>. ${block.unlockGoal ? esc(rewardLabel(block, localDate())) : ''}`);
  for (const block of unlockedRestrictions()) messages.push(`<strong>${esc(block.apps.join(', '))}</strong>: activity goal met! The scheduled break is unlocked in this demo.${state.family.manualLock ? ' Your grown-up’s separate lock is still on.' : ''}`);
  const description = messages.length ? messages.map(message => `<p>${message}</p>`).join('') : '<p>There are no demo breaks or scheduled app restrictions right now.</p>';
  return `<section class="day-status"><div class="day-status-icon" aria-hidden="true">◷</div><div class="day-status-content"><span class="eyebrow">YOUR SCREEN TIME · DEMO</span><h2>A little screen-time update</h2>${description}<small>Demo only: devices and apps are not actually blocked.</small></div><button class="button outline" data-action="today-schedule">See today’s schedule →</button></section>`;
}
