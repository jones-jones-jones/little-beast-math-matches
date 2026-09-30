/* This week's word lists, loaded from the school sheets. The in-app "This week's words" screen
 * overrides these (saved on the iPad); "Use the words I loaded" goes back to this file.
 * Format is the same as the whiteboard screen:
 *   spelling: one word per line (or commas)
 *   vocab:    word (part of speech): meaning | sample sentence
 * The meanings are copied from the school's vocabulary sheet. The sample sentences were written to
 * be read aloud and are not from the school, so edit them freely.
 */
(typeof window !== 'undefined' ? window : globalThis).LBM_CONTENT = {
  week: 'Long e, contractions, and possessive nouns; weather technology vocabulary',
  spelling: [
    'seam', "mother's", "we'll", 'piece', 'really',
    "she'd", "doesn't", 'meet', "wasn't", 'alley',
    'plates', 'street', 'honey', "it's", "i've",
    // Challenge words
    "o'clock", 'timidly', "shouldn't",
  ].join('\n'),
  vocab: [
    'anchor (verb): fasten in place | The sailors drop the anchor to fasten the boat in place.',
    'cover (noun): protection or shelter | The old barn gave the hikers cover from the storm.',
    'forecast (verb): to tell what may or will happen | The meteorologist will forecast rain for the weekend.',
    'gain (verb): something that is gotten, earned, or won | Little Beast worked hard to gain a takedown in the match.',
    'hazard (noun): a source of danger, harm, or loss | Ice on the road is a hazard for drivers.',
    'media (noun): the press or broadcasting companies communicating with many people | The local media reported on the big storm.',
    'mobile (adjective): capable of moving or being moved | The weather van is mobile, so it can drive right up to a storm.',
    'navigate (verb): to plan or direct the course of | The pilot will navigate the plane around the storm clouds.',
    'pastime (noun): something that makes time pass pleasantly | Wrestling is Little Beast\'s favorite pastime.',
    'scene (noun): the place where an action or event occurs or has occurred | Reporters rushed to the scene of the tornado.',
    'serious (adjective): causing concern or anxiety | A serious storm was heading straight for the town.',
    'transmit (verb): to send or communicate | The weather satellite can transmit data back to scientists on the ground.',
  ].join('\n'),
};
