/* Child-facing activity and profile screens. */
/** Render the child's landing page and recommended activity. */
function childHome(){const items=availableActivities();const best=items.find(a=>state.profile.interests.includes(a.category))||items[0];return `<div class="child-hero"><div class="hero-copy"><span class="pill sun">✦ &nbsp; LITTLE MOMENTS, BIG CONNECTION</span><h1>Hi, ${esc(state.profile.name)}!<br>Ready for <span>something fun?</span></h1><p>Pick a little adventure, make something wonderful, and share it with your grown-up.</p><div class="hero-actions"><button class="button primary" data-action="nav" data-page="explore">Explore activities <span>↗</span></button><button class="button ghost" data-action="nav" data-page="profile">My likes ♡</button></div></div><div class="hero-art" aria-hidden="true"><div class="sun-shape">✳</div><div class="art-circle"><span class="paper">✏</span><span class="blocks">▰</span><span class="sparkle">✧</span></div><div class="floating-note">made with curiosity <b>♡</b></div></div></div><div class="home-status">${childDayStatus()}${childPlanStatus()}</div><div class="home-intro"><div><span class="eyebrow">A LITTLE SOMETHING FOR YOU</span><h2>What shall we do today?</h2><p>Ideas inspired by your favourite things.</p></div><button class="plain-link" data-action="nav" data-page="explore">See available activities →</button></div>${best?`<div class="featured">${activityCard(best)}<div class="together-note"><span class="note-icon">♡</span><div><span class="eyebrow">MAKE TIME TOGETHER</span><h3>Little things matter.</h3><p>Share your creation with your grown-up and tell them all about it.</p><button class="plain-link" data-action="nav" data-page="progress">See my creations →</button></div></div></div>`:'<div class="empty">Ask your grown-up to choose some activities for you.</div>'}<div class="bottom-space">${progressStrip()}</div>`;}
/** Render an activity catalogue filtered by approved activities. */
function childExplore(){const approved=availableActivities();const shown=approved.filter(a=>state.filter==='all'||a.mode===state.filter);return `${pageHeader('YOUR LITTLE ADVENTURES','Available activities','Choose something your grown-up has made available.')}<div class="notice">${esc(activityModeNote())}${currentActivityBlock()?.activityMode === 'ai' ? ' · Built-in mock suggestions' : ''}</div>${currentActivityBlock()?.activityMode === 'ai' ? '<button class="button outline" data-action="next-plan-idea">✨ Show another idea</button>' : ''}<div class="toolbar"><div class="filter-tabs"><button class="filter ${state.filter==='all'?'active':''}" data-action="filter" data-value="all">All ideas</button><button class="filter ${state.filter==='solo'?'active':''}" data-action="filter" data-value="solo">Just for me</button><button class="filter ${state.filter==='together'?'active':''}" data-action="filter" data-value="together">Together</button></div><span class="toolbar-note">${shown.length} little ideas ✨</span></div><div class="activity-grid">${shown.map(a=>activityCard(a)).join('')||'<div class="empty">No activities here yet. Ask your grown-up to add some.</div>'}</div>`;}
/** Render the child profile and interest survey. */
function childProfile() {
  return `${pageHeader('ALL ABOUT YOU','My little profile','Tell us what makes you smile. You can change your answers anytime.')}
  <form id="survey-form" class="profile-grid"><div class="panel profile-main">
    <div class="section-number">01 / ABOUT ME</div><h2>Let’s get to know you</h2>
    <label class="field">What should we call you?<input name="name" maxlength="24" required value="${esc(state.profile.name)}"></label>
    <h3>🎂 How old are you?</h3>${pictureChoices('age',state.profile.age)}
    <h3>🎨 What do you like doing on your own?</h3><p class="muted">Choose as many as you like.</p><div class="chips">${chips(INTERESTS,state.profile.interests,'interests')}</div>
    <h3>👨‍👩‍👧 What do you like doing with your grown-up?</h3><p class="muted">Choose as many as you like.</p><div class="chips">${chips(TOGETHER,state.profile.together,'together')}</div>
    <div class="divider"></div><h3>More things you love ✨</h3><p class="muted">These are optional and help us make ideas just for you.</p>
    <h3>🐾 What is your favourite animal?</h3>${animalPicker(state.profile.animal)}
    <h3>🌈 What is your favourite colour?</h3>${pictureChoices('color',state.profile.color)}
    <h3>⭐ What is a hobby you love?</h3>${pictureChoices('hobby',state.profile.hobby)}
    <h3>🌍 What kind of place do you love?</h3>${pictureChoices('place',state.profile.place)}
    <h3>⏱️ How long do you like to play?</h3>${pictureChoices('time',state.profile.time)}
    <h3>🧺 What can you use?</h3><p class="muted">Choose as many as you like.</p>${pictureChoices('materials',state.profile.materials,true)}
    <button class="button primary" type="submit">Save my favourites ♡</button></div>
    <aside class="profile-side"><div class="avatar-bubble">${state.profile.avatar}</div><span class="eyebrow">MY PROFILE</span><h2>${esc(state.profile.name)}’s world</h2><p>Your favourites stay on this browser in this prototype.</p><div class="divider"></div><b>Family code to share with your grown-up</b><div class="family-code">${esc(state.family.code)}</div><b>My favourite things</b><div class="tags">${tags(state.profile.interests)}</div><b>Things to do together</b><div class="tags">${tags(state.profile.together)}</div></aside></form>`;
}
/** Render the child's achievements and submission history. */
function childProgress(){return `${pageHeader('YOUR LITTLE WINS','Look what you made!','Every little moment counts.')} ${progressStrip()}<div class="section-head"><div><span class="eyebrow">MADE BY YOU</span><h2>My creations</h2></div></div><div class="submission-grid">${state.submissions.length?state.submissions.slice().reverse().map(item=>`<article class="creation"><div class="creation-image">${item.image?`<img src="${item.image}" alt="Uploaded activity creation">`:'<span>🎨</span>'}</div><div class="creation-info"><span class="status ${item.status}">${item.status==='approved'?'✓ Shared':'◷ Waiting for review'}</span>${item.demo?' <span class="demo-chip">Demo sample</span>':''}<h3>${esc(item.title)}</h3><p>${formatDate(item.date)}</p>${feelingChip(item.feeling)}${item.note?`<p>“${esc(item.note)}”</p>`:''}</div></article>`).join(''):'<div class="empty">Your creations will appear here after you share an activity. ✨</div>'}</div>`;}

