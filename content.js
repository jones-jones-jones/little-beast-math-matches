/* This week's word lists, loaded from the school sheets. The in-app "This week's words" screen
 * overrides these (saved on the iPad); "Use the words I loaded" goes back to this file.
 * Format is the same as the whiteboard screen:
 *   spelling: one word per line (or commas)
 *   vocab:    word (part of speech): meaning | sample sentence
 * The meanings are copied from the school's vocabulary sheet. The sample sentences were written to
 * be read aloud and are not from the school, so edit them freely.
 */
(typeof window !== 'undefined' ? window : globalThis).LBM_CONTENT = {
  week: 'Long u sound, homographs and multiple-meaning words; weather and meteorologists vocabulary',
  spelling: [
    'cue', 'few', 'well', 'rose', 'argue',
    'fire', 'hue', 'ring', 'value', 'change',
    'spew', 'rescue', 'park', 'rocks', 'light',
    // Challenge words
    'pitcher', 'nephew', 'continue',
  ].join('\n'),
  vocab: [
    'accurate (adjective): without errors or mistakes | The weather report was accurate, and it rained just as they said.',
    'concern (noun): worried interest | The farmers showed great concern about the coming storm.',
    'instruments (noun): tools designed for precise or careful work | Weather instruments measure the wind and the temperature.',
    'meteorologist (noun): an expert in the science dealing with the study of the atmosphere | The meteorologist explained why the storm was growing.',
    'minimize (verb): to reduce to the smallest or least possible amount or degree | We close the windows to minimize damage from the storm.',
    'threat (noun): a sign that something dangerous or unfortunate may happen | The dark clouds were a threat of a severe thunderstorm.',
  ].join('\n'),
};
