// SummerSharp Civics bank — authored & fact-checked, grade-appropriate, and
// strictly non-partisan. Florida Social Studies (SS) Civics & Government strand.
// Hand-authored; `standard` left null. Each item: { grade, skill, prompt,
// choices, answer, explanation }. Generator sets subject="civics", shuffles
// choices, computes the index — `answer` must match a choice exactly. Skill
// tags prefixed `civ.`

export const CIVICS = [
  // ===== KINDERGARTEN ===== (rules, helpers, the flag)
  // civ.K.rules
  { grade: "K", skill: "civ.K.rules", prompt: "Why do we have rules?", choices: ["To keep everyone safe and fair", "To make people sad", "To waste time", "For no reason"], answer: "To keep everyone safe and fair", explanation: "Rules help keep everyone safe and treat people fairly." },
  { grade: "K", skill: "civ.K.rules", prompt: "Which is a good rule for the classroom?", choices: ["Take turns and share", "Push to be first", "Yell at friends", "Throw toys"], answer: "Take turns and share", explanation: "Taking turns and sharing is a fair, kind rule." },
  { grade: "K", skill: "civ.K.rules", prompt: "At a red light, cars should ___.", choices: ["stop", "go fast", "honk and go", "turn off their lights"], answer: "stop", explanation: "A red light is a rule that means stop, to keep everyone safe." },
  // civ.K.helpers
  { grade: "K", skill: "civ.K.helpers", prompt: "Who helps put out fires and keep people safe?", choices: ["A firefighter", "A chef", "A painter", "A singer"], answer: "A firefighter", explanation: "Firefighters help put out fires and keep us safe." },
  { grade: "K", skill: "civ.K.helpers", prompt: "Who helps you when you are sick or hurt?", choices: ["A doctor", "A pilot", "A farmer", "A clown"], answer: "A doctor", explanation: "Doctors help people who are sick or hurt." },
  { grade: "K", skill: "civ.K.helpers", prompt: "A community helper who delivers your mail is the ___.", choices: ["mail carrier", "teacher", "dentist", "lifeguard"], answer: "mail carrier", explanation: "A mail carrier brings letters and packages." },
  // civ.K.flag
  { grade: "K", skill: "civ.K.flag", prompt: "We say the Pledge of Allegiance to the ___.", choices: ["flag", "lunchbox", "window", "clock"], answer: "flag", explanation: "The Pledge of Allegiance is said to the United States flag." },

  // ===== GRADE 1 ===== (rules vs. laws, leaders, citizenship)
  // civ.1.laws
  { grade: "1", skill: "civ.1.laws", prompt: "A rule that everyone in a community must follow is called a ___.", choices: ["law", "game", "joke", "song"], answer: "law", explanation: "Laws are rules that everyone in a community must follow." },
  { grade: "1", skill: "civ.1.laws", prompt: "Wearing a seatbelt in a car is a ___ that keeps you safe.", choices: ["law", "secret", "color", "snack"], answer: "law", explanation: "Wearing a seatbelt is a law made to keep people safe." },
  // civ.1.leaders
  { grade: "1", skill: "civ.1.leaders", prompt: "Who is the leader of your school?", choices: ["The principal", "The president", "The mayor", "The governor"], answer: "The principal", explanation: "A principal is the leader of a school." },
  { grade: "1", skill: "civ.1.leaders", prompt: "The leader of a city or town is the ___.", choices: ["mayor", "principal", "captain", "coach"], answer: "mayor", explanation: "A mayor leads a city or town." },
  // civ.1.citizen
  { grade: "1", skill: "civ.1.citizen", prompt: "Which action shows being a good citizen?", choices: ["Helping clean up the park", "Littering", "Breaking rules", "Being unkind"], answer: "Helping clean up the park", explanation: "Good citizens help take care of their community." },
  { grade: "1", skill: "civ.1.citizen", prompt: "A good citizen treats other people with ___.", choices: ["respect", "meanness", "anger", "rudeness"], answer: "respect", explanation: "Good citizens are respectful and kind to others." },
  // civ.1.symbols
  { grade: "1", skill: "civ.1.symbols", prompt: "Which is a national symbol of the United States?", choices: ["The bald eagle", "A pizza", "A school bus", "A soccer ball"], answer: "The bald eagle", explanation: "The bald eagle is a national symbol of the U.S." },

  // ===== GRADE 2 ===== (government, voting, responsibilities)
  // civ.2.government
  { grade: "2", skill: "civ.2.government", prompt: "What is government?", choices: ["A group of people who make laws and lead", "A kind of weather", "A type of food", "A board game"], answer: "A group of people who make laws and lead", explanation: "Government is the group of people who make laws and lead a community or country." },
  { grade: "2", skill: "civ.2.government", prompt: "Who is the leader of the whole United States?", choices: ["The president", "The principal", "The mayor", "The coach"], answer: "The president", explanation: "The president leads the United States." },
  { grade: "2", skill: "civ.2.government", prompt: "What is the capital city of the United States?", choices: ["Washington, D.C.", "New York City", "Orlando", "Los Angeles"], answer: "Washington, D.C.", explanation: "Washington, D.C., is the capital of the United States." },
  // civ.2.voting
  { grade: "2", skill: "civ.2.voting", prompt: "Voting is how citizens ___.", choices: ["choose their leaders", "buy groceries", "do homework", "ride bikes"], answer: "choose their leaders", explanation: "Voting lets citizens choose who will lead." },
  { grade: "2", skill: "civ.2.voting", prompt: "When a class votes and most people pick the same choice, that choice wins by ___.", choices: ["majority", "magic", "luck", "guessing"], answer: "majority", explanation: "The choice with the most votes (the majority) wins." },
  // civ.2.responsibility
  { grade: "2", skill: "civ.2.responsibility", prompt: "Following laws and helping others are a citizen's ___.", choices: ["responsibilities", "vacations", "toys", "snacks"], answer: "responsibilities", explanation: "Responsibilities are the things good citizens are expected to do." },

  // ===== GRADE 3 ===== (local government, making laws, rights)
  // civ.3.localgov
  { grade: "3", skill: "civ.3.localgov", prompt: "Who is the leader of a state?", choices: ["The governor", "The mayor", "The president", "The principal"], answer: "The governor", explanation: "A governor leads a state, like Florida." },
  { grade: "3", skill: "civ.3.localgov", prompt: "Local governments provide services like ___.", choices: ["police, libraries, and parks", "video games", "movie stars", "candy"], answer: "police, libraries, and parks", explanation: "Local governments run services such as police, libraries, and parks." },
  // civ.3.lawmaking
  { grade: "3", skill: "civ.3.lawmaking", prompt: "Why do communities make laws?", choices: ["To keep people safe and treat them fairly", "To make life boring", "To use up paper", "To confuse people"], answer: "To keep people safe and treat them fairly", explanation: "Laws exist to keep people safe and make things fair." },
  { grade: "3", skill: "civ.3.lawmaking", prompt: "What should you do if you think a rule is unfair?", choices: ["Speak up and ask leaders to change it", "Break it secretly", "Ignore everyone", "Do nothing ever"], answer: "Speak up and ask leaders to change it", explanation: "In a fair community, people can speak up to change rules and laws." },
  // civ.3.rights
  { grade: "3", skill: "civ.3.rights", prompt: "A 'right' is something every person is free to ___.", choices: ["have or do", "buy only with gold", "win in a contest", "find in space"], answer: "have or do", explanation: "Rights are freedoms that belong to every person." },
  { grade: "3", skill: "civ.3.rights", prompt: "Freedom of speech means you are allowed to ___.", choices: ["share your ideas", "never talk", "only whisper", "speak just one word a day"], answer: "share your ideas", explanation: "Freedom of speech lets people share their ideas and opinions." },
  // civ.3.symbols
  { grade: "3", skill: "civ.3.symbols", prompt: "The Statue of Liberty is a symbol of ___.", choices: ["freedom", "fast food", "winter", "homework"], answer: "freedom", explanation: "The Statue of Liberty stands for freedom and welcome." },

  // ===== GRADE 4 ===== (three branches, state government, the Constitution)
  // civ.4.branches
  { grade: "4", skill: "civ.4.branches", prompt: "How many branches does the United States government have?", choices: ["3", "1", "5", "10"], answer: "3", explanation: "The U.S. government has three branches." },
  { grade: "4", skill: "civ.4.branches", prompt: "Which branch of government MAKES the laws?", choices: ["Legislative (Congress)", "Executive (President)", "Judicial (Courts)", "Military"], answer: "Legislative (Congress)", explanation: "The legislative branch, Congress, makes the laws." },
  { grade: "4", skill: "civ.4.branches", prompt: "Which branch of government is led by the President?", choices: ["Executive", "Legislative", "Judicial", "Local"], answer: "Executive", explanation: "The President leads the executive branch, which carries out laws." },
  { grade: "4", skill: "civ.4.branches", prompt: "Which branch decides what laws mean and if they are fair?", choices: ["Judicial (Courts)", "Legislative (Congress)", "Executive (President)", "City Council"], answer: "Judicial (Courts)", explanation: "The judicial branch (the courts) decides what laws mean." },
  // civ.4.stategov
  { grade: "4", skill: "civ.4.stategov", prompt: "The capital of Florida, where the state government meets, is ___.", choices: ["Tallahassee", "Miami", "Jacksonville", "Tampa"], answer: "Tallahassee", explanation: "Florida's state government is in the capital, Tallahassee." },
  // civ.4.constitution
  { grade: "4", skill: "civ.4.constitution", prompt: "The Constitution is a written plan for how the ___ works.", choices: ["government", "weather", "ocean", "calendar"], answer: "government", explanation: "The Constitution sets out how the government works." },
  { grade: "4", skill: "civ.4.constitution", prompt: "The Constitution begins with the famous words 'We the ___.'", choices: ["People", "Robots", "Animals", "Planets"], answer: "People", explanation: "The Constitution begins, 'We the People.'" },
  // civ.4.citizenship
  { grade: "4", skill: "civ.4.citizenship", prompt: "In most U.S. elections, a citizen must be at least ___ years old to vote.", choices: ["18", "10", "25", "5"], answer: "18", explanation: "Citizens must be at least 18 years old to vote." },

  // ===== GRADE 5 ===== (Constitution, checks & balances, levels of government)
  // civ.5.constitution
  { grade: "5", skill: "civ.5.constitution", prompt: "The first ten amendments to the Constitution are called the ___.", choices: ["Bill of Rights", "Top Ten", "Rule Book", "Declaration"], answer: "Bill of Rights", explanation: "The Bill of Rights is the first ten amendments." },
  { grade: "5", skill: "civ.5.constitution", prompt: "An 'amendment' is a ___ to the Constitution.", choices: ["change or addition", "drawing", "song", "vacation"], answer: "change or addition", explanation: "An amendment is a change or addition to the Constitution." },
  // civ.5.checksbalances
  { grade: "5", skill: "civ.5.checksbalances", prompt: "The system that lets each branch limit the power of the others is called ___.", choices: ["checks and balances", "show and tell", "give and take", "rock and roll"], answer: "checks and balances", explanation: "Checks and balances keep any one branch from getting too much power." },
  { grade: "5", skill: "civ.5.checksbalances", prompt: "Splitting government into three branches helps make sure no one branch becomes too ___.", choices: ["powerful", "friendly", "colorful", "quiet"], answer: "powerful", explanation: "Three branches keep power balanced so no branch becomes too powerful." },
  // civ.5.levels
  { grade: "5", skill: "civ.5.levels", prompt: "Government that serves the WHOLE country is the ___ government.", choices: ["federal (national)", "city", "school", "neighborhood"], answer: "federal (national)", explanation: "The federal government serves the entire country." },
  { grade: "5", skill: "civ.5.levels", prompt: "The two parts of Congress are the Senate and the House of ___.", choices: ["Representatives", "Wizards", "Governors", "Mayors"], answer: "Representatives", explanation: "Congress has two parts: the Senate and the House of Representatives." },
  // civ.5.rights
  { grade: "5", skill: "civ.5.rights", prompt: "Serving on a jury and voting are examples of a citizen's ___.", choices: ["civic duties", "hobbies", "chores at home", "sports"], answer: "civic duties", explanation: "Voting and jury service are civic duties of citizens." },

  // ===== ADDITIONAL BANK (deeper coverage) =====
  // K
  { grade: "K", skill: "civ.K.rules", prompt: "Where do we find rules that everyone follows?", choices: ["At school, at home, and in games", "Only in dreams", "Only on the moon", "Nowhere"], answer: "At school, at home, and in games", explanation: "Rules help us at school, at home, and even in games." },
  { grade: "K", skill: "civ.K.helpers", prompt: "Who helps keep streets safe and helps people who are lost?", choices: ["A police officer", "A baker", "A painter", "A clown"], answer: "A police officer", explanation: "Police officers help keep the community safe." },
  { grade: "K", skill: "civ.K.flag", prompt: "How should you act during the Pledge of Allegiance?", choices: ["Stand quietly and show respect", "Run around", "Shout jokes", "Lie down"], answer: "Stand quietly and show respect", explanation: "We stand quietly and respectfully during the Pledge." },
  // 1
  { grade: "1", skill: "civ.1.leaders", prompt: "Who leads the United States?", choices: ["The president", "The principal", "The team captain", "The crossing guard"], answer: "The president", explanation: "The president is the leader of the whole country." },
  { grade: "1", skill: "civ.1.citizen", prompt: "Recycling and not littering help take care of ___.", choices: ["our community and Earth", "only your toys", "no one", "outer space"], answer: "our community and Earth", explanation: "Caring for the environment is part of being a good citizen." },
  { grade: "1", skill: "civ.1.laws", prompt: "Stopping at a stop sign is following a ___.", choices: ["law", "game rule for fun", "secret", "song"], answer: "law", explanation: "Traffic signs are laws that keep everyone safe." },
  // 2
  { grade: "2", skill: "civ.2.government", prompt: "One important job of government is to ___.", choices: ["make laws and keep people safe", "sell candy", "win soccer games", "paint houses"], answer: "make laws and keep people safe", explanation: "Governments make laws and help keep people safe." },
  { grade: "2", skill: "civ.2.voting", prompt: "Before voting for a leader, it is smart to ___.", choices: ["learn about the choices", "close your eyes", "guess quickly", "ask no questions"], answer: "learn about the choices", explanation: "Good voters learn about the choices before deciding." },
  { grade: "2", skill: "civ.2.responsibility", prompt: "Telling the truth and being fair are signs of good ___.", choices: ["character", "weather", "luck", "scenery"], answer: "character", explanation: "Honesty and fairness show good character — important for citizens." },
  // 3
  { grade: "3", skill: "civ.3.localgov", prompt: "Who would you most likely ask to fix a broken park in your town?", choices: ["Local government leaders", "The president alone", "A movie star", "A farmer in another state"], answer: "Local government leaders", explanation: "Local government takes care of town services like parks." },
  { grade: "3", skill: "civ.3.rights", prompt: "Freedom of religion means people can ___.", choices: ["choose their own beliefs", "never have beliefs", "only believe one thing", "be forced to agree"], answer: "choose their own beliefs", explanation: "Freedom of religion lets people choose what to believe." },
  { grade: "3", skill: "civ.3.lawmaking", prompt: "Good laws should treat people ___.", choices: ["fairly and equally", "differently for fun", "unkindly", "as a joke"], answer: "fairly and equally", explanation: "Fair laws treat all people equally." },
  // 4
  { grade: "4", skill: "civ.4.branches", prompt: "The Senate and the House of Representatives together make up ___.", choices: ["Congress", "the Supreme Court", "the White House", "the Army"], answer: "Congress", explanation: "Congress is made up of the Senate and the House of Representatives." },
  { grade: "4", skill: "civ.4.branches", prompt: "The highest court in the United States is the ___.", choices: ["Supreme Court", "City Court", "Traffic Court", "Food Court"], answer: "Supreme Court", explanation: "The Supreme Court is the highest court, part of the judicial branch." },
  { grade: "4", skill: "civ.4.stategov", prompt: "Laws for the whole state of Florida are made by the state ___.", choices: ["legislature", "school board only", "mayor alone", "police"], answer: "legislature", explanation: "A state legislature makes laws for the whole state." },
  // 5
  { grade: "5", skill: "civ.5.constitution", prompt: "The introduction to the Constitution is called the ___.", choices: ["Preamble", "Index", "Glossary", "Appendix"], answer: "Preamble", explanation: "The Preamble is the opening of the Constitution ('We the People…')." },
  { grade: "5", skill: "civ.5.checksbalances", prompt: "The President can reject a law passed by Congress using a ___.", choices: ["veto", "vote", "song", "map"], answer: "veto", explanation: "A veto is the President's power to reject a law — a check on Congress." },
  { grade: "5", skill: "civ.5.levels", prompt: "Government that serves just one city or town is ___ government.", choices: ["local", "federal", "national", "world"], answer: "local", explanation: "Local government serves a single city or town." },
];
