// Per-skill "how it works" teaching used to re-teach a kid right after a miss.
// Keyed by the internal skill tag (questions.skill, e.g. "3.muldiv"). Authored,
// deterministic content — no LLM in the child's path. Pair this general method
// with the question's own `explanation` (the worked solution) when re-teaching.

export type SkillTeach = { title: string; tip: string };

export const SKILL_TEACH: Record<string, SkillTeach> = {
  // ---- Math ----
  "K.count": { title: "Counting", tip: "Touch each thing once and say one number as you go: 1, 2, 3. The last number you say is how many there are." },
  "K.compare": { title: "Bigger & smaller", tip: "The number you count to later is bigger. 7 comes after 4 when you count, so 7 is bigger than 4." },
  "K.addsub": { title: "Adding & taking away", tip: "To add, start at one number and count up. To take away, count backward. Your fingers can help!" },
  "K.shape": { title: "Shapes", tip: "Count the straight sides to name a shape: a triangle has 3, a square 4, a pentagon 5, a hexagon 6." },
  "1.addsub": { title: "Add & subtract to 20", tip: "Make a 10 first. For 8 + 5, move 2 from the 5 to make 8 into 10, then add the 3 left over: 13." },
  "1.place": { title: "Tens & ones", tip: "In a two-digit number, the left digit is tens and the right is ones. In 27, the 2 means 2 tens (20) and the 7 means 7 ones." },
  "1.compare": { title: "Greater than & less than", tip: "The < and > signs always open toward the bigger number and point at the smaller one. 6 < 9." },
  "1.shape": { title: "Shapes & sides", tip: "Name a 2-D shape by its number of straight sides: triangle 3, square/rectangle 4, pentagon 5, hexagon 6, octagon 8." },
  "2.addsub": { title: "Two-digit add & subtract", tip: "Add the tens and the ones separately, then put them together. 45 + 38 → 70 and 13 → 83." },
  "2.place": { title: "Place value", tip: "Each place is worth 10 times the place to its right: ones, tens, hundreds. In 437 the 4 means 400." },
  "2.skip": { title: "Skip counting", tip: "Add the same amount every time. Counting by 5s: 5, 10, 15, 20 — just keep adding 5." },
  "3.muldiv": { title: "Multiply & divide", tip: "Multiplying is repeated adding: 7 × 6 means 7 groups of 6. Dividing splits into equal groups: 56 ÷ 8 asks how many 8s make 56." },
  "3.perim": { title: "Perimeter", tip: "Perimeter is the distance all the way around. Add up every side. For a rectangle: 2 × (length + width)." },
  "3.frac": { title: "Comparing fractions", tip: "With the same whole, a smaller bottom number means bigger pieces. 1/2 is bigger than 1/4." },
  "3.round": { title: "Rounding", tip: "Look at the digit just to the right. 5 or more rounds up; less than 5 rounds down. 268 to the nearest hundred is 300." },
  "3.area": { title: "Area of a rectangle", tip: "Area = length × width. Count the unit squares that fit inside, or just multiply the two side lengths together." },
  "4.mul": { title: "Multiplying bigger numbers", tip: "Break the number apart. 23 × 4 → (20 × 4) + (3 × 4) = 80 + 12 = 92." },
  "4.frac": { title: "Equivalent fractions", tip: "Multiply (or divide) the top and bottom by the same number. 1/2 = 3/6 because both were multiplied by 3." },
  "4.place": { title: "Place value to thousands", tip: "Each place is 10× the one to its right: ones, tens, hundreds, thousands. In 6,420 the 6 means 6,000." },
  "4.dec": { title: "Decimals & fractions", tip: "The first place after the dot is tenths. 0.7 means 7 tenths, which is 7/10." },
  "4.factor": { title: "Factors & multiples", tip: "Factors are numbers that multiply to make another number (3 × 8 = 24). A multiple is what you get counting by a number: 24 is a multiple of 3 because 3 × 8 = 24." },
  "4.div": { title: "Division", tip: "Division splits a total into equal groups. 144 ÷ 12 asks 'how many 12s make 144?' — and 12 × 12 = 144, so the answer is 12." },
  "5.dec": { title: "Decimal math", tip: "Line up the dots, then add or subtract as usual: 0.40 + 0.35 = 0.75. Multiplying by 10 moves the dot one place right." },
  "5.frac": { title: "Adding fractions", tip: "Make the bottoms match first. 1/2 + 1/4 → change 1/2 to 2/4, then 2/4 + 1/4 = 3/4." },
  "5.order": { title: "Order of operations", tip: "Do multiplication and division before adding and subtracting. 3 + 4 × 2 → 4 × 2 = 8 first, then 3 + 8 = 11." },
  "5.volume": { title: "Volume", tip: "Volume = length × width × height. A 2 × 3 × 4 box holds 2 × 3 × 4 = 24 cubes." },

  // ---- Reading ----
  "K.sound": { title: "Letter sounds & rhymes", tip: "Say the word slowly and listen to the sounds. Words rhyme when they end the same — cat and hat both end in “-at.”" },
  "K.print": { title: "About words", tip: "Letters build words. Count the letters one at a time: d-o-g has 3 letters." },
  "1.phon": { title: "Vowel sounds", tip: "Short vowels say a quick sound (a in “map”); long vowels say their name (a in “cake”). Say it out loud to hear which one." },
  "1.cloze": { title: "Fill in the blank", tip: "Read the whole sentence, then pick the word that both makes sense and sounds right." },
  "1.vocab": { title: "Word meanings", tip: "Think about what the word means. Antonyms are opposites — the opposite of “big” is “small.”" },
  "1.read": { title: "Understanding a story", tip: "Read carefully and look back at the words. The answer is right there in what the story tells you." },
  "2.vocab": { title: "Synonyms, antonyms & prefixes", tip: "Synonyms mean the same (happy/glad); antonyms are opposites (fast/slow). A prefix changes meaning: “re-” means again." },
  "2.main": { title: "Main idea", tip: "The main idea is what the whole passage is mostly about — not just one small detail." },
  "2.foundation": { title: "Syllables & contractions", tip: "Clap the word to count syllables (rab-bit = 2). A contraction joins two words with an apostrophe: do not → don’t." },
  "3.fig": { title: "Figurative language", tip: "A simile compares using “like” or “as.” A metaphor says one thing IS another. Personification gives human actions to things." },
  "3.vocab": { title: "Vocabulary in context", tip: "Use the other words in the sentence as clues to figure out what a new word means." },
  "3.detail": { title: "Supporting details", tip: "Details are the small facts that tell you more about the main idea. Look back in the text to find them." },
  "3.grammar": { title: "Parts of speech", tip: "A noun is a person, place, or thing. A verb is an action. An adjective describes something." },
  "4.theme": { title: "Theme", tip: "The theme is the lesson or message of the story — what the characters (and you) learn by the end." },
  "4.vocab": { title: "Prefixes & suffixes", tip: "Word parts change meaning. “-less” means without (fearless = without fear); “re-” means again." },
  "4.purpose": { title: "Author’s purpose", tip: "Ask why the author wrote it: to inform (teach facts), to persuade (convince you), or to entertain." },
  "5.fig": { title: "Figurative language", tip: "Notice how the words paint a picture. Personification gives human traits to non-human things (“the wind whispered”)." },
  "5.infer": { title: "Making inferences", tip: "An inference is a smart guess using clues in the text plus what you already know — even when it isn’t stated directly." },
  "5.vocab": { title: "Vocabulary in context", tip: "Use the sentence around a tricky word as clues to its meaning." },
  "5.grammar": { title: "Grammar", tip: "Watch pronouns and homophones: use “He and I” as subjects; they’re = they are, their = belongs to them, there = a place." },

  // ---- Science ----
  "K.senses": { title: "The five senses", tip: "We explore the world with five senses: see (eyes), hear (ears), smell (nose), taste (tongue), and touch (skin)." },
  "K.livingnonliving": { title: "Living & non-living", tip: "Living things grow and need food, water, and air. Non-living things — like rocks and toys — do not grow or eat." },
  "K.weather": { title: "Weather", tip: "Weather is what the sky and air are doing: sunny, rainy, windy, or snowy. Clouds are made of tiny drops of water." },
  "K.daynight": { title: "Day & night", tip: "Earth spins like a top. The side facing the sun has daytime; the side turned away has night." },
  "K.pushpull": { title: "Pushes & pulls", tip: "A push moves something away from you; a pull brings it toward you. Both are forces that make things move." },
  "K.animalneeds": { title: "What animals need", tip: "Every animal needs food, water, air, and a safe place (shelter) to live." },
  "1.plants": { title: "Plant parts", tip: "Each part has a job: roots drink water, the stem holds the plant up, leaves make food from sunlight, and flowers make seeds." },
  "1.animalbabies": { title: "Animal babies", tip: "Baby animals usually look like their parents and often have special names: dog→puppy, cat→kitten, cow→calf, frog→tadpole." },
  "1.seasons": { title: "Seasons", tip: "A year has four seasons: spring (plants grow), summer (warm), fall (leaves drop), and winter (cold)." },
  "1.shadow": { title: "Light & shadow", tip: "A shadow forms when a solid object blocks light. Light travels in straight lines, so the blocked spot is dark." },
  "1.materials": { title: "Materials", tip: "Objects are made of materials with different properties: metal is hard, glass is clear, cloth is soft, wood floats." },
  "1.sky": { title: "The sky", tip: "The sun (a star) lights the day; the moon and stars appear at night. The moon shines by reflecting the sun's light." },
  "2.matter": { title: "States of matter", tip: "Matter has three states: solid (keeps its shape), liquid (pours), and gas (spreads out). Heating and cooling can change the state." },
  "2.lifecycle": { title: "Life cycles", tip: "Living things change as they grow. A butterfly goes egg → caterpillar → chrysalis → butterfly." },
  "2.magnets": { title: "Magnets", tip: "Magnets pull on iron and steel — not plastic, wood, or paper. Two magnets can attract (pull) or repel (push)." },
  "2.weather": { title: "Measuring weather", tip: "We use tools to measure weather: a thermometer for temperature and a weather vane for wind direction. Weather changes day to day." },
  "2.habitats": { title: "Habitats", tip: "A habitat is an animal's home that gives it food, water, and shelter. Animals live where they fit best (fish→water, camel→desert)." },
  "3.watercycle": { title: "The water cycle", tip: "The sun evaporates water into vapor → it condenses into clouds → it falls as precipitation (rain/snow) → it collects in rivers and lakes." },
  "3.energy": { title: "Forms of energy", tip: "Energy comes in forms — light, heat, sound, and electrical. The sun gives light and heat; a drum makes sound." },
  "3.forces": { title: "Forces & motion", tip: "A force is a push or pull that changes how something moves. Gravity pulls things down; friction slows them." },
  "3.matterchange": { title: "Changing matter", tip: "Heating and cooling change matter's state (water ↔ ice ↔ steam). Melting and freezing can be reversed." },
  "3.soilrocks": { title: "Soil & rocks", tip: "Soil is made of broken-down rock and rotted plants. Over a long time, wind and water break rocks apart — that's weathering." },
  "4.circuits": { title: "Circuits", tip: "Electricity needs a complete path: a battery for energy, wires (conductors), and a switch. Break the path and the bulb goes out." },
  "4.energytransfer": { title: "Energy transfer", tip: "Energy moves and changes form. Heat flows from hot to cold; a lamp changes electrical energy into light and heat." },
  "4.weatherclimate": { title: "Weather vs. climate", tip: "Weather is what's happening now; climate is the usual pattern over many years. Places near the equator stay warm." },
  "4.moon": { title: "Moon phases", tip: "The moon reflects sunlight. As it orbits Earth (about a month), we see different amounts lit — its phases, from new moon to full moon." },
  "4.adaptations": { title: "Adaptations", tip: "An adaptation is a feature that helps a living thing survive: thick fur for cold, a cactus storing water, gills for breathing underwater." },
  "5.solar": { title: "The solar system", tip: "The Sun (a star) is at the center; planets orbit it. Earth is our planet, Jupiter is the largest, and Mars is the Red Planet." },
  "5.matter": { title: "Matter & changes", tip: "All matter is made of tiny particles. A physical change (melting) keeps the same substance; a chemical change (burning) makes a new one. Mass stays the same." },
  "5.forcemotion": { title: "Force & motion", tip: "Forces (pushes and pulls) change an object's speed or direction. Gravity pulls down, friction resists motion, and heavier things need more force." },
  "5.foodweb": { title: "Food webs", tip: "Energy flows from the Sun → producers (plants) → consumers (herbivores, then carnivores) → decomposers, which return nutrients to the soil." },
  "5.body": { title: "Body systems", tip: "Your body has systems: the heart pumps blood, lungs take in oxygen, the brain leads the nervous system, bones support you, and the digestive system breaks down food." },
  "5.watercycle": { title: "The water cycle", tip: "Powered by the Sun, water cycles forever: evaporation (liquid→vapor), condensation (vapor→clouds), precipitation (rain/snow), then collection." },

  // ---- Geography ----
  "geo.K.maps": { title: "Maps & globes", tip: "A map is a drawing that shows where places are; a globe is a round map of the whole Earth." },
  "geo.K.landwater": { title: "Land & water", tip: "Land is solid ground like hills and fields; water is oceans, lakes, and rivers — usually shown blue on a map." },
  "geo.K.community": { title: "My community", tip: "A community is where people live, work, and play — like home, school, the library, and the post office." },
  "geo.K.directions": { title: "Position words", tip: "Words like up, down, left, and right tell where something is." },
  "geo.1.directions": { title: "Cardinal directions", tip: "North, South, East, and West are the four main directions. The sun rises in the East and sets in the West." },
  "geo.1.mapkey": { title: "Map key & symbols", tip: "A map key (legend) explains the symbols, the compass rose shows directions, and a star often marks a capital city." },
  "geo.1.landforms": { title: "Landforms", tip: "Mountains are tall, rivers flow across the land, a lake has land around it, and an island has water all around it." },
  "geo.1.community": { title: "Communities", tip: "A community is where people live together; a city is bigger and has more people than a small town." },
  "geo.2.continents": { title: "Continents", tip: "Earth has 7 continents. We live in North America, and Asia is the largest continent." },
  "geo.2.oceans": { title: "Oceans", tip: "Earth has 5 oceans, and the Pacific is the largest. Water covers most of Earth's surface." },
  "geo.2.landforms": { title: "Landforms", tip: "A desert is dry, a coast is where land meets the sea, and a valley is low land between hills." },
  "geo.2.globe": { title: "The globe", tip: "The equator is an imaginary line around Earth's middle; the North and South Poles are the top and bottom." },
  "geo.3.florida": { title: "Florida geography", tip: "Florida is a peninsula (water on 3 sides): the Atlantic is on the east, the Gulf of Mexico on the west, and the Everglades in the south." },
  "geo.3.maptools": { title: "Map tools", tip: "A map scale measures real distance, and a grid of crossing lines helps you find places." },
  "geo.3.usregions": { title: "The United States", tip: "The U.S. has 50 states, with Canada to the north and Mexico to the south." },
  "geo.3.landforms": { title: "More landforms", tip: "A plain is flat open land, a canyon is a deep valley with steep sides, and a peninsula has water on three sides." },
  "geo.4.usa": { title: "U.S. features", tip: "The Rocky Mountains are in the west, the Appalachians in the east, and the Great Lakes sit on the U.S.–Canada border." },
  "geo.4.regions": { title: "Regions & climate", tip: "Regions differ by climate — deserts are dry, forests are rainy, and land near the equator is warm." },
  "geo.4.hemispheres": { title: "Hemispheres", tip: "The equator splits Earth into Northern and Southern halves; the Prime Meridian splits it into Eastern and Western." },
  "geo.4.resources": { title: "Natural resources", tip: "Water, soil, and trees are natural resources. Renewable ones, like trees and sunlight, can be replaced over time." },
  "geo.5.world": { title: "World geography", tip: "Asia is the largest and most populated continent, Australia is the smallest, and Antarctica is covered in ice." },
  "geo.5.latlong": { title: "Latitude & longitude", tip: "Latitude lines run east–west (the equator is 0°); longitude lines run north–south (the Prime Meridian is 0°)." },
  "geo.5.physical": { title: "World landmarks", tip: "The Sahara is the largest hot desert, the Nile is the longest river, and Mount Everest is the tallest mountain." },
  "geo.5.usa": { title: "U.S. geography", tip: "The Pacific Ocean is on the U.S. west coast and the Atlantic on the east; Alaska is the largest state and Hawaii is a chain of islands." },

  // ---- History ----
  "hist.K.time": { title: "Past, present, future", tip: "Yesterday is the past, today is now, and tomorrow is the future. Time words put events in order." },
  "hist.K.pastpresent": { title: "Then & now", tip: "Long ago, people traveled by horse and wagon and lit homes with candles; today we use cars and electric lights." },
  "hist.1.longago": { title: "Life long ago", tip: "Before phones and machines, people wrote letters, washed clothes by hand, and used candles. Old photos and stories teach us about it." },
  "hist.1.symbols": { title: "American symbols", tip: "The flag is red, white, and blue; the bald eagle and the Liberty Bell are symbols of the United States." },
  "hist.1.holidays": { title: "National holidays", tip: "July 4th is Independence Day; Veterans Day and Memorial Day honor people who served in the military." },
  "hist.2.symbols": { title: "National symbols", tip: "The flag's 50 stars stand for the 50 states and its 13 stripes for the first 13 colonies; the Statue of Liberty was a gift from France." },
  "hist.2.figures": { title: "Famous Americans", tip: "George Washington was the first president, Abraham Lincoln worked to end slavery, and Dr. Martin Luther King Jr. led peaceful marches for equal rights." },
  "hist.2.holidays": { title: "Holidays we honor", tip: "Presidents' Day honors U.S. presidents, and Martin Luther King Jr. Day remembers his work for fairness and equal rights." },
  "hist.3.firstpeoples": { title: "Florida's first peoples", tip: "Native Americans lived in Florida long before others arrived, getting food by hunting, fishing, and farming." },
  "hist.3.explorers": { title: "Explorers", tip: "Explorers travel to learn about new places. Spanish explorers crossed the Atlantic Ocean to reach Florida, using a compass to find their way." },
  "hist.3.florida": { title: "Early Florida", tip: "St. Augustine is the oldest city in the U.S. Spanish settlers named the land 'La Florida' (full of flowers) and built forts of coquina stone." },
  "hist.3.timeline": { title: "Timelines", tip: "A timeline shows events in the order they happened, with earlier events on the left." },
  "hist.4.colonies": { title: "The 13 colonies", tip: "There were 13 original colonies along the Atlantic coast, ruled by the king of Great Britain before independence." },
  "hist.4.independence": { title: "Independence", tip: "In 1776 the Declaration of Independence said the colonies were free from Great Britain. We celebrate on July 4th." },
  "hist.4.figures": { title: "Founding figures", tip: "Thomas Jefferson was the main writer of the Declaration of Independence, and Benjamin Franklin was a famous inventor and statesman." },
  "hist.4.florida": { title: "Florida history", tip: "Florida became the 27th state in 1845. Its capital is Tallahassee — the capital, but not the largest city." },
  "hist.5.revolution": { title: "The American Revolution", tip: "The colonies won independence in the American Revolution. George Washington led the army and became the first president." },
  "hist.5.founding": { title: "Founding the nation", tip: "The Constitution is the plan for the government; its first ten amendments are the Bill of Rights. The Founding Fathers created the new nation." },
  "hist.5.civilwar": { title: "The Civil War", tip: "Abraham Lincoln was president during the Civil War, and his Emancipation Proclamation declared that enslaved people would be free." },
  "hist.5.expansion": { title: "Moving west", tip: "Pioneers traveled west in covered wagons seeking land to farm; railroads later made crossing the country much faster." },

  // ---- Civics ----
  "civ.K.rules": { title: "Why we have rules", tip: "Rules keep everyone safe and fair. We follow them at school, at home, in games, and on the road." },
  "civ.K.helpers": { title: "Community helpers", tip: "Helpers keep us safe and healthy: firefighters, police officers, doctors, and mail carriers." },
  "civ.K.flag": { title: "The flag & pledge", tip: "We stand quietly and respectfully to say the Pledge of Allegiance to the United States flag." },
  "civ.1.laws": { title: "Rules & laws", tip: "A law is a rule everyone in a community must follow, like stopping at a stop sign or wearing a seatbelt." },
  "civ.1.leaders": { title: "Leaders", tip: "A principal leads a school, a mayor leads a city or town, and the president leads the whole country." },
  "civ.1.citizen": { title: "Good citizens", tip: "Good citizens are respectful, follow rules, help others, and take care of their community and the Earth." },
  "civ.1.symbols": { title: "National symbols", tip: "Symbols like the bald eagle and the flag stand for the United States." },
  "civ.2.government": { title: "What government does", tip: "Government is the group of people who make laws and lead. The president leads the U.S., and the capital is Washington, D.C." },
  "civ.2.voting": { title: "Voting", tip: "Voting is how citizens choose their leaders. The choice with the most votes (the majority) wins." },
  "civ.2.responsibility": { title: "Responsibilities", tip: "Citizens have responsibilities: following laws, being honest and fair, and helping others." },
  "civ.3.localgov": { title: "Local government", tip: "Local government runs town services like police, libraries, and parks. A governor leads a state." },
  "civ.3.lawmaking": { title: "Making laws", tip: "Communities make laws to keep people safe and treat them fairly. If a rule seems unfair, people can speak up to change it." },
  "civ.3.rights": { title: "Rights & freedoms", tip: "Rights are freedoms everyone has, like freedom of speech (sharing ideas) and freedom of religion (choosing your beliefs)." },
  "civ.3.symbols": { title: "Symbols of freedom", tip: "The Statue of Liberty is a symbol of freedom and welcome." },
  "civ.4.branches": { title: "Three branches", tip: "Government has 3 branches: legislative (Congress) makes laws, executive (President) carries them out, judicial (courts) decide what they mean." },
  "civ.4.stategov": { title: "State government", tip: "A state legislature makes laws for the whole state; Florida's government meets in the capital, Tallahassee." },
  "civ.4.constitution": { title: "The Constitution", tip: "The Constitution is the written plan for how the government works. It begins, 'We the People.'" },
  "civ.4.citizenship": { title: "Citizenship", tip: "Citizens have duties like voting. In most U.S. elections you must be at least 18 to vote." },
  "civ.5.constitution": { title: "Constitution & rights", tip: "The Constitution opens with the Preamble; its first ten amendments are the Bill of Rights. An amendment is a change or addition." },
  "civ.5.checksbalances": { title: "Checks & balances", tip: "Each branch can limit the others (for example, the President can veto a law) so no branch becomes too powerful." },
  "civ.5.levels": { title: "Levels of government", tip: "Local government serves a city, state government a whole state, and the federal government the entire country. Congress = Senate + House of Representatives." },
  "civ.5.rights": { title: "Civic duties", tip: "Voting and serving on a jury are civic duties that citizens do to help their country." },

  // ---- Economics ----
  "econ.K.needswants": { title: "Needs & wants", tip: "Needs keep you alive — food, water, and a home. Wants are nice extras like toys, candy, and games." },
  "econ.K.money": { title: "Money", tip: "People use money to buy things. Pennies, nickels, and dimes are coins. With limited money you can't buy everything." },
  "econ.K.jobs": { title: "Jobs", tip: "People work at jobs to earn money. A baker bakes, a teacher teaches, a farmer grows food." },
  "econ.1.needswants": { title: "Needs vs. wants", tip: "When money is limited, pay for needs (food, water, shelter) before wants (toys, games)." },
  "econ.1.goodsservices": { title: "Goods & services", tip: "A good is an object you can touch and own (a book). A service is helpful work someone does for you (a haircut)." },
  "econ.1.money": { title: "Spending money", tip: "Things that cost more money are more expensive. Earned money pays for needs and wants." },
  "econ.1.jobs": { title: "Workers", tip: "People do many jobs — a farmer grows food, and the money they earn buys what they need and want." },
  "econ.2.goodsservices": { title: "Goods & services", tip: "Goods are objects you can hold (a toy); services are work people do for you (teaching, a doctor's checkup)." },
  "econ.2.saving": { title: "Saving & spending", tip: "Saving means keeping money to use later, kept safe in a piggy bank or a real bank. Save up over time for bigger things." },
  "econ.2.money": { title: "Money values", tip: "One dollar equals 100 cents. A quarter is 25¢, so four quarters make a dollar. A quarter is worth more than a dime, nickel, or penny." },
  "econ.2.trade": { title: "Trading", tip: "Bartering means trading goods or services without using money." },
  "econ.3.scarcity": { title: "Scarcity", tip: "Scarcity means there isn't enough for everyone's wants, so people must make choices." },
  "econ.3.producerconsumer": { title: "Producers & consumers", tip: "A producer makes or sells goods and services; a consumer buys and uses them." },
  "econ.3.choices": { title: "Trade-offs", tip: "When you choose one thing, the thing you give up is the trade-off." },
  "econ.3.income": { title: "Income", tip: "Income is money you receive — from a job, an allowance, or a gift." },
  "econ.4.opportunitycost": { title: "Opportunity cost", tip: "Opportunity cost is the next-best thing you give up when you make a choice." },
  "econ.4.budget": { title: "Budgeting", tip: "A budget is a plan for how to earn, spend, and save money. Spending less than you earn lets you save." },
  "econ.4.supplydemand": { title: "Supply & demand", tip: "Supply is how much is available; demand is how much people want it. High demand and low supply push prices up." },
  "econ.4.business": { title: "Business & profit", tip: "Profit is the money a business has left after paying its costs." },
  "econ.5.market": { title: "Markets", tip: "A market is where goods and services are bought and sold. Prices come from buyers and sellers, and sellers compete for customers." },
  "econ.5.banking": { title: "Banking", tip: "A bank keeps money safe and pays interest on savings. A loan is borrowed money you repay, usually with interest." },
  "econ.5.specialization": { title: "Specialization & trade", tip: "Specialization means focusing on what you do best, then trading for the rest, since no one can make everything." },
  "econ.5.taxes": { title: "Taxes", tip: "Taxes are money paid to the government to fund public services like roads, schools, and parks." },
};

