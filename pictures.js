/* Picture cards and an animal choice game for the child's profile. */
const ANIMALS = [['Panda','🐼'],['Lion','🦁'],['Giraffe','🦒'],['Cat','🐱'],['Dog','🐶'],['Dolphin','🐬'],['Rabbit','🐰']];
const PICTURES = {
  color: [['Red','🔴'],['Blue','🔵'],['Green','🟢'],['Yellow','🟡'],['Pink','🩷'],['Purple','🟣'],['Orange','🟠']],
  hobby: [['Dancing','💃'],['Drawing','🎨'],['Reading','📚'],['Sports','⚽'],['Singing','🎵'],['Building','🧱']],
  place: [['Ocean','🌊'],['Forest','🌳'],['Space','🚀'],['Park','🛝'],['Beach','🏖️']],
  materials: [['Paper','📄'],['Crayons','🖍️'],['Blocks','🧱'],['Cards','🃏'],['Toys','🧸']],
  age: [['6','6️⃣'],['7','7️⃣'],['8','8️⃣']],
  time: [['5','⏱️'],['10','⏱️'],['15','⏱️'],['20','⏱️']],
};
/** Render a set of selectable picture cards with stable values. */
function pictureChoices(name, current, multiple = false) {
  const values = multiple ? (Array.isArray(current) ? current : String(current || '').split(/,\s*/)) : [String(current || '')];
  let options = PICTURES[name];
  if (!multiple && values[0] && !options.some(([value]) => value.toLowerCase() === values[0].toLowerCase())) options = [...options, [values[0], '⭐']];
  if (multiple) for (const value of values.filter(Boolean)) if (!options.some(([v]) => v.toLowerCase() === value.toLowerCase())) options = [...options, [value, '⭐']];
  return `<div class="picture-grid">${options.map(([value, icon]) => `<label class="picture-card"><input type="${multiple ? 'checkbox' : 'radio'}" name="${multiple ? 'materialChoices' : name}" value="${esc(value)}" ${values.some(saved => saved.toLowerCase() === value.toLowerCase()) ? 'checked' : ''}><span><b aria-hidden="true">${icon}</b><small>${esc(value)}${name === 'time' ? ' min' : ''}</small></span></label>`).join('')}</div>`;
}
/** Render the first two animal pictures and preserve the saved answer. */
function animalPicker(saved) {
  return `<div class="animal-game" data-round="1"><input type="hidden" name="animal" value="${esc(saved || '')}"><p class="muted">Which one do you like more?</p><div class="animal-options">${animalButton(ANIMALS[0])}${animalButton(ANIMALS[1])}</div><p class="animal-result">${saved ? `⭐ ${translate('Your favourite so far')}: ${esc(saved)}` : ''}</p></div>`;
}
/** Make one animal picture button. */
function animalButton([name, icon]) {
  return `<button type="button" class="animal-card" data-animal="${esc(name)}"><span aria-hidden="true">${icon}</span><b>${translate(name)}</b></button>`;
}
/** Advance the animal tournament without losing unsaved profile answers. */
document.addEventListener('click', event => {
  const button = event.target.closest('[data-animal]');
  if (!button) return;
  const game = button.closest('.animal-game');
  const chosen = ANIMALS.find(([name]) => name === button.dataset.animal);
  if (!game || !chosen) return;
  game.querySelector('input[name="animal"]').value = chosen[0];
  const next = Number(game.dataset.round) + 1;
  const result = game.querySelector('.animal-result');
  result.textContent = `⭐ ${translate('Your favourite so far')}: ${translate(chosen[0])}`;
  if (next < ANIMALS.length) {
    game.dataset.round = next;
    game.querySelector('.animal-options').innerHTML = animalButton(chosen) + animalButton(ANIMALS[next]);
  } else {
    game.querySelector('.animal-options').innerHTML = `<span class="animal-done">${chosen[1]} ${translate('All done!')}</span><button type="button" class="plain-link" data-animal-restart>${translate('Start again')}</button>`;
  }
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-animal-restart]');
  if (!button) return;
  const game = button.closest('.animal-game');
  game.dataset.round = '1';
  game.querySelector('.animal-options').innerHTML = animalButton(ANIMALS[0]) + animalButton(ANIMALS[1]);
});
