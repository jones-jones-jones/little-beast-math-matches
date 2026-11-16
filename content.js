/* This week's word lists, loaded from the school sheets. The in-app "This week's words" screen
 * overrides these (saved on the iPad); "Use the words I loaded" goes back to this file.
 * Format is the same as the whiteboard screen:
 *   spelling: one word per line (or commas)
 *   vocab:    word (part of speech): meaning | sample sentence
 * The meanings are copied from the school's vocabulary sheet. The sample sentences were written to
 * be read aloud and are not from the school, so edit them freely.
 */
(typeof window !== 'undefined' ? window : globalThis).LBM_CONTENT = {
  week: 'Long and short oo sounds with -ing and -ed endings; A New Life for Mei immigration vocabulary (Unit 3 Lesson 1)',
  spelling: [
    'took', 'shook', 'broom', 'stood', 'landing',
    'named', 'hoping', 'stripped', 'scoop', 'amazing',
    'brook', 'pool', 'bored', 'tried', 'timing',
    // Challenge words
    'staring', 'admitted', 'woodwork',
  ].join('\n'),
  vocab: [
    'accommodate (verb): to do a favor or service for | The hotel will accommodate our family by adding an extra bed to the room.',
    'alley (noun): a narrow street or passageway | The cat slipped down the dark alley behind the shops.',
    'apprehensive (adjective): fearful about what may happen | She felt apprehensive about her first day at the new school.',
    'bellowed (verb): cried out in a loud, deep voice | The coach bellowed across the field for the team to come in.',
    'fate (noun): unavoidable lot or fortune | The sailors could not change their fate once the storm hit.',
    'hitch (noun): an unexpected delay or obstacle | The trip went well, with only one small hitch when the bus was late.',
    'link (verb): to join, unite, or connect | The new bridge will link the two towns.',
    'proper (adjective): suitable, appropriate, or correct for a given purpose | You need the proper shoes to play on the wrestling mat.',
    'rush (noun): the act of making a sudden, swift movement | There was a rush for the door when the bell rang.',
    'strike (verb): to find suddenly or unexpectedly | The miners hoped to strike gold in the old mountain.',
    'temperamental (adjective): showing moodiness, sensitivity, or irritability | The temperamental old car would start one day and refuse the next.',
    'tie (noun): part of a structure that holds together other parts | A wooden tie holds the two railroad tracks in place.',
  ].join('\n'),
};
