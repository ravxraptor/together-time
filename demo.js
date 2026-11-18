/* Sample data for first-time visitors (e.g. a tutor). Everything here is clearly marked as demo data. */
const DEMO_PLAN_ID = 'demo-after-school';
let confirmingReset = false;
/** Draw a built-in placeholder "photo" as an inline SVG data URL (no external files). */
function demoImage(kind) {
  const label = '<rect x="18" y="18" width="128" height="34" rx="17" fill="#ffffffcc"/><text x="82" y="41" font-family="sans-serif" font-size="16" font-weight="700" fill="#8f7a52" text-anchor="middle">DEMO PHOTO</text>';
  const scenes = {
    build: '<rect width="640" height="480" fill="#e5f1eb"/><rect y="360" width="640" height="120" fill="#c9dfc5"/><rect x="120" y="250" width="70" height="110" fill="#d78068"/><rect x="190" y="290" width="60" height="70" fill="#82aca0"/><rect x="250" y="220" width="64" height="140" fill="#e3b66f"/><polygon points="120,250 155,205 190,250" fill="#41796f"/><rect x="380" y="300" width="180" height="22" fill="#9a8054"/><rect x="390" y="322" width="22" height="38" fill="#9a8054"/><rect x="528" y="322" width="22" height="38" fill="#9a8054"/><circle cx="470" cy="270" r="28" fill="#c58a5a"/><circle cx="452" cy="248" r="10" fill="#c58a5a"/><circle cx="488" cy="248" r="10" fill="#c58a5a"/><circle cx="540" cy="90" r="40" fill="#f9dbbb"/>',
    mystery: '<rect width="640" height="480" fill="#fdf0d4"/><rect x="170" y="190" width="300" height="200" rx="12" fill="#d78068"/><rect x="150" y="160" width="340" height="56" rx="10" fill="#c96d55"/><rect x="305" y="160" width="30" height="230" fill="#e3b66f"/><text x="320" y="130" font-family="sans-serif" font-size="90" font-weight="900" fill="#41796f" text-anchor="middle">?</text><ellipse cx="520" cy="400" rx="18" ry="26" fill="#a5afa9"/><rect x="514" y="300" width="12" height="80" rx="6" fill="#a5afa9"/>',
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">${scenes[kind] || scenes.build}${label}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
/** Return an ISO time a number of days ago at a given hour and minute. */
function demoTime(daysAgo, hours, mins) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, mins, 0, 0);
  return date.toISOString();
}
/** Fill in a sample after-school plan and two sample submissions. */
function loadDemoData() {
  const everyDay = ['0', '1', '2', '3', '4', '5', '6'];
  const plan = {id: DEMO_PLAN_ID, name: 'After-school plan (demo)', blocks: [
    {id: 'demo-play', type: 'activity', title: 'Offline play time', start: '16:00', end: '16:30', repeat: 'weekly', days: everyDay, date: '', options: [], activityMode: 'selected', activityIds: ['draw', 'build', 'mystery', 'storystarter'], chosen: '', chosenByDate: {}},
    {id: 'demo-games', type: 'restriction', title: 'Games break', start: '16:30', end: '17:30', repeat: 'weekly', days: everyDay, date: '', apps: ['Games'], unlockGoal: 1},
    {id: 'demo-homework', type: 'homework', title: 'Homework time', start: '17:30', end: '18:00', repeat: 'weekly', days: everyDay, date: '', notes: 'Reading and a maths worksheet', doneDates: {}},
  ]};
  ensurePlans();
  state.family.plans = [...state.family.plans.filter(item => item.id !== DEMO_PLAN_ID), plan];
  state.family.activePlan = DEMO_PLAN_ID;
  state.family.approved = [...new Set([...state.family.approved, 'build', 'mystery', 'storystarter'])];
  const previous = state.submissions.filter(item => item.demo);
  state.stars = Math.max(0, state.stars - previous.filter(item => item.status === 'approved').length);
  state.submissions = state.submissions.filter(item => !item.demo);
  state.submissions.push(
    {id: 'demo-sub-1', demo: true, activityId: 'build', title: 'Build a tiny town', idea: 'Build a little home for a panda using blocks or boxes.', planId: DEMO_PLAN_ID, image: demoImage('build'), note: 'I made a bridge for my teddy!', feeling: 'proud', date: demoTime(2, 16, 12), status: 'approved', aiNote: {source: 'demo', reason: 'unsupported', text: '', date: demoTime(2, 16, 13)}},
    {id: 'demo-sub-2', demo: true, activityId: 'mystery', title: 'Mystery Box challenge', idea: 'Ask your grown-up for three clues, one at a time.', planId: DEMO_PLAN_ID, image: demoImage('mystery'), note: 'It was a spoon! I guessed it.', feeling: 'silly', date: demoTime(1, 16, 8), status: 'pending', aiNote: {source: 'demo', reason: 'unsupported', text: '', date: demoTime(1, 16, 9)}},
  );
  state.submissions.sort((a, b) => new Date(a.date) - new Date(b.date));
  state.stars += 1;
  const log = {};
  [50, 40, 65, 30, 45].forEach((value, index) => { log[submissionDay(demoTime(5 - index, 12, 0))] = value; });
  state.family.screenLog = {...state.family.screenLog, ...log};
  plannerDate = localDate();
  saveState(); render(); toast('Demo data loaded. Look for the “demo” labels.');
}
/** Clear everything saved in this browser and start again with the example family. */
function resetDemo() {
  const languages = state.languages;
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
  state = migrateState(structuredClone(DEFAULTS));
  state.languages = languages;
  state.view = 'parent';
  state.parent = 'family';
  confirmingReset = false;
  plannerDate = localDate();
  saveState(); render(); toast('The demo has been reset.');
  document.querySelector('[data-action="load-demo"]')?.focus();
}
/** Render the demo-data panel for the Family & linking page, with an in-page reset confirmation. */
function demoPanel() {
  const confirm = confirmingReset ? `<div class="confirm-box" role="alertdialog" aria-labelledby="reset-question"><p id="reset-question"><b>Reset the demo?</b><br>This removes all plans, photos, feelings and settings saved in this browser. It cannot be undone.</p><div class="detail-actions"><button class="button primary small" data-action="reset-demo-confirm">Yes, reset everything</button><button class="button outline small" data-action="reset-demo-cancel">Cancel</button></div></div>` : '';
  return `<section class="panel demo-panel"><span class="eyebrow">FOR FIRST-TIME VISITORS · DEMO</span><h2>Try it with sample data</h2><p>Load a sample after-school plan (16:00–16:30 offline play, 16:30–17:30 games break, 17:30–18:00 homework) and two sample photo submissions with feelings and an AI note. All of it is demo data, saved only in this browser.</p><div class="detail-actions"><button class="button dark small" data-action="load-demo">Load demo data</button><button class="button outline small" data-action="reset-demo">Reset demo</button></div>${confirm}</section>`;
}
/** Handle the demo buttons. */
document.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'load-demo') loadDemoData();
  if (action === 'reset-demo') { confirmingReset = true; render(); document.querySelector('[data-action="reset-demo-cancel"]')?.focus(); }
  if (action === 'reset-demo-cancel') { confirmingReset = false; render(); document.querySelector('[data-action="reset-demo"]')?.focus(); }
  if (action === 'reset-demo-confirm') resetDemo();
});
