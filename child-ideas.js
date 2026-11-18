/* Child-friendly ideas from a small built-in library; this is not generative AI. */
/** Build activity-specific suggestions using the child's saved preferences. */
function activityIdeas(item, profile) {
  const animal = profile.animal?.trim() || 'a friendly animal';
  const color = profile.color?.trim() || 'your favourite colour';
  const hobby = profile.hobby?.trim() || 'playing';
  const place = profile.place?.trim() || 'a magical place';
  if (typeof currentLanguage === 'function' && currentLanguage() !== 'en') {
    const a = translate(animal), c = translate(color), h = translate(hobby), p = translate(place);
    const chinese = {
      draw: [`畫${a}到${p}探險，加一點${c}。`, `畫${a}在${p}${h}。`, `為${a}畫一個${c}的家，加上三樣東西。`, `畫${p}，讓${a}做你的嚮導。`],
      build: [`用積木或盒子為${a}砌一個家。`, `為玩具砌一個小小的${p}，加上${c}。`, `砌一個讓${a}可以${h}的地方。`, `為到${p}的玩具砌一座橋或塔。`],
      puzzle: [`找一塊${c}的拼圖，看看旁邊配哪一塊。`, `找一些讓你想起${p}的拼圖。`, '找三塊顏色相近的拼圖，看看能否拼在一起。', `按顏色分類，先找${c}的拼圖。`],
      story: [`和大人一起編一個${a}去${p}的故事。`, `輪流說故事，想像${a}嘗試${h}。`, `一起編個關於${p}的${c}驚喜故事。`, `請大人一起編${a}交新朋友的故事。`],
      cards: [`和大人玩配對遊戲，先找${c}的卡。`, `輪流找配對，把每對卡當成前往${p}的線索。`, `和大人一起創作一個關於${a}的卡牌遊戲。`, '輪流抽卡，說一件你們都喜歡做的事。'],
      move: [`和信任的大人在安全的戶外找${c}的東西。`, `和信任的大人找三個讓你想起${a}的形狀。`, `和信任的大人找兩樣在${p}可能看到的東西。`, '和信任的大人找一樣光滑和一樣多彩的東西。'],
      music: [`拍一個像${a}走路的節奏。`, `想像去${p}，創作一段小舞蹈。`, `為${h}拍節奏，再快一點。`, `輕輕拍節奏，想像${c}的聲音。`],
      colour: [`在安全的房間找${c}和另外兩種顏色。`, `找三種${p}可能有的顏色。`, `找兩種你會用來畫${a}的顏色。`, '找一種你喜歡的顏色，和旁邊另一種顏色。'],
    };
    const results = chinese[item.id] || [`試試${translate(item.title)}。`, `用${c}試試${translate(item.title)}。`];
    return currentLanguage() === 'zh-CN' ? results.map(simplifyChinese) : results;
  }
  const ideas = {
    draw: [
      `Draw ${animal} exploring ${place}, with a little ${color} detail.`,
      `Draw ${animal} enjoying ${hobby} in ${place}.`,
      `Imagine a ${color} home for ${animal}. Draw three things inside.`,
      `Draw a picture of ${place} and add ${animal} as your guide.`,
    ],
    build: [
      `Build a little home for ${animal} using blocks or boxes.`,
      `Make a tiny ${place} for a toy and add a ${color} detail.`,
      `Build a place where ${animal} could enjoy ${hobby}.`,
      `Make a bridge or a tower for a toy visiting ${place}.`,
    ],
    puzzle: [
      `Pick a puzzle piece with ${color} on it and find a neighbour for it.`,
      `Look for pieces that remind you of ${place}, then connect what you can.`,
      `Can you find and connect three pieces with matching colours?`,
      `Sort a few pieces into colours and start with ${color} if you have it.`,
    ],
    story: [
      `With your grown-up, tell a story about ${animal} visiting ${place}.`,
      `Take turns telling a story where ${animal} tries ${hobby}.`,
      `Make up a story together about a ${color} surprise in ${place}.`,
      `Ask your grown-up to help tell a story about ${animal} making a new friend.`,
    ],
    cards: [
      `With your grown-up, play a matching game. Look for ${color} cards first.`,
      `Take turns finding pairs and pretend each pair is a clue to ${place}.`,
      `Make a tiny card game with your grown-up about ${animal}.`,
      `Take turns picking a card and naming a thing you both enjoy doing.`,
    ],
    move: [
      `With a trusted adult, look for something ${color} in a safe outdoor place.`,
      `With a trusted adult, look for three shapes that remind you of ${animal}.`,
      `With a trusted adult, find two things you might see in ${place}.`,
      `With a trusted adult, look for something smooth and something colourful.`,
    ],
    music: [
      `Tap a rhythm that sounds like ${animal} walking.`,
      `Make up a gentle dance for a trip to ${place}.`,
      `Tap a beat for ${hobby}, then make it a little faster.`,
      `Make a quiet rhythm and imagine it is the sound of ${color}.`,
    ],
    colour: [
      `In a safe room, find something ${color} and two other colours.`,
      `Find three colours that might be in ${place}.`,
      `Find two colours you would use to draw ${animal}.`,
      `Find a colour you love and a different colour next to it.`,
    ],
  };
  return ideas[item.id] || [`Try ${item.title} using ${color}.`, `Try ${item.title} and add ${animal}.`];
}
/** Show the next suggestion, cycling so consecutive clicks are different. */
function nextChildIdea() {
  const item = activity(state.chosen);
  const output = document.querySelector('#activity-idea');
  if (!item || !output) return;
  const ideas = activityIdeas(item, state.profile);
  state.ideaCounters = state.ideaCounters || {};
  const index = (state.ideaCounters[item.id] || 0) % ideas.length;
  const idea = ideas[index];
  state.ideaCounters[item.id] = index + 1;
  state.draftIdea = idea;
  saveState();
  output.innerHTML = `<div class="prompt-card"><b>Here’s an idea for you ✨</b><p>${esc(idea)}</p><button class="button primary small" data-action="use-child-idea">I choose this idea ♡</button></div>`;
  localizeUI(output);
}
/** Save the child's choice so it can accompany their activity submission. */
function useChildIdea() {
  if (!state.draftIdea) return;
  state.selectedIdea = state.draftIdea;
  saveState();
  const output = document.querySelector('#activity-idea');
  if (output) output.innerHTML = `<div class="prompt-card"><b>Your chosen idea ♡</b><p>${esc(state.selectedIdea)}</p><small>You can ask for another idea whenever you like.</small></div>`;
  localizeUI(output);
  toast(currentLanguage() !== 'en' ? '已儲存你的點子！' : 'Your idea is saved!');
}
