/* Shared presentation pieces for both family views. */
const CHILD_NAV=[['home','⌂','My day'],['explore','✿','Explore'],['screen','◷','Screen time'],['progress','☆','My progress'],['profile','☺','My profile']];
const PARENT_NAV=[['overview','▦','Overview'],['activities','✿','Activities'],['reviews','▧','Photo reviews'],['settings','◷','Screen time'],['family','♡','Family & linking']];
/** Show a brief confirmation without interrupting the current screen. */
function toast(message){const node=document.querySelector('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),3500);}
/** Render a sidebar navigation with the active screen indicated. */
function navMarkup(items,active){return items.map(([id,icon,label])=>`<button class="nav-item ${active===id?'active':''}" data-action="nav" data-page="${id}" ${active===id?'aria-current="page"':''}><span class="nav-icon">${icon}</span><span>${label}</span>${id==='reviews'&&pending().length?`<em>${pending().length}</em>`:''}</button>`).join('');}
/** Render one selectable activity card. */
function activityCard(item,compact=false){return `<button class="activity-card ${compact?'compact':''}" data-action="activity" data-id="${item.id}"><span class="activity-illustration tone-${item.id}"><span>${item.icon}</span></span><span class="activity-content"><span class="eyebrow">${esc(item.category)} <b>·</b> ${item.minutes} MIN</span><strong>${esc(item.title)}</strong><span class="card-description">${esc(item.description)}</span><span class="text-link">Let's play <span>↗</span></span></span></button>`;}
/** Render a profile tag list with an accessible empty state. */
function tags(values){return values.length?values.map(v=>`<span class="tag">${esc(v)}</span>`).join(''):'<span class="empty-copy">No choices yet</span>';}
/** Return sample-friendly category chips. */
function chips(items,selected,name){const icons={'Art & making':'🎨','Building':'🧱','Puzzles':'🧩','Stories':'📖','Games':'🎲','Nature':'🌿','Music':'🎵','Movement':'🏃','Reading stories':'📚','Drawing together':'🖍️','Playing games':'🎲','Going outside':'🌳','Making things':'✂️','Music & dancing':'💃'};return items.map(item=>`<label class="choice-chip"><input type="checkbox" name="${name}" value="${esc(item)}" ${selected.includes(item)?'checked':''}><span>${state.view==='child'&&icons[item]?icons[item]+' ':''}${esc(item)}</span></label>`).join('');}
/** Render a top-level page heading. */
function pageHeader(kicker,title,description){return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${description}</p></div></div>`;}
/** Display an accessible in-page dialog. */
function dialog(html){const root=document.querySelector('#modal-root');root.innerHTML=`<div class="modal-backdrop" data-action="dismiss"><section class="modal" role="dialog" aria-modal="true" aria-label="Activity details"><button class="close" aria-label="Close" data-action="close">×</button>${html}</section></div>`;localizeUI(root);root.querySelector('button.close').focus();}
/** Render an illustrative progress strip. */
function progressStrip(){const count=completed().length;return `<div class="progress-strip"><div><b>${count}</b><span>activities finished</span></div><div><b>${state.stars}</b><span>little stars</span></div><div><b>${pending().length}</b><span>waiting to share</span></div></div>`;}
