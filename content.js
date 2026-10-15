/* This week's word lists, loaded from the school sheets. The in-app "This week's words" screen
 * overrides these (saved on the iPad); "Use the words I loaded" goes back to this file.
 * Format is the same as the whiteboard screen:
 *   spelling: one word per line (or commas)
 *   vocab:    word (part of speech): meaning | sample sentence
 * The meanings are copied from the school's vocabulary sheet. The sample sentences were written to
 * be read aloud and are not from the school, so edit them freely.
 */
(typeof window !== 'undefined' ? window : globalThis).LBM_CONTENT = {
  week: 'Long i sound, irregular verbs, and abstract nouns; weather and seasons vocabulary',
  spelling: [
    'lie', 'ties', 'went', 'faith', 'gave',
    'reply', 'sank', 'lit', 'sigh', 'bravery',
    'cycles', 'flies', 'fight', 'paid', 'truth',
    // Challenge words
    'brought', 'power', 'brighter',
  ].join('\n'),
  vocab: [
    'accompany (verb): happen in connection or combination with | Dad will accompany us to the tournament and sit by the mat.',
    'cottage (noun): a small house, usually in the country or in a resort | We stayed in a tiny cottage in the country.',
    'crisp (adjective): keen and bracing, brisk, or invigorating | The crisp fall air felt cool and fresh.',
    'dissipates (verb): disperses or scatters | The fog dissipates once the sun gets high in the sky.',
    'droughts (noun): long periods of dry weather | Long droughts can dry up lakes and hurt farm crops.',
    'flow (verb): move along slowly or continuously | The river will flow slowly past the old mill.',
    'generates (verb): produces | A wind turbine generates power when the wind blows.',
    'intense (adjective): very great or strong | The heat during the summer match was intense.',
    'precipitation (noun): any form of water that falls to the earth, such as rain, hail, or snow | Rain, hail, and snow are all kinds of precipitation.',
    'refreshing (adjective): restoring strength or vitality | A cold drink of water is refreshing after practice.',
    'safari (noun): a hunting or an investigative trip | They saw lions and zebras on a safari in Africa.',
    'unique (adjective): highly unusual or noteworthy | Every snowflake is unique.',
  ].join('\n'),
};
