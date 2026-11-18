/* Optional, on-device AI features using Chrome's Prompt API. */
/** Create a model session after checking the current browser's capabilities. */
async function createLocalModel(withImage) {
  if (!('LanguageModel' in window)) {
    throw new Error('This browser does not support on-device AI. Try a compatible, up-to-date Chrome installation.');
  }
  const inputs = [{ type: 'text', languages: ['en'] }];
  if (withImage) inputs.push({ type: 'image' });
  const options = { expectedInputs: inputs, expectedOutputs: [{ type: 'text', languages: ['en'] }] };
  const availability = await window.LanguageModel.availability(options);
  if (availability === 'unavailable') {
    throw new Error('The on-device model is unavailable on this device. A caregiver can review the photo instead.');
  }
  return window.LanguageModel.create(options);
}

/** Request a tailored activity idea from an available local model. */
async function aiSuggest() {
  const output = document.querySelector('#ai-result');
  if (!output) return;
  output.textContent = 'Preparing the on-device model. The first use may download it…';
  let session;
  try {
    session = await createLocalModel(false);
    const interests = state.profile.interests.join(', ') || 'drawing';
    const together = state.profile.together.join(', ') || 'storytelling';
    const prompt = `Suggest one safe, simple offline activity for a child aged ${state.profile.age}. ` +
      `Interests: ${interests}. Together activities: ${together}. Time: ${state.profile.time} minutes. ` +
      `Available materials: ${state.profile.materials || 'paper'}. Write a short title, two clear steps ` +
      'and one parent-child conversation question. A caregiver will review the result.';
    const result = await session.prompt(prompt);
    if (document.querySelector('#ai-result') === output) output.textContent = result;
  } catch (error) {
    if (document.querySelector('#ai-result') === output) output.textContent = error.message || 'The AI suggestion could not be generated. Please try the activity library.';
  } finally {
    if (session) session.destroy();
  }
}

/** Ask an available local vision model to describe a submitted creation. */
async function aiDescribe(id) {
  const output = document.querySelector('#ai-result');
  const submission = state.submissions.find(item => item.id === id);
  if (!output || !submission || !submission.image) return;
  output.textContent = 'Preparing the on-device image model. The first use may download it…';
  let session;
  try {
    session = await createLocalModel(true);
    const photo = await (await fetch(submission.image)).blob();
    const prompt = `The activity is "${submission.title}". Briefly describe what is visible. ` +
      'Mention whether the picture appears related to the activity and be honest if uncertain. ' +
      'Do not identify people or infer whether the child completed the task. The caregiver decides.';
    const result = await session.prompt([{ role: 'user', content: [
      { type: 'text', value: prompt },
      { type: 'image', value: photo },
    ] }]);
    if (document.querySelector('#ai-result') === output) output.textContent = result;
  } catch (error) {
    if (document.querySelector('#ai-result') === output) output.textContent = error.message || 'The photo could not be analyzed. Please review it yourself.';
  } finally {
    if (session) session.destroy();
  }
}
