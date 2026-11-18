/* Activity-goal progress for each simulated scheduled restriction. */
/** Return a local YYYY-MM-DD date for a submission timestamp. */
function submissionDay(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
/** Count approved submissions made during this plan's restriction window. */
function rewardProgress(block, date) {
  const goal = Number(block.unlockGoal) || 0;
  const count = state.submissions.filter(item => {
    const at = new Date(item.date);
    const time = at.getHours() * 60 + at.getMinutes();
    return item.status === 'approved' && item.planId === activePlan().id && submissionDay(item.date) === date && time >= minutes(block.start) && time < minutes(block.end);
  }).length;
  return {goal, count, reached: goal > 0 && count >= goal};
}
/** Display goal progress, without claiming actual access was changed. */
function rewardLabel(block, date) {
  const {goal,count,reached} = rewardProgress(block,date);
  if (!goal) return '';
  return reached ? `Goal met: ${count}/${goal} approved · demo unlock` : `Approved activities: ${count}/${goal} · demo unlock at goal`;
}
/** List current schedule windows whose activity goal has been reached. */
function unlockedRestrictions() {
  const now = new Date();
  const time = now.getHours() * 60 + now.getMinutes();
  return planBlocks().filter(block => block.type === 'restriction' && occursOn(block, localDate()) && minutes(block.start) <= time && time < minutes(block.end) && rewardProgress(block, localDate()).reached);
}