export function teachFor(skill?: string | null): SkillTeach | null {
  return skill ? SKILL_TEACH[skill] ?? null : null;
}

/** Parent-facing standing for a skill the child has actually attempted. */
export type SkillStanding = "strong" | "building" | "focus";

/**
 * Classify an attempted skill for the parent view. Derived from the integer
 * counts (NOT the RPC's numeric `accuracy`, which is a 0–1 fraction that can
 * arrive as a string). `mastered` is "doing great"; a low hit-rate or a recent
 * miss flags it as something to focus on.
 */
export function skillStanding(m: {
  state: string;
  attempts: number;
  correct: number;
  last_correct: boolean;
}): SkillStanding {
  if (m.state === "mastered") return "strong";
  const rate = m.attempts > 0 ? m.correct / m.attempts : 0;
  if (!m.last_correct || rate < 0.6) return "focus";
  return "building";
}

/** Friendly title for a skill, falling back to a cleaned-up version of the code. */
export function skillTitle(skill: string): string {
  const authored = SKILL_TEACH[skill]?.title;
  if (authored) return authored;
  // e.g. "3.muldiv" -> "muldiv"; keep it readable rather than showing the code raw.
  return skill.replace(/^[A-Za-z0-9]+\./, "").replace(/[_-]+/g, " ");
}
