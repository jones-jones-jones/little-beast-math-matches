/* This week's word lists, loaded from the school sheets. The in-app "This week's words" screen
 * overrides these (saved on the iPad); "Use the words I loaded" goes back to this file.
 * Format is the same as the whiteboard screen:
 *   spelling: one word per line (or commas)
 *   vocab:    word (part of speech): meaning | sample sentence
 * The meanings are copied from the school's vocabulary sheet. The sample sentences were written to
 * be read aloud and are not from the school, so edit them freely.
 */
(typeof window !== 'undefined' ? window : globalThis).LBM_CONTENT = {
  week: 'Long oo sound, homographs and multiple-meaning words; deserts, polar regions and land features vocabulary',
  spelling: [
    'clue', 'tuna', 'fine', 'mind', 'root',
    'yard', 'noodle', 'cool', 'rude', 'file',
    'chew', 'choose', 'permit', 'waves', 'letter',
    // Challenge words
    'patient', 'duet', 'jewel',
  ].join('\n'),
  vocab: [
    'Antarctic (adjective): relating to the South Pole or surrounding regions | Penguins live in the Antarctic, where it is freezing cold.',
    'continent (noun): one of the seven large land areas on Earth | Africa is the second largest continent.',
    'elevation (noun): height above sea level | The mountain town has a high elevation, so the air is thin.',
    'evaporate (verb): change from a liquid or solid into a gas | The puddle will evaporate when the sun comes out.',
    'extinct (adjective): no longer active or burning | The volcano is extinct, so it will never erupt again.',
    'mirage (noun): an illusion in which a distant object is not really there | The traveler saw a mirage of a lake in the hot desert.',
    'plateaus (noun): areas of flat land higher than the surrounding country | The hikers crossed two high plateaus on their trip.',
    'polar (adjective): having to do with the North or South Pole | The polar bear walked across the ice.',
    'sandwiched (verb): fit or squeezed in tightly | I sandwiched my small bag between two big suitcases.',
    'severe (adjective): harsh, or causing hardship, or discomfort | The severe storm knocked down trees and closed the roads.',
    'tundra (noun): flat, treeless land of permanently frozen soil | Few plants can grow on the frozen tundra.',
    'vapor (noun): small particles of mist, steam, or smoke that can be seen in the air | Vapor rose from the hot cup of cocoa.',
  ].join('\n'),
};
