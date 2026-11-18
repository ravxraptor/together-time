/* Keep the prototype's family workspace on this browser. */
const KEY='together-time-demo-v1';
const DEFAULTS={
  profile:{name:'Milo',age:'7',avatar:'🐻',interests:['Art & making','Building','Puzzles'],together:['Reading stories','Drawing together'],time:'15',materials:'Paper and crayons',surveyDone:false},
  family:{code:'TT-7429',linked:true,reviewMode:'parent',limit:60,bedtime:'20:00',screenStart:'',screenEnd:'',manualLock:false,paused:false,apps:['Video apps','Games'],approved:['draw','build','puzzle','story','cards','mystery','storystarter'],recordedMinutes:35},
  submissions:[], stars:0, child:'home', parent:'overview', view:'child', chosen:null, filter:'all'
};
let state;
/** Load saved state or start a new example family. */
function loadState(){try{const saved=JSON.parse(localStorage.getItem(KEY));return migrateState(saved?{...structuredClone(DEFAULTS),...saved,profile:{...DEFAULTS.profile,...saved.profile},family:{...DEFAULTS.family,...saved.family}}:structuredClone(DEFAULTS));}catch{return migrateState(structuredClone(DEFAULTS));}}
/** Offer newly added default activities once, without undoing a parent's later choices. */
function migrateState(data){const known=data.family.knownActivities||[];const added=['mystery','storystarter'].filter(id=>!known.includes(id)&&!data.family.approved.includes(id));data.family.approved=[...data.family.approved,...added];data.family.knownActivities=CATALOG.map(item=>item.id);return data;}
/** Persist the current workspace and keep errors visible. */
function saveState(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{toast('This browser is full. Try a smaller photo.');return false;}}
/** Escape user-provided text before inserting it in markup. */
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
/** Find a catalogue item by its stable ID. */
function activity(id){return CATALOG.find(item=>item.id===id)||findCustomActivity(id);}
/** Format a saved date for the parent dashboard. */
function formatDate(date){return new Date(date).toLocaleDateString('en-HK',{month:'short',day:'numeric'});}
/** Return pending submissions for the linked child. */
function pending(){return state.submissions.filter(item=>item.status==='pending');}
/** Return completed submissions. */
function completed(){return state.submissions.filter(item=>item.status==='approved');}
state=loadState();
