/* A printable weekly family report built from data saved in this browser (demo). */
/** Return the last seven calendar dates, oldest first, as YYYY-MM-DD. */
function lastWeekDates() {
  return Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return submissionDay(date);
  });
}
/** Add up hand-recorded screen time for the last seven days, including today. */
function weeklyScreenTime() {
  const log = {...(state.family.screenLog || {}), [localDate()]: Number(state.family.recordedMinutes) || 0};
  const days = lastWeekDates().filter(date => date in log);
  return {total: days.reduce((sum, date) => sum + (Number(log[date]) || 0), 0), days: days.length};
}
/** Render the weekly family report with a print / save-as-PDF button. */
function parentReport() {
  const items = lastWeekSubmissions().slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const done = items.filter(item => item.status === 'approved');
  const together = items.filter(item => activity(item.activityId)?.mode === 'together').length;
  const screen = weeklyScreenTime();
  const dates = lastWeekDates();
  const range = `${formatDate(`${dates[0]}T12:00:00`)} – ${formatDate(`${dates[6]}T12:00:00`)}`;
  const counts = weeklyFeelings();
  const asked = [...new Set(items.map(item => conversationQuestion(item.activityId, item.feeling)))];
  const toTry = asked.length ? [] : state.family.approved.slice(0, 3).map(id => activityQuestion(id));
  const rows = items.map(item => {
    const mode = activity(item.activityId)?.mode === 'together' ? 'Together' : 'On their own';
    const chosen = feeling(item.feeling);
    return `<tr><td>${formatDate(item.date)}</td><td>${esc(translate(item.title))}</td><td>${esc(translate(mode))}</td><td>${chosen ? `${chosen.emoji} ${esc(translate(chosen.word))}` : '–'}</td><td>${esc(translate(item.status === 'approved' ? 'Approved' : 'Awaiting review'))}</td></tr>`;
  }).join('');
  return `${pageHeader('FAMILY REPORT · DEMO', 'Weekly family report', 'A summary of the last 7 days to take home or share at a school sharing session.')}
  <div class="report-actions no-print"><button class="button primary" data-action="print-report">Print / save as PDF ⎙</button><span class="helper">Tip: choose “Save as PDF” as the printer to keep a copy.</span></div>
  <article class="panel report">
    <header class="report-head"><div><span class="eyebrow">TOGETHER TIME · WEEKLY FAMILY REPORT</span><h2>${esc(localText(`${state.profile.name}’s week`, `${state.profile.name}的一星期`))}</h2><p>${esc(range)}</p></div><span class="report-mark" aria-hidden="true">✳</span></header>
    <p class="report-demo">Demo report: made from data saved in this browser (sample or entered by a family member). Screen time is entered by hand, not measured.</p>
    <div class="report-stats">
      <div><b>${done.length}</b><span>Activities completed</span><small>${esc(localText(`${items.length} shared in total`, `一共分享了 ${items.length} 次`))}</small></div>
      <div><b>${together} · ${items.length - together}</b><span>Together · on their own</span><small>${esc(localText(`${together} together, ${items.length - together} solo`, `${together} 次一起做，${items.length - together} 次自己做`))}</small></div>
      <div><b>${screen.total} <small>min</small></b><span>Screen time recorded</span><small>${esc(localText(`Recorded on ${screen.days} of 7 days`, `7 天中有 ${screen.days} 天有記錄`))}</small></div>
    </div>
    <section><h3>${esc(localText(`How ${state.profile.name} felt`, `${state.profile.name}的感受`))}</h3>${counts.length ? `<ul class="feeling-counts">${counts.map(item => `<li><span aria-hidden="true">${item.emoji}</span><b>${item.count}</b><small>${esc(translate(item.word))}</small></li>`).join('')}</ul>` : `<p class="empty-copy">No feelings were shared this week.</p>`}</section>
    <section><h3>Activities</h3>${rows ? `<div class="report-table-wrap"><table class="report-table"><thead><tr><th>Date</th><th>Activity</th><th>Who</th><th>Feeling</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="empty-copy">${esc(localText(`No activities were shared in the last 7 days. Try one together with ${state.profile.name} this week!`, `過去 7 天沒有分享活動。這星期和${state.profile.name}一起試一個吧！`))}</p>`}</section>
    <section><h3>${asked.length ? 'Conversation questions used' : 'Conversation questions to try'}</h3><ul class="report-questions">${(asked.length ? asked : toTry).map(question => `<li>“${esc(question)}”</li>`).join('')}</ul></section>
    <footer class="report-foot">${esc(localText(`Made with the Together Time prototype for ${state.profile.name} on ${formatDate(new Date())}. Demo only.`, `由 Together Time 原型於 ${formatDate(new Date())} 為${state.profile.name}製作。只供示範。`))}</footer>
  </article>`;
}
