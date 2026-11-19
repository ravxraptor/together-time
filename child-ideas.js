/* Child-friendly ideas from a small built-in library; this is not generative AI. */
/* Each template lists the profile fields it needs, so it is only used when those
   answers exist. Every activity also has templates that need nothing, so each
   sentence reads naturally whether or not the optional questions were answered. */
const PLACE_PHRASES = {Ocean: 'the ocean', Forest: 'a forest', Space: 'space', Park: 'the park', Beach: 'the beach'};
const IDEA_TEMPLATES = {
  draw: [
    [['animal', 'place', 'color'], p => `Draw ${p.animal} exploring ${p.place}. Add something ${p.color}.`, p => `畫一隻${p.animal}去${p.place}探險，再加一樣${p.color}的東西。`],
    [['animal', 'hobby'], p => `Draw ${p.animal} that loves ${p.hobby}.`, p => `畫一隻喜歡${p.hobby}的${p.animal}。`],
    [['color'], p => `Draw your happy place at night. Make one thing glow ${p.color}!`, p => `畫出你的快樂地方在晚上的樣子，讓一樣東西發出${p.color}的光！`],
    [['place'], p => `Draw ${p.place} with a secret door hidden somewhere. Where does it lead?`, p => `畫出${p.place}，在某處藏一道秘密門。這道門通往哪裏？`],
    [[], () => 'Turn your drawing into a postcard! Add a short message to someone you’d love to invite to this place.', () => '把你的畫變成一張明信片！寫一句短短的話，邀請一個你想帶來這裏的人。'],
    [[], () => 'Draw a friendly animal on an adventure.', () => '畫一隻友善的動物去探險。'],
  ],
  build: [
    [['animal'], p => `Build a little home for ${p.animal} using blocks or boxes.`, p => `用積木或盒子為${p.animal}砌一個小屋。`],
    [['place', 'color'], p => `Build a tiny model of ${p.place} and add something ${p.color}.`, p => `砌一個小小的${p.place}，再加一樣${p.color}的東西。`],
    [['animal', 'hobby'], p => `Build a place where ${p.animal} could enjoy ${p.hobby}.`, p => `砌一個讓${p.animal}可以${p.hobby}的地方。`],
    [[], () => 'Build the tallest tower you can, then make a bridge next to it.', () => '砌一座最高的塔，再在旁邊砌一條橋。'],
    [[], () => 'Give your town a name, then build a road so a toy car can visit every building.', () => '為你的小鎮改個名字，再砌一條路，讓玩具車可以去到每一座建築物。'],
  ],
  puzzle: [
    [['color'], p => `Find a puzzle piece with some ${p.color} on it, then find its neighbour.`, p => `找一塊有${p.color}的拼圖，再找出它旁邊的那一塊。`],
    [['place'], p => `Look for pieces that remind you of ${p.place}, then connect them.`, p => `找一些讓你想起${p.place}的拼圖，把它們拼起來。`],
    [[], () => 'Can you find and connect three pieces with matching colours?', () => '你能找出三塊顏色相近的拼圖，把它們拼起來嗎？'],
    [[], () => 'Start with the edge pieces and build the frame first.', () => '先找邊框的拼圖，把外框拼好。'],
  ],
  story: [
    [['animal', 'place'], p => `With your grown-up, tell a story about ${p.animal} visiting ${p.place}.`, p => `和大人一起編一個${p.animal}去${p.place}的故事。`],
    [['animal', 'hobby'], p => `Take turns telling a story where ${p.animal} tries ${p.hobby}.`, p => `輪流說故事：一隻${p.animal}第一次試${p.hobby}。`],
    [['color'], p => `Make up a story together about a mysterious ${p.color} box.`, p => `一起編一個關於神秘${p.color}盒子的故事。`],
    [[], () => 'Take turns telling a story about a toy that comes to life at night.', () => '輪流說一個玩具在晚上活起來的故事。'],
    [[], () => 'Ask your grown-up to help tell a story about making a new friend.', () => '請大人和你一起編一個交新朋友的故事。'],
  ],
  cards: [
    [['color'], p => `Play a matching game with your grown-up. Look for ${p.color} cards first.`, p => `和大人玩配對遊戲，先找${p.color}的卡。`],
    [['place'], p => `Take turns finding pairs. Each pair is a clue for a trip to ${p.place}!`, p => `輪流找配對，每一對都是去${p.place}的線索！`],
    [['animal'], p => `Make a tiny card game with your grown-up about ${p.animal}.`, p => `和大人一起創作一個關於${p.animal}的卡牌遊戲。`],
    [[], () => 'Take turns picking a card and naming something you both enjoy.', () => '輪流抽卡，說一件你們都喜歡做的事。'],
  ],
  move: [
    [['color'], p => `With a trusted adult, look for something ${p.color} in a safe outdoor place.`, p => `和信任的大人在安全的戶外找一樣${p.color}的東西。`],
    [['animal'], p => `With a trusted adult, look for three shapes that remind you of ${p.animal}.`, p => `和信任的大人找三個讓你想起${p.animal}的形狀。`],
    [['place'], p => `With a trusted adult, find two things you might also see in ${p.place}.`, p => `和信任的大人找兩樣在${p.place}也可能看到的東西。`],
    [[], () => 'With a trusted adult, look for something smooth and something colourful.', () => '和信任的大人找一樣光滑和一樣多彩的東西。'],
  ],
  music: [
    [['animal'], p => `Tap a rhythm that sounds like ${p.animal} walking.`, p => `拍一個像${p.animal}走路的節奏。`],
    [['place'], p => `Make up a little dance for a trip to ${p.place}.`, p => `想像去${p.place}，創作一段小舞蹈。`],
    [['hobby'], p => `Tap a beat for ${p.hobby}, then make it a little faster.`, p => `為${p.hobby}拍一個節奏，再拍快一點。`],
    [[], () => 'Make a quiet rhythm, then a loud one. Which do you like more?', () => '先拍一個輕輕的節奏，再拍一個大聲的。你比較喜歡哪一個？'],
  ],
  colour: [
    [['color'], p => `Find something ${p.color}, then line up three more things from lightest to darkest.`, p => `找一樣${p.color}的東西，再找三樣東西，由最淺到最深排成一行。`],
    [['place'], p => `Find three colours you might see in ${p.place}.`, p => `找三種在${p.place}可能看到的顏色。`],
    [['animal'], p => `Find two colours you would use to draw ${p.animal}.`, p => `找兩種你畫${p.animal}時會用的顏色。`],
    [[], () => 'Make a rainbow! Line up the five colourful things you found in rainbow order.', () => '排一條彩虹！把你找到的五樣彩色東西，按彩虹的次序排成一行。'],
  ],
  mystery: [
    [['color'], p => `Ask your grown-up to hide something ${p.color}. Before you guess, describe it in three words!`, p => `請大人藏一樣${p.color}的東西。猜之前，先用三個詞形容它！`],
    [['animal'], p => `Pretend you are ${p.animal} looking for treasure. Feel inside the box and guess!`, p => `假裝你是一隻${p.animal}在找寶物。摸摸盒子裏面，猜猜是甚麼！`],
    [[], () => 'Before you touch, shake the box gently and listen. Can you guess from the sound alone?', () => '摸之前，先輕輕搖一搖盒子，聽一聽。只聽聲音你能猜到嗎？'],
    [[], () => 'Ask your grown-up for three clues, one at a time. Can you guess before the last clue?', () => '請大人一次給你一個線索，一共三個。你能在最後一個線索之前猜到嗎？'],
    [[], () => 'Swap roles: you hide something and give your grown-up the clues!', () => '交換角色：你來藏東西，再給大人線索！'],
  ],
  storystarter: [
    [['animal', 'place'], p => `Your grown-up starts: “One day, ${p.animal} found a secret door in ${p.place}…” What happens next?`, p => `大人先說：「有一天，一隻${p.animal}在${p.place}發現了一道秘密門……」接下來會怎樣？`],
    [['color'], p => `Your grown-up starts: “Overnight, everything in town turned ${p.color}…” Take turns adding the next part!`, p => `大人先說：「一夜之間，整個小鎮都變成了${p.color}……」輪流說下去吧！`],
    [[], () => 'Your grown-up starts: “The toy box began to wobble…” Take turns adding one sentence each!', () => '大人先說：「玩具箱開始搖搖晃晃……」每人輪流說一句！'],
    [[], () => 'Your grown-up starts: “Once upon a time, a tiny dragon was afraid of the dark…” What happens next?', () => '大人先說：「從前，有一條小小的龍很怕黑……」接下來會怎樣？'],
  ],
};
/** Turn the child's optional answers into phrases, leaving out blank ones. */
function ideaPhrases(profile, chinese) {
  const value = key => String(profile[key] || '').trim();
  const phrases = {};
  const animal = value('animal'), color = value('color'), hobby = value('hobby'), place = value('place');
  if (chinese) {
    if (animal) phrases.animal = translate(animal);
    if (color) phrases.color = translate(color);
    if (hobby) phrases.hobby = translate(hobby);
    if (place) phrases.place = translate(place);
    return phrases;
  }
  if (animal) phrases.animal = `${/^[aeiou]/i.test(animal) ? 'an' : 'a'} ${animal.toLowerCase()}`;
  if (color) phrases.color = color.toLowerCase();
  if (hobby) phrases.hobby = hobby.toLowerCase();
  if (place) phrases.place = PLACE_PHRASES[place] || place.toLowerCase();
  return phrases;
}
/** Build activity-specific suggestions using the child's saved preferences. */
function activityIdeas(item, profile) {
  const lang = typeof currentLanguage === 'function' ? currentLanguage() : 'en';
  const chinese = lang !== 'en';
  const phrases = ideaPhrases(profile, chinese);
  const fallback = [
    [[], () => `Try “${item.title}” and add your own special twist.`, () => `試試「${translate(item.title)}」，再加上你自己的小創意。`],
    [[], () => `Try “${item.title}”, then tell your grown-up about it.`, () => `試試「${translate(item.title)}」，然後告訴大人你做了甚麼。`],
  ];
  const templates = (IDEA_TEMPLATES[item.id] || fallback).filter(([needs]) => needs.every(key => phrases[key]));
  const results = templates.map(([, english, zh]) => (chinese ? zh : english)(phrases));
  return lang === 'zh-CN' ? results.map(simplifyChinese) : results;
}
/* One parent–child conversation question per activity, in English and Chinese. */
const ACTIVITY_QUESTIONS = {
  draw: ['If you could step into your picture, where would you go first?', '如果你可以走進你的畫，你會先去哪裏？'],
  build: ['Who would live in what you built, and what would they do there?', '誰會住在你砌的地方？他們會在那裏做甚麼？'],
  puzzle: ['Which piece was the hardest to find, and how did you find it?', '哪一塊最難找？你是怎樣找到的？'],
  story: ['What do you think happens next in our story?', '你覺得我們的故事接下來會發生甚麼事？'],
  cards: ['What was your favourite moment in the game?', '遊戲裏你最喜歡哪一刻？'],
  move: ['Which treasure was the most interesting, and why?', '哪一樣寶物最有趣？為甚麼？'],
  music: ['How would your rhythm sound if it were happy? Or sleepy?', '如果你的節奏很開心，會是怎樣的？如果很睏呢？'],
  colour: ['Which colour was the hardest to find?', '哪一種顏色最難找？'],
  mystery: ['Which clue helped you guess the most?', '哪一個線索最能幫你猜中？'],
  storystarter: ['What was your favourite part of the story we made together?', '我們一起編的故事，你最喜歡哪一部分？'],
};
const DEFAULT_QUESTION = ['What was your favourite part of doing this?', '做這個活動時，你最喜歡哪一部分？'];
/** Return the conversation question that fits an activity, in the chosen language. */
function activityQuestion(id, lang = currentLanguage()) {
  const [en, zh] = ACTIVITY_QUESTIONS[id] || DEFAULT_QUESTION;
  return localText(en, zh, lang);
}
/** Translate a comma-separated list of profile answers for display. */
function translatedList(text) {
  return String(text || '').split(/,\s*/).filter(Boolean).map(part => translate(part)).join(currentLanguage() === 'en' ? ', ' : '、');
}
/** Build a parent-facing idea from the child's profile when AI is not available. */
function profileIdea(profile) {
  const approved = CATALOG.filter(item => state.family.approved.includes(item.id));
  const pool = approved.length ? approved : CATALOG;
  const likesTogether = profile.together.length > 0;
  const score = item => Number(profile.interests.includes(item.category)) * 2 + Number(likesTogether && item.mode === 'together');
  const ordered = [...pool].sort((a, b) => score(b) - score(a));
  state.ideaCounters = state.ideaCounters || {};
  const turn = state.ideaCounters.parent || 0;
  state.ideaCounters.parent = turn + 1;
  const item = ordered[turn % ordered.length];
  const ideas = activityIdeas(item, profile);
  const minutes = Number(profile.time) || item.minutes;
  const materialText = profile.materials ? translatedList(profile.materials) : translate(item.materials);
  const materials = currentLanguage() === 'en' ? materialText.toLowerCase() : materialText;
  const reasons = [...profile.interests.filter(interest => interest === item.category), ...(item.mode === 'together' ? profile.together.slice(0, 1) : [])];
  const reasonText = reasons.map(translate).join(currentLanguage() === 'en' ? ' and ' : '和');
  return {
    icon: item.icon,
    title: translate(item.title),
    why: reasons.length
      ? localText(`For age ${profile.age} · ${profile.name} likes ${reasonText}.`, `適合 ${profile.age} 歲 · ${profile.name}喜歡${reasonText}。`)
      : localText(`For age ${profile.age} · an approved activity to try together.`, `適合 ${profile.age} 歲 · 一個可以一起試的獲准活動。`),
    steps: [
      localText(`Get ready: find ${materials} and set a ${minutes}-minute timer.`, `準備：拿出${materials}，設定 ${minutes} 分鐘計時。`),
      ideas[turn % ideas.length],
    ],
    question: activityQuestion(item.id),
  };
}
/** Show the next suggestion: on-device AI first, otherwise the built-in library. */
async function nextChildIdea() {
  const item = activity(state.chosen);
  const output = document.querySelector('#activity-idea');
  if (!item || !output) return;
  const token = (nextChildIdea.token || 0) + 1;
  nextChildIdea.token = token;
  output.innerHTML = `<p class="helper">${esc(translate('Thinking of an idea…'))}</p>`;
  const profile = state.profile;
  const likes = [profile.interests.join(', '), profile.animal && `favourite animal ${profile.animal}`, profile.color && `favourite colour ${profile.color}`, profile.place && `favourite place ${profile.place}`].filter(Boolean).join('; ');
  const prompt = `Give one short, simple, safe idea for a child aged ${profile.age} doing the offline activity "${item.title}" (${item.description}). ` +
    `They like: ${likes || 'playing'}. Use one or two short sentences that a 6 to 8 year old can read. ` +
    'Give a new twist, an extra challenge or a creative extension; do not just repeat the activity instructions. ' +
    'No screens, no sharp tools, no cooking, no going anywhere without a grown-up. Reply with the idea only.';
  const result = await askAI({ prompt, validate: (text, p) => usableAIText(text, p, 240) && text.split('\n').length <= 3, fallback: () => {
    const ideas = activityIdeas(item, profile);
    state.ideaCounters = state.ideaCounters || {};
    const index = (state.ideaCounters[item.id] || 0) % ideas.length;
    state.ideaCounters[item.id] = index + 1;
    return { text: ideas[index] };
  } });
  if (nextChildIdea.token !== token || document.querySelector('#activity-idea') !== output) return;
  state.draftIdea = result.text;
  state.draftIdeaSource = result.source;
  saveState();
  output.innerHTML = `<div class="prompt-card">${aiBadge(result.source, 'AI idea', 'Idea from our library')}<b>Here’s an idea for you ✨</b><p>${esc(result.text)}</p>${questionMarkup(activityQuestion(item.id))}<button class="button primary small" data-action="use-child-idea">I choose this idea ♡</button></div>`;
  localizeUI(output);
}
/** Render a parent–child conversation question card. */
function questionMarkup(question, heading = 'Talk about it with your grown-up') {
  return `<div class="question-card"><b>💬 ${esc(translate(heading))}</b><p>“${esc(question)}”</p></div>`;
}
/** Save the child's choice so it can accompany their activity submission. */
function useChildIdea() {
  if (!state.draftIdea) return;
  state.selectedIdea = state.draftIdea;
  saveState();
  const output = document.querySelector('#activity-idea');
  if (output) output.innerHTML = `<div class="prompt-card">${aiBadge(state.draftIdeaSource || 'demo', 'AI idea', 'Idea from our library')}<b>Your chosen idea ♡</b><p>${esc(state.selectedIdea)}</p>${questionMarkup(activityQuestion(state.chosen))}<small>You can ask for another idea whenever you like.</small></div>`;
  localizeUI(output);
  toast('Your idea is saved!');
}
