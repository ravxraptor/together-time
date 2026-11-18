/* Apply the parent's current activity plan to the child-facing library. */
/** Find the activity block currently in effect in the active family plan. */
function currentActivityBlock(now = new Date()) {
  const time = now.getHours() * 60 + now.getMinutes();
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  return planBlocks().find(block => block.type === 'activity' && occursOn(block, date) && minutes(block.start) <= time && time < minutes(block.end));
}
/** Return parent-written choices as activity cards, preserving old blocks. */
function customActivities(block) {
  return (block.options || []).map((title,index) => {
    const known = CATALOG.find(item => item.title.toLowerCase() === title.toLowerCase());
    return known || {id:`custom-${block.id}-${index}`, icon:'🌟', title, category:'Parent choice', minutes:Number(state.profile.time)||15, description:'Your grown-up chose this activity for you.', materials:'Ask your grown-up what you need.', mode:'solo'};
  });
}
/** List activities allowed by the current plan; AI mode offers one at a time. */
function availableActivities(now = new Date()) {
  const block = currentActivityBlock(now);
  if (!block) return CATALOG.filter(item => state.family.approved.includes(item.id));
  if (block.activityMode === 'all') return CATALOG.slice();
  if (block.activityMode === 'ai') {
    const allowed = CATALOG.filter(item => state.family.approved.includes(item.id));
    const ordered = [...allowed].sort((a,b) => Number(state.profile.interests.includes(b.category)) - Number(state.profile.interests.includes(a.category)));
    if (!ordered.length) return [];
    const index = (state.aiActivityIndexes?.[block.id] || 0) % ordered.length;
    return [ordered[index]];
  }
  const selected = CATALOG.filter(item => (block.activityIds || []).includes(item.id));
  const choices = [...selected, ...customActivities(block)];
  return choices.filter((item,index) => choices.findIndex(other => other.id === item.id) === index);
}
/** Resolve a parent-written activity from any block in the active plan. */
function findCustomActivity(id) {
  for (const block of planBlocks().filter(item => item.type === 'activity')) {
    const found = customActivities(block).find(item => item.id === id);
    if (found) return found;
  }
}
/** Describe the current parent's activity permissions to the child. */
function childPlanStatus() {
  const block = currentActivityBlock();
  let detail = 'Your grown-up’s usual activity choices are available.';
  let button = '';
  if (block?.activityMode === 'all') detail = 'Your grown-up opened all activities for this time.';
  else if (block?.activityMode === 'ai') {
    detail = 'Your grown-up lets the idea helper pick an activity from their approved library.';
    button = '<button class="button outline small" data-action="next-plan-idea">✨ Show another idea</button>';
  } else if (block) {
    const names = availableActivities().map(item => item.title);
    const intro = currentLanguage() === 'zh-CN' ? '大人选择了：' : currentLanguage() === 'zh' ? '大人選擇了：' : 'Your grown-up chose: ';
    detail = names.length ? `${intro}${names.map(translate).join(', ')}.` : 'Your grown-up has not chosen an activity yet.';
  }
  return `<section class="panel child-plan-status"><span class="eyebrow">✿ YOUR ACTIVITY PLAN</span><p>${esc(detail)}</p>${button}<button class="plain-link" data-action="nav" data-page="explore">See available activities →</button><p class="helper">${block ? `${esc(block.start)}–${esc(block.end)}` : 'Outside a planned activity time'}</p></section>`;
}
/** A visible mode explanation for the activity library. */
function activityModeNote() {
  const block = currentActivityBlock();
  if (!block) return 'Your grown-up’s usual choices';
  if (block.activityMode === 'all') return 'All activities are open';
  if (block.activityMode === 'ai') return 'Idea helper: one approved activity at a time';
  return 'Your grown-up’s chosen activities';
}
/** Parent form controls for limiting or opening activities in a time block. */
function activityPlanFields(item) {
  const mode = item.activityMode || 'selected';
  return `<fieldset class="repeat-days"><legend>Who chooses activities?</legend>
    <label><input type="radio" name="activityMode" value="selected" ${mode === 'selected' ? 'checked' : ''}> I choose the activities</label>
    <label><input type="radio" name="activityMode" value="all" ${mode === 'all' ? 'checked' : ''}> Open all activities</label>
    <label><input type="radio" name="activityMode" value="ai" ${mode === 'ai' ? 'checked' : ''}> Let the idea helper choose</label></fieldset>
    <p class="helper">For “I choose”, tick activities or write your own. Other choices do not use this list.</p>
    <div class="plan-activity-checks">${CATALOG.map(a => `<label><input type="checkbox" name="activityIds" value="${esc(a.id)}" ${(item.activityIds || []).includes(a.id) ? 'checked' : ''}> ${a.icon} ${esc(a.title)}</label>`).join('')}</div>
    <label class="field">My own activity ideas <small>One per line</small><textarea name="options" rows="4" placeholder="Draw a happy place&#10;Build a tiny town">${esc((item.options || []).join('\n'))}</textarea></label>
    <button type="button" class="button outline small" data-plan-action="generate">Suggest ideas with AI ✨</button> <button type="button" class="button outline small" data-plan-action="samples">Use sample ideas</button><p id="plan-ai-status" class="helper" aria-live="polite">If AI is unavailable, the built-in idea library can suggest choices. Review them before saving.</p>
    <p class="helper">Idea-helper mode uses a rotating built-in selection from your approved activities; it is a mock, not generative AI.</p>`;
}