/** Show the family’s planned screen window and current demo lock. */
function childScreen() {
  const family = state.family;
  const locked = family.manualLock || family.paused;
  const windowText = family.screenStart && family.screenEnd
    ? `${esc(family.screenStart)} – ${esc(family.screenEnd)}`
    : 'Ask your grown-up to set a time.';
  return `${pageHeader('YOUR FAMILY PLAN','My screen time','See the screen-time plan you made with your grown-up.')}
    ${plannerMarkup(false)}
    <div class="parent-columns">
      <section class="panel soft-peach">
        <span class="eyebrow">YOUR SCREEN-TIME WINDOW · EVERY DAY</span>
        <h2>🕒 ${windowText}</h2>
        <p>Your grown-up can change this plan whenever you need to.</p>
        <div class="divider"></div>
        <h3>Daily family goal: ${Number(family.limit)} minutes</h3>
        <p>Bedtime reminder: ${esc(family.bedtime || 'Not set')}</p>
        <p class="helper">This is the family plan, not a live timer. Your grown-up records usage by hand.</p>
      </section>
      <section class="panel">
        <span class="eyebrow">RIGHT NOW · DEMO</span>
        <h2>${locked ? '🌼 It’s time for an offline break' : '✨ No demo break is on'}</h2>
        <p>${locked ? `Unavailable in the demo: ${esc(state.family.manualLock ? lockDescription() : ((state.family.apps || []).join(', ') || 'Entertainment apps'))}. Pick an offline activity.` : 'Check your family’s planned screen time and ask your grown-up if you are unsure.'}</p>
        <button class="button primary" data-action="nav" data-page="explore">Find an offline activity →</button>
      </section>
    </div>`;
}
