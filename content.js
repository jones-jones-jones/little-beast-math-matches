/* This week's word lists, loaded from the school sheets. The in-app "This week's words" screen
 * overrides these (saved on the iPad); "Use the words I loaded" goes back to this file.
 * Format is the same as the whiteboard screen:
 *   spelling: one word per line (or commas)
 *   vocab:    word (part of speech): meaning | sample sentence
 * The meanings are copied from the school's vocabulary sheet. The sample sentences were written to
 * be read aloud and are not from the school, so edit them freely.
 */
(typeof window !== 'undefined' ? window : globalThis).LBM_CONTENT = {
  week: 'Silent letters and irregular plurals',
  spelling: [
    'phone', 'teeth', 'wrote', 'phase', 'crumb',
    'oxen', 'knife', 'fish', 'limb', 'children',
    'knocking', 'mice', 'wrinkle', 'whale', 'cacti',
    'women', 'deer', 'people',
  ].join('\n'),
  vocab: [
    'douse (verb): throw a liquid on | The firefighter used a hose to douse the flames.',
    'drive (verb): prod animals into moving in a desired direction | The cowboys drive the cattle across the field.',
    'guard (verb): keep safe from harm or danger | The big dog will guard the house.',
    "heart (noun): one's innermost feelings or spirit | She has a kind heart and loves to help others.",
    'homestead (noun): a house and the farmland it is on | Grandpa\'s homestead has a red barn and wide fields.',
    'pack (noun): a group of animals that are alike | A pack of wolves ran through the forest.',
    'parched (adjective): very dry | The land was parched because it had not rained for weeks.',
    'sod (noun): a cut layer of soil with grass growing on it | Dad laid fresh sod to make a new lawn.',
    'thrust (verb): push with force | She thrust the heavy door open with her shoulder.',
    'trudged (verb): walked slowly and with effort | The tired hikers trudged up the steep hill.',
    'waste (verb): spend or use foolishly | Do not waste water, so turn off the tap.',
    'yards (noun): measures of length equal to about three feet | A football field is one hundred yards long.',
  ].join('\n'),
};
