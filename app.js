/* Navigation and interactions for the Together Time prototype. */
/** Render the selected child or caregiver screen. */
function render(){const child=state.view==='child';const active=child?state.child:state.parent;const views={home:childHome,explore:childExplore,progress:childProgress,profile:childProfile,screen:childScreen,overview:parentOverview,activities:parentActivities,reviews:parentReviews,settings:parentSettings,family:parentFamily};document.querySelector('#app').innerHTML=`<div class="shell"><aside class="sidebar"><button class="brand" data-action="home"><span class="brand-mark">✳</span><span>together<span class="brand-accent">time</span><small>LITTLE MOMENTS, BIG CONNECTION</small></span></button><div class="sidebar-label">${child?'YOUR SPACE':'FAMILY DASHBOARD'}</div><nav aria-label="Main navigation">${navMarkup(child?CHILD_NAV:PARENT_NAV,active)}</nav><div class="side-card"><span>✺</span><b>${child?'A little less screen.':'Made for real life.'}</b><p>${child?'A little more wonder.':'Small moments add up.'}</p></div><button class="switch-view" data-action="switch"><span>${child?'◷':'☺'}</span><span>${child?'Parent space':'Child space'}<small>${child?'Manage family settings':'Back to the adventure'}</small></span><b>↗</b></button></aside><main class="main"><header class="topbar"><button class="mobile-brand" data-action="home"><span>✳</span> together<b>time</b></button><div class="breadcrumb">${child?'MY SPACE':'PARENT SPACE'} <span> / </span> ${esc((child?CHILD_NAV:PARENT_NAV).find(x=>x[0]===active)?.[2]||'')}</div><div class="top-actions">${languageControl()}<span class="preview-pill">✦ &nbsp; DEMO FAMILY</span><button class="view-toggle" data-action="switch">${child?'Parent space ↗':'Child space ↗'}</button><span class="top-avatar">${child?state.profile.avatar:'♡'}</span></div></header><div class="content">${child ? listenControls() : ''}${child && active !== 'home' ? childLockStatus() : ''}${(views[active]||childHome)()}</div><nav class="mobile-nav" aria-label="Mobile navigation">${(child?CHILD_NAV:PARENT_NAV).map(([id,icon,label])=>`<button class="${active===id?'active':''}" data-action="nav" data-page="${id}"><span>${icon}</span>${label}</button>`).join('')}</nav><footer class="footer"><span>✳ &nbsp; made for little moments</span><span>Prototype · Saved on this browser</span></footer></main></div>`;localizeUI(document.querySelector('#app'));}
/** Open a single activity with an optional photo submission form. */
function showActivity(id){const item=activity(id);if(!item)return;if(state.view==='child'&&!availableActivities().some(entry=>entry.id===id)){toast('This activity is not available right now.');return;}state.chosen=id;state.draftIdea='';state.selectedIdea='';dialog(`<div class="modal-illustration tone-${item.id}">${item.icon}</div><span class="eyebrow">${esc(item.category)} · ${item.minutes} MIN · ${item.mode==='solo'?'JUST FOR ME':'TOGETHER'}</span><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><div class="materials">✳ &nbsp; You’ll need: ${esc(item.materials)}</div><div class="idea-box"><span class="eyebrow">NEED A LITTLE INSPIRATION?</span><p>Get a fun idea based on what you like!</p><button class="button outline" data-action="next-child-idea">✨ Give me an idea</button><div id="activity-idea" aria-live="polite"></div><small>Ideas come from on-device AI when your browser has it, or from our built-in library.</small></div><div class="detail-actions"><button class="button outline" data-action="read-aloud">♪ Read it to me</button><button class="button primary" data-action="share-form">I made something! →</button></div>`);}
/** Open a form for sharing an activity creation. */
function showShareForm(){const item=activity(state.chosen);if(!item)return;dialog(`<span class="eyebrow">SHARE YOUR LITTLE WIN</span><h2>Show us what you made! ✨</h2><p>Take a picture of your creation and tell your grown-up about it.</p>${state.selectedIdea?`<div class="prompt-card"><b>Your chosen idea</b><p>${esc(state.selectedIdea)}</p></div>`:''}<form id="submission-form"><label class="upload-zone"><span>▧</span><b>Choose a photo</b><small>Photograph the activity, without people or personal details.</small><input type="file" accept="image/*" name="photo" required></label><label class="field">Want to say something? <span class="optional">optional</span><textarea name="note" maxlength="180" placeholder="My favourite part was…"></textarea></label><button class="button primary full" type="submit">Share my creation ♡</button></form><p class="helper">Photos are saved only in this browser for the demonstration.</p>`);}
/** Show a built-in activity suggestion based on the child’s stored interests. */
function showIdea(){const found=CATALOG.filter(a=>state.family.approved.includes(a.id));const preferred=found.find(a=>state.profile.interests.includes(a.category))||found[0];if(!preferred){toast('Choose an activity in the library first.');return;}dialog(`<span class="eyebrow">A LITTLE IDEA FOR ${esc(state.profile.name.toUpperCase())}</span><div class="modal-illustration tone-${preferred.id}">${preferred.icon}</div><h2>${esc(preferred.title)}</h2><p>${esc(preferred.description)}</p><div class="materials">✳ &nbsp; ${preferred.minutes} minutes · ${esc(preferred.materials)}</div>${questionMarkup(activityQuestion(preferred.id),'Talk about it later')}<p class="helper">The example above comes from the built-in library. AI ideas run on-device in supported Chrome browsers; elsewhere you will see a labelled demo idea.</p><button class="button outline full" data-action="ai-suggest">Generate a new AI idea ✨</button><div id="ai-result" class="ai-result" aria-live="polite"></div><button class="button primary full" data-action="close">Lovely, thanks ♡</button>`);}
/** Show the details and limitations of the local photo review. */
function showReview(id){const item=state.submissions.find(x=>x.id===id);if(!item)return;dialog(`<span class="eyebrow">ACTIVITY SUBMISSION</span><h2>${esc(item.title)}</h2>${item.image?`<img class="detail-photo" src="${item.image}" alt="Activity photo">`:''}<p>${item.note?`Child’s note: “${esc(item.note)}”`:'No note was added.'}</p><div class="notice"><b>Caregiver review</b><br>On-device AI can describe the photo in supported Chrome browsers; elsewhere a labelled demo note is shown. Please make the final decision yourself.</div><button class="button outline full" data-action="ai-describe" data-id="${item.id}">Ask AI about the photo ✨</button><div id="ai-result" class="ai-result" aria-live="polite">${aiNoteMarkup(item)}</div>${item.status==='pending'?`<button class="button primary full" data-action="approve" data-id="${item.id}">Approve activity ✓</button>`:''}`);}
/** Decode any browser-readable image file into a drawable source. */
async function decodeImage(file){if(window.createImageBitmap){try{return await createImageBitmap(file,{imageOrientation:'from-image'});}catch{}}const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();return img;}finally{setTimeout(()=>URL.revokeObjectURL(url),1000);}}
/** Shrink a photo to at most 1280px on its longest side and re-encode it as JPEG. */
async function resizeImage(file,maxSide=1280,quality=.8){const source=await decodeImage(file);const width=source.width||source.naturalWidth;const height=source.height||source.naturalHeight;if(!width||!height)throw new Error('empty image');const scale=Math.min(1,maxSide/Math.max(width,height));const canvas=document.createElement('canvas');canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(source,0,0,canvas.width,canvas.height);if(source.close)source.close();return canvas.toDataURL('image/jpeg',quality);}
/** Submit a photo after resizing it into this browser's local storage. */
async function saveSubmission(form){const file=form.elements.photo.files[0];if(!file)return;const button=form.querySelector('button[type="submit"]');if(button)button.disabled=true;let image;try{image=await resizeImage(file);}catch{if(button)button.disabled=false;toast('We couldn’t open that photo. Please try a different picture.');return;}const item=activity(state.chosen);const auto=state.family.reviewMode==='auto';const wasPaused=state.family.paused;const id=crypto.randomUUID();state.submissions.push({id,activityId:item.id,title:item.title,idea:state.selectedIdea||'',planId:activePlan().id,image,note:form.elements.note.value.trim(),date:new Date().toISOString(),status:auto?'approved':'pending'});if(auto){state.stars++;state.family.paused=false;}if(!saveState()){state.submissions.pop();if(auto){state.stars--;state.family.paused=wasPaused;}if(button)button.disabled=false;return;}document.querySelector('#modal-root').innerHTML='';state.child='progress';render();toast(auto?'Your creation is shared!':'Shared with your grown-up for review.');if(state.family.reviewMode==='ai')aiCheckSubmission(id,state.languages?.parent||'en').then(()=>{if(state.view==='parent')render();});}
/** Save profile choices from the child survey. */
function saveSurvey(form){const data=new FormData(form);state.profile={...state.profile,name:String(data.get('name')).trim(),age:data.get('age'),interests:data.getAll('interests'),together:data.getAll('together'),time:data.get('time'),materials:(data.getAll('materialChoices').length ? data.getAll('materialChoices').join(', ') : String(data.get('materials')||'').trim()),animal:String(data.get('animal')||'').trim(),color:String(data.get('color')||'').trim(),hobby:String(data.get('hobby')||'').trim(),place:String(data.get('place')||'').trim(),surveyDone:true};saveState();render();toast('Your favourites are saved!');}
/** Store the caregiver's selected settings. */
function saveSettings(form){const data=new FormData(form);const start=data.get('screenStart')||'';const end=data.get('screenEnd')||'';if(Boolean(start)!==Boolean(end)){toast('Please set both screen-time window times, or leave both blank.');return;}state.family={...state.family,screenStart:start,screenEnd:end,limit:Number(data.get('limit')),recordedMinutes:Number(data.get('recordedMinutes')),bedtime:data.get('bedtime'),apps:data.getAll('apps'),reviewMode:data.get('reviewMode')};saveState();render();toast('Your family routine is saved.');}
/** Handle form submissions for all views. */
document.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'survey-form') saveSurvey(form);
  if (form.id === 'submission-form') saveSubmission(form);
  if (form.id === 'settings-form') saveSettings(form);
  if (form.id === 'approved-form') {
    state.family.approved = new FormData(form).getAll('approved');
    saveState();
    render();
    toast('Activity choices saved.');
  }
  if (form.id === 'link-form') {
    const code = form.elements.code.value.trim().toUpperCase();
    if (code !== state.family.code) {
      toast('That code does not match this browser’s demo profile.');
      return;
    }
    state.family.linked = true;
    saveState();
    render();
    toast('Child profile linked in this browser.');
  }
});
/** Route button clicks and keep UI state synchronized. */
document.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (action === 'dismiss' && event.target !== target) return;
  if (action === 'nav') {
    state[state.view] = target.dataset.page;
    if (state.view === 'child' && target.dataset.page === 'explore') state.filter = 'all';
    saveState();
    render();
    window.scrollTo(0, 0);
  }
  if (action === 'home') {
    state[state.view] = state.view === 'child' ? 'home' : 'overview';
    saveState();
    render();
  }
  if (action === 'switch') {
    state.view = state.view === 'child' ? 'parent' : 'child';
    saveState();
    render();
    window.scrollTo(0, 0);
  }
  if (action === 'today-schedule') {
    plannerDate = localDate();
    state.view = 'child';
    state.child = 'screen';
    saveState();
    render();
    window.scrollTo(0, 0);
  }
  if (action === 'filter') { state.filter = target.dataset.value; render(); }
  if (action === 'activity') showActivity(id);
  if (action === 'next-plan-idea') {
    const block = currentActivityBlock();
    if (block?.activityMode === 'ai') {
      state.aiActivityIndexes = {...state.aiActivityIndexes, [block.id]: (state.aiActivityIndexes?.[block.id] || 0) + 1};
      state.filter = 'all'; saveState(); render();
    }
  }
  if (action === 'open-available') {
    document.querySelector('#modal-root').innerHTML = '';
    state.view = 'child'; state.child = 'explore'; state.filter = 'all'; saveState(); render(); window.scrollTo(0, 0);
  }

  if (action === 'read-page') speakText(document.querySelector('.content')?.innerText || '');
  if (action === 'listen-mode') { listenMode = !listenMode; render(); }
  if (action === 'stop-reading' && window.speechSynthesis) window.speechSynthesis.cancel();
  if (action === 'next-child-idea') nextChildIdea();
  if (action === 'use-child-idea') useChildIdea();
  if (action === 'share-form') showShareForm();
  if (action === 'idea') showIdea();
  if (action === 'ai-suggest') aiSuggest();
  if (action === 'ai-describe') aiDescribe(id);
  if (action === 'review-detail') showReview(id);
  if (action === 'ai-review-now') { showReview(id); aiDescribe(id); }
  if (action === 'close' || action === 'dismiss') document.querySelector('#modal-root').innerHTML = '';
  if (action === 'open-child-profile') {
    state.view = 'child';
    state.child = 'profile';
    saveState();
    render();
    window.scrollTo(0, 0);
  }
  if (action === 'read-aloud') {
    const item = activity(state.chosen);
    speakText(`${translate(item.title)}. ${translate(item.description)}`);
  }
  if (action === 'unlink') {
    state.family.linked = false;
    saveState();
    render();
    toast('Profile unlinked in this browser.');
  }
  if (action === 'manual-lock') {
    if (!state.family.manualLock) showLockSettings();
    else {
      state.family.manualLock = false;
      saveState();
      render();
      toast('Parent demo lock is off.');
    }
  }
  if (action === 'edit-lock' && state.family.manualLock) showLockSettings();
  if (action === 'pause-toggle') {
    state.family.paused = !state.family.paused;
    saveState();
    render();
    toast(state.family.paused ? 'Demo break started.' : 'Demo break ended.');
  }
  if (action === 'approve') {
    const item = state.submissions.find(entry => entry.id === id);
    if (item && item.status !== 'approved') {
      item.status = 'approved';
      state.stars++;
      state.family.paused = false;
      saveState();
      document.querySelector('#modal-root').innerHTML = '';
      render();
      toast(state.family.manualLock ? 'Activity approved. The parent lock is still on.' : 'Activity approved. Demo access is available.');
    }
  }
  if (action === 'delete-submission') {
    state.submissions = state.submissions.filter(entry => entry.id !== id);
    saveState();
    render();
    toast('Photo removed from this browser.');
  }
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelector('#modal-root').innerHTML='';});
render();
