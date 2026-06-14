// SummerSharp History bank — authored & fact-checked, grade-appropriate, and
// kept culturally neutral/uncontroversial for K-5. Florida Social Studies (SS)
// American History strand. Hand-authored; `standard` left null. Each item:
// { grade, skill, prompt, choices, answer, explanation }. Generator sets
// subject="history", shuffles choices, computes the index — `answer` must match
// a choice exactly. Skill tags prefixed `hist.`

export const HISTORY = [
  // ===== KINDERGARTEN ===== (light — past vs. present, time words)
  // hist.K.time
  { grade: "K", skill: "hist.K.time", prompt: "Which word means a time that already happened?", choices: ["Yesterday", "Tomorrow", "Later", "Soon"], answer: "Yesterday", explanation: "Yesterday is in the past — it already happened." },
  { grade: "K", skill: "hist.K.time", prompt: "When you were a baby was in the ___.", choices: ["past", "future", "tomorrow", "next year"], answer: "past", explanation: "Being a baby happened before now, in the past." },
  { grade: "K", skill: "hist.K.time", prompt: "Which comes AFTER today?", choices: ["Tomorrow", "Yesterday", "Last week", "Long ago"], answer: "Tomorrow", explanation: "Tomorrow is the day after today." },
  // hist.K.pastpresent
  { grade: "K", skill: "hist.K.pastpresent", prompt: "Long ago, people traveled in wagons pulled by horses. Today we often travel in ___.", choices: ["cars", "wagons", "dinosaurs", "rockets to school"], answer: "cars", explanation: "Today most people travel by car instead of horse and wagon." },
  { grade: "K", skill: "hist.K.pastpresent", prompt: "A story about things that happened long ago is called ___.", choices: ["history", "weather", "a recipe", "a song"], answer: "history", explanation: "History is the story of what happened in the past." },

  // ===== GRADE 1 ===== (life long ago vs. today, basic symbols/holidays)
  // hist.1.longago
  { grade: "1", skill: "hist.1.longago", prompt: "Long ago, before phones, people often sent messages by writing ___.", choices: ["letters", "text messages", "emails", "video calls"], answer: "letters", explanation: "Long ago people wrote letters to send news to far-away friends." },
  { grade: "1", skill: "hist.1.longago", prompt: "Before electric lights, people lit their homes at night with ___.", choices: ["candles", "TVs", "tablets", "flashlights with batteries"], answer: "candles", explanation: "Long ago, candles and oil lamps gave light at night." },
  { grade: "1", skill: "hist.1.longago", prompt: "How can we learn about how people lived long ago?", choices: ["Old photos and stories", "Watching cartoons", "Eating breakfast", "Playing tag"], answer: "Old photos and stories", explanation: "Old photographs, objects, and stories teach us about the past." },
  // hist.1.symbols
  { grade: "1", skill: "hist.1.symbols", prompt: "What are the colors of the United States flag?", choices: ["Red, white, and blue", "Green and yellow", "Black and orange", "Pink and gray"], answer: "Red, white, and blue", explanation: "The U.S. flag is red, white, and blue." },
  { grade: "1", skill: "hist.1.symbols", prompt: "The bald eagle is a famous symbol of the ___.", choices: ["United States", "ocean", "moon", "alphabet"], answer: "United States", explanation: "The bald eagle is the national bird and a symbol of the U.S." },
  // hist.1.holidays
  { grade: "1", skill: "hist.1.holidays", prompt: "On the Fourth of July, the United States celebrates its ___.", choices: ["birthday (Independence Day)", "first day of school", "harvest", "new year"], answer: "birthday (Independence Day)", explanation: "July 4th is Independence Day, the birthday of the United States." },
  { grade: "1", skill: "hist.1.holidays", prompt: "On which holiday do we honor people who served in the military?", choices: ["Veterans Day", "April Fool's Day", "Earth Day", "Pi Day"], answer: "Veterans Day", explanation: "Veterans Day honors people who served in the armed forces." },

  // ===== GRADE 2 ===== (national symbols, well-known figures, holidays)
  // hist.2.symbols
  { grade: "2", skill: "hist.2.symbols", prompt: "How many stars are on the United States flag today?", choices: ["50", "13", "100", "7"], answer: "50", explanation: "The 50 stars stand for the 50 states." },
  { grade: "2", skill: "hist.2.symbols", prompt: "The 13 stripes on the U.S. flag stand for the first 13 ___.", choices: ["colonies", "presidents", "states today", "holidays"], answer: "colonies", explanation: "The 13 stripes represent the original 13 colonies." },
  { grade: "2", skill: "hist.2.symbols", prompt: "The Statue of Liberty was a gift to the United States from ___.", choices: ["France", "Canada", "Japan", "Brazil"], answer: "France", explanation: "France gave the Statue of Liberty to the United States." },
  // hist.2.figures
  { grade: "2", skill: "hist.2.figures", prompt: "Who was the FIRST president of the United States?", choices: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "Theodore Roosevelt"], answer: "George Washington", explanation: "George Washington was the first U.S. president." },
  { grade: "2", skill: "hist.2.figures", prompt: "Dr. Martin Luther King Jr. is remembered for leading peaceful marches for ___.", choices: ["equal rights", "faster cars", "taller buildings", "longer recess"], answer: "equal rights", explanation: "Dr. King worked peacefully for equal rights and fairness for all people." },
  { grade: "2", skill: "hist.2.figures", prompt: "Abraham Lincoln was a U.S. president who worked to ___.", choices: ["end slavery", "build the first car", "fly to the moon", "invent the phone"], answer: "end slavery", explanation: "President Lincoln worked to end slavery in the United States." },
  // hist.2.holidays
  { grade: "2", skill: "hist.2.holidays", prompt: "Presidents' Day honors ___.", choices: ["U.S. presidents", "teachers", "firefighters", "athletes"], answer: "U.S. presidents", explanation: "Presidents' Day honors the leaders who served as president." },

  // ===== GRADE 3 ===== (early Florida history, explorers, first peoples)
  // hist.3.firstpeoples
  { grade: "3", skill: "hist.3.firstpeoples", prompt: "The very first people to live in Florida long ago were ___.", choices: ["Native Americans", "astronauts", "factory workers", "train engineers"], answer: "Native Americans", explanation: "Native American peoples lived in Florida long before others arrived." },
  { grade: "3", skill: "hist.3.firstpeoples", prompt: "Native Americans long ago got their food by ___.", choices: ["hunting, fishing, and farming", "ordering pizza", "shopping at stores", "using vending machines"], answer: "hunting, fishing, and farming", explanation: "They hunted, fished, and grew crops for food." },
  // hist.3.explorers
  { grade: "3", skill: "hist.3.explorers", prompt: "An explorer is a person who ___.", choices: ["travels to learn about new places", "bakes bread", "fixes cars", "teaches math"], answer: "travels to learn about new places", explanation: "Explorers travel to discover and learn about places new to them." },
  { grade: "3", skill: "hist.3.explorers", prompt: "Long ago, Spanish explorers sailed to Florida across the ___ Ocean.", choices: ["Atlantic", "Pacific", "Arctic", "Indian"], answer: "Atlantic", explanation: "Explorers from Spain crossed the Atlantic Ocean to reach Florida." },
  // hist.3.florida
  { grade: "3", skill: "hist.3.florida", prompt: "St. Augustine, Florida, is known as the oldest ___ in the United States.", choices: ["city", "school", "river", "mountain"], answer: "city", explanation: "St. Augustine is the oldest continuously settled city in the U.S." },
  { grade: "3", skill: "hist.3.florida", prompt: "The name 'Florida' comes from a word that means ___.", choices: ["full of flowers", "very cold", "tall mountains", "big city"], answer: "full of flowers", explanation: "Spanish explorers named it 'La Florida,' meaning full of flowers." },
  // hist.3.timeline
  { grade: "3", skill: "hist.3.timeline", prompt: "A line that shows events in the order they happened is a ___.", choices: ["timeline", "map key", "compass", "grid"], answer: "timeline", explanation: "A timeline lists events in the order they happened." },
  { grade: "3", skill: "hist.3.timeline", prompt: "On a timeline, events on the LEFT usually happened ___ events on the right.", choices: ["before", "after", "at the same time as", "instead of"], answer: "before", explanation: "Timelines go in order, so earlier events are to the left." },

  // ===== GRADE 4 ===== (colonies, founding, Florida statehood)
  // hist.4.colonies
  { grade: "4", skill: "hist.4.colonies", prompt: "How many original colonies became the first United States?", choices: ["13", "50", "7", "20"], answer: "13", explanation: "There were 13 original colonies." },
  { grade: "4", skill: "hist.4.colonies", prompt: "The 13 colonies were located along the ___ coast of North America.", choices: ["Atlantic", "Pacific", "Arctic", "western"], answer: "Atlantic", explanation: "The 13 colonies were along the Atlantic (eastern) coast." },
  // hist.4.independence
  { grade: "4", skill: "hist.4.independence", prompt: "The Declaration of Independence said the colonies were free from the rule of ___.", choices: ["Great Britain", "France", "Spain", "Canada"], answer: "Great Britain", explanation: "The colonies declared independence from Great Britain in 1776." },
  { grade: "4", skill: "hist.4.independence", prompt: "In what year did the United States declare its independence?", choices: ["1776", "1492", "1900", "2000"], answer: "1776", explanation: "The Declaration of Independence was signed in 1776." },
  // hist.4.figures
  { grade: "4", skill: "hist.4.figures", prompt: "Who is often called the main author of the Declaration of Independence?", choices: ["Thomas Jefferson", "George Washington", "Benjamin Franklin", "John Adams"], answer: "Thomas Jefferson", explanation: "Thomas Jefferson was the main writer of the Declaration of Independence." },
  { grade: "4", skill: "hist.4.figures", prompt: "Benjamin Franklin was a famous American known as a writer, inventor, and ___.", choices: ["statesman", "race car driver", "astronaut", "movie star"], answer: "statesman", explanation: "Franklin was an inventor, writer, and leader (statesman) in early America." },
  // hist.4.florida
  { grade: "4", skill: "hist.4.florida", prompt: "Florida became the 27th U.S. state in ___.", choices: ["1845", "1776", "1950", "2001"], answer: "1845", explanation: "Florida joined the United States as the 27th state in 1845." },
  { grade: "4", skill: "hist.4.florida", prompt: "What is the capital city of Florida?", choices: ["Tallahassee", "Miami", "Orlando", "Tampa"], answer: "Tallahassee", explanation: "Tallahassee is the capital of Florida (not its biggest city)." },

  // ===== GRADE 5 ===== (early America, Revolution, Constitution, expansion)
  // hist.5.revolution
  { grade: "5", skill: "hist.5.revolution", prompt: "The war in which the colonies won their independence is the ___.", choices: ["American Revolution", "Civil War", "World War I", "War of the Roses"], answer: "American Revolution", explanation: "The American Revolution won independence from Britain." },
  { grade: "5", skill: "hist.5.revolution", prompt: "Who was the commander of the American army during the Revolution and later the first president?", choices: ["George Washington", "Abraham Lincoln", "Ulysses S. Grant", "Paul Revere"], answer: "George Washington", explanation: "George Washington led the Continental Army and became the first president." },
  // hist.5.founding
  { grade: "5", skill: "hist.5.founding", prompt: "The document that became the plan of government for the United States is the ___.", choices: ["Constitution", "grocery list", "map of Florida", "weather report"], answer: "Constitution", explanation: "The U.S. Constitution is the plan for the country's government." },
  { grade: "5", skill: "hist.5.founding", prompt: "The first ten amendments to the Constitution are called the ___.", choices: ["Bill of Rights", "Top Ten List", "Rule Book", "Pledge"], answer: "Bill of Rights", explanation: "The Bill of Rights is the first ten amendments, protecting people's freedoms." },
  // hist.5.civilwar (neutral, factual)
  { grade: "5", skill: "hist.5.civilwar", prompt: "Abraham Lincoln was president of the United States during the ___.", choices: ["Civil War", "Revolution", "Space Race", "Great Depression"], answer: "Civil War", explanation: "Lincoln led the country during the Civil War." },
  { grade: "5", skill: "hist.5.civilwar", prompt: "The Emancipation Proclamation, issued by Lincoln, declared freedom for ___.", choices: ["enslaved people", "all soldiers", "all farmers", "the colonies"], answer: "enslaved people", explanation: "The Emancipation Proclamation declared that enslaved people would be free." },
  // hist.5.expansion
  { grade: "5", skill: "hist.5.expansion", prompt: "Pioneers traveling west long ago often journeyed in covered ___.", choices: ["wagons", "airplanes", "subways", "submarines"], answer: "wagons", explanation: "Pioneers crossed the country in covered wagons." },
  { grade: "5", skill: "hist.5.expansion", prompt: "The growth of railroads in the 1800s made travel across the country ___.", choices: ["faster", "slower", "impossible", "more expensive than walking"], answer: "faster", explanation: "Railroads let people and goods cross the country much faster." },

  // ===== ADDITIONAL BANK (deeper coverage) =====
  // K
  { grade: "K", skill: "hist.K.time", prompt: "The day before today was ___.", choices: ["yesterday", "tomorrow", "next week", "soon"], answer: "yesterday", explanation: "Yesterday was the day before today." },
  { grade: "K", skill: "hist.K.pastpresent", prompt: "Long ago, kids might write on a small chalkboard called a slate. Today many kids type on a ___.", choices: ["tablet or computer", "rock", "leaf", "cloud"], answer: "tablet or computer", explanation: "Today we often use tablets and computers instead of slates." },
  // 1
  { grade: "1", skill: "hist.1.longago", prompt: "Long ago, families washed clothes by hand. Today many people use a ___.", choices: ["washing machine", "telescope", "skateboard", "kite"], answer: "washing machine", explanation: "Washing machines make cleaning clothes much easier today." },
  { grade: "1", skill: "hist.1.symbols", prompt: "The Liberty Bell is a famous symbol connected to American ___.", choices: ["freedom", "weather", "sports", "cooking"], answer: "freedom", explanation: "The Liberty Bell is a symbol of American freedom." },
  { grade: "1", skill: "hist.1.holidays", prompt: "Memorial Day is a holiday that honors ___.", choices: ["soldiers who died serving the country", "the first day of summer", "school teachers", "famous singers"], answer: "soldiers who died serving the country", explanation: "Memorial Day honors service members who died serving the country." },
  // 2
  { grade: "2", skill: "hist.2.figures", prompt: "Thomas Jefferson is best known for helping write the ___.", choices: ["Declaration of Independence", "first comic book", "rules of baseball", "national anthem"], answer: "Declaration of Independence", explanation: "Jefferson was the main writer of the Declaration of Independence." },
  { grade: "2", skill: "hist.2.symbols", prompt: "The White House is the home and office of the ___.", choices: ["President", "principal", "mayor", "team captain"], answer: "President", explanation: "The President lives and works in the White House." },
  { grade: "2", skill: "hist.2.holidays", prompt: "On Martin Luther King Jr. Day, we remember his work for ___.", choices: ["fairness and equal rights", "faster trains", "new toys", "longer summers"], answer: "fairness and equal rights", explanation: "We honor Dr. King's peaceful work for fairness and equal rights." },
  // 3
  { grade: "3", skill: "hist.3.florida", prompt: "Long ago, Spanish settlers built forts in Florida out of a stone called ___.", choices: ["coquina", "marble", "gold", "ice"], answer: "coquina", explanation: "The fort in St. Augustine was built from coquina, a local shell stone." },
  { grade: "3", skill: "hist.3.explorers", prompt: "Explorers used a tool called a ___ to find directions at sea.", choices: ["compass", "telescope only", "calendar", "thermometer"], answer: "compass", explanation: "A compass helped sailors know which way they were heading." },
  { grade: "3", skill: "hist.3.timeline", prompt: "If you list your birthdays in order from age 1 to now, you are making a ___.", choices: ["timeline", "map", "graph of weather", "shopping list"], answer: "timeline", explanation: "Putting events in time order makes a timeline." },
  // 4
  { grade: "4", skill: "hist.4.colonies", prompt: "People in the 13 colonies were ruled by a king from ___.", choices: ["Great Britain", "Italy", "China", "Mexico"], answer: "Great Britain", explanation: "The colonies were ruled by the British king before independence." },
  { grade: "4", skill: "hist.4.florida", prompt: "Is Tallahassee the largest city in Florida?", choices: ["No, it is the capital but not the largest", "Yes, it is the largest", "It is not in Florida", "It has no people"], answer: "No, it is the capital but not the largest", explanation: "Tallahassee is the capital; larger cities include Jacksonville and Miami." },
  { grade: "4", skill: "hist.4.independence", prompt: "We celebrate the signing of the Declaration of Independence every year on ___.", choices: ["July 4th", "January 1st", "December 25th", "October 31st"], answer: "July 4th", explanation: "Independence Day is July 4th." },
  // 5
  { grade: "5", skill: "hist.5.founding", prompt: "The leaders who helped create the United States government are often called the ___.", choices: ["Founding Fathers", "Pioneers", "Explorers", "Governors"], answer: "Founding Fathers", explanation: "The Founding Fathers helped create the new nation and its government." },
  { grade: "5", skill: "hist.5.revolution", prompt: "The famous battle cry warning that British soldiers were coming is linked to ___.", choices: ["Paul Revere's ride", "the moon landing", "the gold rush", "the first railroad"], answer: "Paul Revere's ride", explanation: "Paul Revere rode to warn that British troops were coming." },
  { grade: "5", skill: "hist.5.expansion", prompt: "Settlers moving west were looking for new ___.", choices: ["land to live and farm on", "video games", "airports", "shopping malls"], answer: "land to live and farm on", explanation: "Pioneers moved west seeking land to farm and settle." },
];
