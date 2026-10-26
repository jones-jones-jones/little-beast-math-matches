/* This week's word lists, loaded from the school sheets. The in-app "This week's words" screen
 * overrides these (saved on the iPad); "Use the words I loaded" goes back to this file.
 * Format is the same as the whiteboard screen:
 *   spelling: one word per line (or commas)
 *   vocab:    word (part of speech): meaning | sample sentence
 * The meanings are copied from the school's vocabulary sheet. The sample sentences were written to
 * be read aloud and are not from the school, so edit them freely.
 */
(typeof window !== 'undefined' ? window : globalThis).LBM_CONTENT = {
  week: 'Long o sound and homophones; tornadoes vocabulary',
  spelling: [
    'groan', 'grown', 'toe', 'tow', 'tale',
    'tail', 'loan', 'roast', 'coach', 'grow',
    'float', 'bow', 'crow', 'flown', 'croak',
    // Challenge words
    'horse', 'hoarse', 'pillow',
  ].join('\n'),
  vocab: [
    'classifications (noun): specific, systematic arrangements of things into categories | Scientists use classifications to sort tornadoes by how strong they are.',
    'demolish (verb): to tear down or destroy the structure of | A strong tornado can demolish a barn in seconds.',
    'funnel cloud (noun): the bottom part of a tornado that is wide at one end and thin at the other | We saw a dark funnel cloud dip down from the storm.',
    'prepare (verb): to get ready | We practice a tornado drill to prepare for bad weather.',
    'radar (noun): a device that uses reflected radio waves to track objects | The weather radar showed the storm moving toward town.',
    'updraft (noun): an upward current of air | A strong updraft inside the storm cloud lifts the air high into the sky.',
  ].join('\n'),
};
