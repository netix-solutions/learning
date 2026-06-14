// SummerSharp Geography bank — authored & fact-checked, grade-appropriate.
// Florida Social Studies (SS) Geography strand. Hand-authored (not generated);
// `standard` is left null (we don't fabricate SS codes). Each item:
// { grade, skill, prompt, choices, answer, explanation }. The generator sets
// subject="geography", shuffles choices, and computes the answer index — so
// `answer` must match one of `choices` exactly. Skill tags are prefixed `geo.`
// so they never collide with other subjects.

export const GEOGRAPHY = [
  // ===== KINDERGARTEN =====
  // geo.K.maps
  { grade: "K", skill: "geo.K.maps", prompt: "What is a map?", choices: ["A picture that shows where places are", "A kind of food", "A type of animal", "A song"], answer: "A picture that shows where places are", explanation: "A map is a drawing that shows where places are." },
  { grade: "K", skill: "geo.K.maps", prompt: "What do we call a round model of the Earth?", choices: ["A globe", "A ball pit", "A clock", "A box"], answer: "A globe", explanation: "A globe is a round model of the Earth." },
  { grade: "K", skill: "geo.K.maps", prompt: "A map helps you find ___.", choices: ["where places are", "what time it is", "how you feel", "what to eat"], answer: "where places are", explanation: "Maps show us where places are and how to get there." },
  // geo.K.landwater
  { grade: "K", skill: "geo.K.landwater", prompt: "Which one is a large body of water?", choices: ["An ocean", "A mountain", "A desert", "A forest"], answer: "An ocean", explanation: "An ocean is a very large body of water." },
  { grade: "K", skill: "geo.K.landwater", prompt: "On most maps, the blue color usually shows ___.", choices: ["water", "grass", "roads", "houses"], answer: "water", explanation: "Map makers usually color water blue." },
  { grade: "K", skill: "geo.K.landwater", prompt: "Which one is land, not water?", choices: ["A hill", "A lake", "An ocean", "A river"], answer: "A hill", explanation: "A hill is land. Lakes, oceans, and rivers are water." },
  // geo.K.community
  { grade: "K", skill: "geo.K.community", prompt: "Where do you go to learn and meet your teacher?", choices: ["School", "The ocean", "A farm far away", "A cave"], answer: "School", explanation: "School is a place in your community where you learn." },
  { grade: "K", skill: "geo.K.community", prompt: "Which place do you call home?", choices: ["The place where you live", "The grocery store", "The zoo", "The moon"], answer: "The place where you live", explanation: "Home is the place where you live." },
  { grade: "K", skill: "geo.K.community", prompt: "Where would you go to borrow books to read?", choices: ["The library", "The gas station", "The beach", "The airport"], answer: "The library", explanation: "A library is where you borrow books." },
  // geo.K.directions
  { grade: "K", skill: "geo.K.directions", prompt: "Which word tells a direction?", choices: ["Up", "Apple", "Blue", "Happy"], answer: "Up", explanation: "Up is a direction — it tells which way to go." },
  { grade: "K", skill: "geo.K.directions", prompt: "If something is below you, it is ___.", choices: ["down", "up", "loud", "warm"], answer: "down", explanation: "Below means down, under you." },

  // ===== GRADE 1 =====
  // geo.1.directions — cardinal directions
  { grade: "1", skill: "geo.1.directions", prompt: "What are the four main directions called?", choices: ["North, South, East, West", "Up, Down, Left, Right", "Red, Blue, Green, Yellow", "One, Two, Three, Four"], answer: "North, South, East, West", explanation: "The four cardinal directions are North, South, East, and West." },
  { grade: "1", skill: "geo.1.directions", prompt: "On a map, which direction is usually at the top?", choices: ["North", "South", "East", "West"], answer: "North", explanation: "On most maps, North points to the top." },
  { grade: "1", skill: "geo.1.directions", prompt: "The sun rises in the ___.", choices: ["East", "West", "North", "South"], answer: "East", explanation: "The sun rises in the East and sets in the West." },
  // geo.1.mapkey
  { grade: "1", skill: "geo.1.mapkey", prompt: "The part of a map that explains what the symbols mean is the ___.", choices: ["map key", "title page", "phone", "clock"], answer: "map key", explanation: "A map key (or legend) tells what each symbol stands for." },
  { grade: "1", skill: "geo.1.mapkey", prompt: "A small star on a map often shows a ___.", choices: ["capital city", "river", "tree", "cloud"], answer: "capital city", explanation: "A star is a common map symbol for a capital city." },
  { grade: "1", skill: "geo.1.mapkey", prompt: "The compass rose on a map shows the ___.", choices: ["directions", "weather", "time", "price"], answer: "directions", explanation: "A compass rose shows North, South, East, and West." },
  // geo.1.landforms
  { grade: "1", skill: "geo.1.landforms", prompt: "Which landform is very tall with steep sides?", choices: ["A mountain", "A lake", "A field", "A pond"], answer: "A mountain", explanation: "A mountain is a tall landform that rises high above the land." },
  { grade: "1", skill: "geo.1.landforms", prompt: "Water that flows in a long path across the land is a ___.", choices: ["river", "mountain", "desert", "hill"], answer: "river", explanation: "A river is moving water that flows across the land." },
  { grade: "1", skill: "geo.1.landforms", prompt: "A piece of land with water all around it is an ___.", choices: ["island", "ocean", "valley", "hill"], answer: "island", explanation: "An island has water on every side." },
  // geo.1.community
  { grade: "1", skill: "geo.1.community", prompt: "A group of homes, stores, and schools near each other is a ___.", choices: ["community", "planet", "color", "season"], answer: "community", explanation: "A community is a place where people live, work, and play together." },
  { grade: "1", skill: "geo.1.community", prompt: "A city is usually ___ than a small town.", choices: ["bigger", "smaller", "colder", "rounder"], answer: "bigger", explanation: "A city has more people and buildings than a small town." },

  // ===== GRADE 2 =====
  // geo.2.continents
  { grade: "2", skill: "geo.2.continents", prompt: "How many continents are there on Earth?", choices: ["7", "5", "3", "12"], answer: "7", explanation: "Earth has 7 continents." },
  { grade: "2", skill: "geo.2.continents", prompt: "Which of these is a continent?", choices: ["Africa", "Florida", "The Pacific", "Texas"], answer: "Africa", explanation: "Africa is one of the 7 continents." },
  { grade: "2", skill: "geo.2.continents", prompt: "Which continent do we live on in the United States?", choices: ["North America", "Europe", "Asia", "Africa"], answer: "North America", explanation: "The United States is on the continent of North America." },
  { grade: "2", skill: "geo.2.continents", prompt: "Which is the largest continent?", choices: ["Asia", "Antarctica", "Europe", "Australia"], answer: "Asia", explanation: "Asia is the biggest continent." },
  // geo.2.oceans
  { grade: "2", skill: "geo.2.oceans", prompt: "How many oceans are there on Earth?", choices: ["5", "2", "7", "10"], answer: "5", explanation: "Earth has 5 oceans." },
  { grade: "2", skill: "geo.2.oceans", prompt: "Which is the largest ocean?", choices: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], answer: "Pacific Ocean", explanation: "The Pacific is the biggest ocean." },
  { grade: "2", skill: "geo.2.oceans", prompt: "Most of the Earth's surface is covered by ___.", choices: ["water", "ice cream", "sand", "buildings"], answer: "water", explanation: "Water covers most of the Earth." },
  // geo.2.landforms
  { grade: "2", skill: "geo.2.landforms", prompt: "A low area of land between mountains or hills is a ___.", choices: ["valley", "peak", "island", "coast"], answer: "valley", explanation: "A valley is the low land between hills or mountains." },
  { grade: "2", skill: "geo.2.landforms", prompt: "A dry place that gets very little rain is a ___.", choices: ["desert", "rainforest", "lake", "swamp"], answer: "desert", explanation: "A desert is a dry place with little rain." },
  { grade: "2", skill: "geo.2.landforms", prompt: "Where the land meets the ocean is called the ___.", choices: ["coast", "valley", "peak", "plain"], answer: "coast", explanation: "The coast is where land meets the sea." },
  // geo.2.globe
  { grade: "2", skill: "geo.2.globe", prompt: "The imaginary line around the middle of the Earth is the ___.", choices: ["equator", "border", "highway", "coast"], answer: "equator", explanation: "The equator is the imaginary line around the Earth's middle." },
  { grade: "2", skill: "geo.2.globe", prompt: "The very top of the Earth on a globe is the ___.", choices: ["North Pole", "South Pole", "equator", "coast"], answer: "North Pole", explanation: "The North Pole is at the top of the globe." },

  // ===== GRADE 3 =====
  // geo.3.florida
  { grade: "3", skill: "geo.3.florida", prompt: "Florida is a peninsula, which means it is surrounded by water on ___.", choices: ["three sides", "all four sides", "no sides", "the top only"], answer: "three sides", explanation: "A peninsula has water on three sides; Florida is a peninsula." },
  { grade: "3", skill: "geo.3.florida", prompt: "Which ocean borders the east coast of Florida?", choices: ["Atlantic Ocean", "Pacific Ocean", "Arctic Ocean", "Indian Ocean"], answer: "Atlantic Ocean", explanation: "The Atlantic Ocean is on Florida's east coast." },
  { grade: "3", skill: "geo.3.florida", prompt: "The large body of water on Florida's west coast is the ___.", choices: ["Gulf of Mexico", "Pacific Ocean", "Great Lakes", "Red Sea"], answer: "Gulf of Mexico", explanation: "The Gulf of Mexico is on Florida's west side." },
  { grade: "3", skill: "geo.3.florida", prompt: "The famous wetland in southern Florida is the ___.", choices: ["Everglades", "Sahara", "Grand Canyon", "Rocky Mountains"], answer: "Everglades", explanation: "The Everglades is a large wetland in south Florida." },
  // geo.3.maptools
  { grade: "3", skill: "geo.3.maptools", prompt: "The map tool that helps you measure real distance is the ___.", choices: ["map scale", "title", "color", "border"], answer: "map scale", explanation: "A map scale shows how distance on the map matches real distance." },
  { grade: "3", skill: "geo.3.maptools", prompt: "Lines that cross to help you find places on a map form a ___.", choices: ["grid", "river", "road", "rainbow"], answer: "grid", explanation: "A map grid uses crossing lines to locate places." },
  // geo.3.usregions
  { grade: "3", skill: "geo.3.usregions", prompt: "How many states are in the United States?", choices: ["50", "13", "100", "25"], answer: "50", explanation: "The United States has 50 states." },
  { grade: "3", skill: "geo.3.usregions", prompt: "Which country is directly NORTH of the United States?", choices: ["Canada", "Mexico", "Brazil", "Japan"], answer: "Canada", explanation: "Canada is the country north of the United States." },
  { grade: "3", skill: "geo.3.usregions", prompt: "Which country is directly SOUTH of the United States?", choices: ["Mexico", "Canada", "France", "China"], answer: "Mexico", explanation: "Mexico is the country south of the United States." },
  // geo.3.landforms
  { grade: "3", skill: "geo.3.landforms", prompt: "A large area of flat, open land is a ___.", choices: ["plain", "peak", "canyon", "island"], answer: "plain", explanation: "A plain is a wide, flat stretch of land." },
  { grade: "3", skill: "geo.3.landforms", prompt: "A deep valley with steep rocky sides, often cut by a river, is a ___.", choices: ["canyon", "hill", "beach", "pond"], answer: "canyon", explanation: "A canyon is a deep valley with steep sides." },

  // ===== GRADE 4 =====
  // geo.4.usa
  { grade: "4", skill: "geo.4.usa", prompt: "Which mountain range runs along the western United States?", choices: ["Rocky Mountains", "Appalachian Mountains", "Andes Mountains", "Alps"], answer: "Rocky Mountains", explanation: "The Rocky Mountains run through the western U.S." },
  { grade: "4", skill: "geo.4.usa", prompt: "The Mississippi River is one of the longest rivers in ___.", choices: ["North America", "Africa", "Europe", "Australia"], answer: "North America", explanation: "The Mississippi is a major North American river." },
  { grade: "4", skill: "geo.4.usa", prompt: "The five large lakes between the U.S. and Canada are the ___.", choices: ["Great Lakes", "Finger Lakes", "Salt Lakes", "Clear Lakes"], answer: "Great Lakes", explanation: "The Great Lakes are five large lakes on the U.S.–Canada border." },
  // geo.4.regions
  { grade: "4", skill: "geo.4.regions", prompt: "A region with a hot, sandy climate and little rain is a ___ region.", choices: ["desert", "polar", "tropical rainforest", "wetland"], answer: "desert", explanation: "Deserts are hot or dry regions with little rainfall." },
  { grade: "4", skill: "geo.4.regions", prompt: "Places near the equator usually have a climate that is ___.", choices: ["warm", "very cold", "snowy all year", "freezing"], answer: "warm", explanation: "Land near the equator gets the most direct sunlight, so it is warm." },
  // geo.4.hemispheres
  { grade: "4", skill: "geo.4.hemispheres", prompt: "The equator divides the Earth into the Northern and ___ Hemispheres.", choices: ["Southern", "Eastern", "Western", "Central"], answer: "Southern", explanation: "The equator splits Earth into Northern and Southern Hemispheres." },
  { grade: "4", skill: "geo.4.hemispheres", prompt: "The Prime Meridian divides Earth into the Eastern and ___ Hemispheres.", choices: ["Western", "Northern", "Southern", "Polar"], answer: "Western", explanation: "The Prime Meridian splits Earth into Eastern and Western Hemispheres." },
  // geo.4.resources
  { grade: "4", skill: "geo.4.resources", prompt: "Water, soil, and trees are examples of ___.", choices: ["natural resources", "machines", "buildings", "money"], answer: "natural resources", explanation: "Natural resources come from nature, like water, soil, and trees." },
  { grade: "4", skill: "geo.4.resources", prompt: "Florida's warm, sunny climate is great for growing ___.", choices: ["oranges", "snow", "ice", "cactus forests"], answer: "oranges", explanation: "Florida's warm climate is famous for growing oranges." },

  // ===== GRADE 5 =====
  // geo.5.world
  { grade: "5", skill: "geo.5.world", prompt: "Which is the smallest continent?", choices: ["Australia", "Asia", "Africa", "Europe"], answer: "Australia", explanation: "Australia is the smallest continent." },
  { grade: "5", skill: "geo.5.world", prompt: "Which continent is almost entirely covered in ice?", choices: ["Antarctica", "Africa", "South America", "Europe"], answer: "Antarctica", explanation: "Antarctica, at the South Pole, is covered in ice." },
  { grade: "5", skill: "geo.5.world", prompt: "The largest country by land area in the world is ___.", choices: ["Russia", "the United States", "Italy", "Egypt"], answer: "Russia", explanation: "Russia is the world's largest country by land area." },
  // geo.5.latlong
  { grade: "5", skill: "geo.5.latlong", prompt: "Lines that run east–west and measure distance from the equator are lines of ___.", choices: ["latitude", "longitude", "elevation", "color"], answer: "latitude", explanation: "Latitude lines run east–west and measure north–south position." },
  { grade: "5", skill: "geo.5.latlong", prompt: "Lines that run north–south from pole to pole are lines of ___.", choices: ["longitude", "latitude", "altitude", "temperature"], answer: "longitude", explanation: "Longitude lines run north–south between the poles." },
  { grade: "5", skill: "geo.5.latlong", prompt: "The equator is located at ___ degrees latitude.", choices: ["0", "90", "45", "180"], answer: "0", explanation: "The equator is 0° latitude, halfway between the poles." },
  // geo.5.physical
  { grade: "5", skill: "geo.5.physical", prompt: "The largest hot desert in the world is the ___.", choices: ["Sahara", "Gobi", "Mojave", "Everglades"], answer: "Sahara", explanation: "The Sahara, in Africa, is the largest hot desert." },
  { grade: "5", skill: "geo.5.physical", prompt: "The longest river in the world is generally considered the ___.", choices: ["Nile", "Mississippi", "Thames", "Amazon"], answer: "Nile", explanation: "The Nile River in Africa is usually called the world's longest river." },
  { grade: "5", skill: "geo.5.physical", prompt: "The tallest mountain above sea level on Earth is Mount ___.", choices: ["Everest", "Kilimanjaro", "Fuji", "Rainier"], answer: "Everest", explanation: "Mount Everest is the highest mountain above sea level." },
  // geo.5.usa
  { grade: "5", skill: "geo.5.usa", prompt: "Which ocean is on the WEST coast of the United States?", choices: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], answer: "Pacific Ocean", explanation: "The Pacific Ocean borders the U.S. west coast." },
  { grade: "5", skill: "geo.5.usa", prompt: "Which U.S. state is a chain of islands in the Pacific Ocean?", choices: ["Hawaii", "Florida", "Texas", "Ohio"], answer: "Hawaii", explanation: "Hawaii is a group of islands in the Pacific." },

  // ===== ADDITIONAL BANK (deeper coverage) =====
  // K
  { grade: "K", skill: "geo.K.maps", prompt: "A map of your classroom would show where the ___ are.", choices: ["desks and door", "stars in space", "fish in the sea", "cars on the highway"], answer: "desks and door", explanation: "A classroom map shows things in the room, like desks and the door." },
  { grade: "K", skill: "geo.K.landwater", prompt: "Which one do you need a boat to cross?", choices: ["A river", "A sidewalk", "A playground", "A hallway"], answer: "A river", explanation: "A river is water, so you'd use a boat to cross it." },
  { grade: "K", skill: "geo.K.community", prompt: "Where would you go to mail a letter?", choices: ["The post office", "The swimming pool", "The forest", "The moon"], answer: "The post office", explanation: "The post office helps send letters and packages." },
  { grade: "K", skill: "geo.K.directions", prompt: "If you turn to face the opposite of left, you face ___.", choices: ["right", "up", "down", "back"], answer: "right", explanation: "The opposite of left is right." },
  // 1
  { grade: "1", skill: "geo.1.directions", prompt: "The sun SETS in the ___.", choices: ["West", "East", "North", "South"], answer: "West", explanation: "The sun sets in the West each evening." },
  { grade: "1", skill: "geo.1.landforms", prompt: "A small hill is ___ than a mountain.", choices: ["lower", "taller", "wetter", "colder"], answer: "lower", explanation: "Hills are lower and smaller than mountains." },
  { grade: "1", skill: "geo.1.landforms", prompt: "A large body of water with land all around it is a ___.", choices: ["lake", "river", "ocean", "island"], answer: "lake", explanation: "A lake is water surrounded by land." },
  { grade: "1", skill: "geo.1.mapkey", prompt: "The words that tell you what a map is about are the map's ___.", choices: ["title", "weather", "price", "song"], answer: "title", explanation: "A map's title tells you what the map shows." },
  // 2
  { grade: "2", skill: "geo.2.continents", prompt: "Which continent is at the very bottom of the globe, around the South Pole?", choices: ["Antarctica", "Africa", "Asia", "Europe"], answer: "Antarctica", explanation: "Antarctica is the icy continent at the South Pole." },
  { grade: "2", skill: "geo.2.oceans", prompt: "Which ocean is on the EAST coast of the United States?", choices: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean"], answer: "Atlantic Ocean", explanation: "The Atlantic Ocean borders the U.S. east coast." },
  { grade: "2", skill: "geo.2.globe", prompt: "The very bottom of the Earth on a globe is the ___.", choices: ["South Pole", "North Pole", "equator", "coast"], answer: "South Pole", explanation: "The South Pole is at the bottom of the globe." },
  { grade: "2", skill: "geo.2.landforms", prompt: "A narrow strip of water joining two larger bodies of water can be a ___.", choices: ["channel", "mountain", "desert", "forest"], answer: "channel", explanation: "A channel is a narrow waterway connecting larger waters." },
  // 3
  { grade: "3", skill: "geo.3.florida", prompt: "Florida is located in the ___ part of the United States.", choices: ["southeast", "northwest", "central north", "far west"], answer: "southeast", explanation: "Florida is in the southeastern United States." },
  { grade: "3", skill: "geo.3.usregions", prompt: "Which of these is a U.S. state?", choices: ["California", "Canada", "Mexico", "Europe"], answer: "California", explanation: "California is one of the 50 U.S. states." },
  { grade: "3", skill: "geo.3.maptools", prompt: "A symbol shaped like a tent on a map probably marks a ___.", choices: ["campground", "library", "river", "mountain peak"], answer: "campground", explanation: "Map symbols stand for real places; a tent marks a campground." },
  { grade: "3", skill: "geo.3.landforms", prompt: "Land that sticks out into the water with water on three sides is a ___.", choices: ["peninsula", "plain", "valley", "canyon"], answer: "peninsula", explanation: "A peninsula has water on three sides — like Florida." },
  // 4
  { grade: "4", skill: "geo.4.usa", prompt: "Which mountain range runs along the EASTERN United States?", choices: ["Appalachian Mountains", "Rocky Mountains", "Himalayas", "Andes"], answer: "Appalachian Mountains", explanation: "The Appalachian Mountains run along the eastern U.S." },
  { grade: "4", skill: "geo.4.regions", prompt: "A region covered in thick trees with lots of rain is a ___.", choices: ["forest", "desert", "tundra", "prairie"], answer: "forest", explanation: "Forests are regions with many trees and plenty of rain." },
  { grade: "4", skill: "geo.4.resources", prompt: "A resource that can be replaced naturally, like trees or sunlight, is called ___.", choices: ["renewable", "gone forever", "man-made", "frozen"], answer: "renewable", explanation: "Renewable resources can be replaced naturally over time." },
  { grade: "4", skill: "geo.4.hemispheres", prompt: "The United States is located in the ___ Hemisphere (north of the equator).", choices: ["Northern", "Southern", "Eastern only", "Polar"], answer: "Northern", explanation: "The U.S. is north of the equator, in the Northern Hemisphere." },
  // 5
  { grade: "5", skill: "geo.5.world", prompt: "Which continent has the most people living on it?", choices: ["Asia", "Antarctica", "Australia", "Europe"], answer: "Asia", explanation: "Asia has the largest population of any continent." },
  { grade: "5", skill: "geo.5.physical", prompt: "The largest rainforest in the world is the ___ Rainforest.", choices: ["Amazon", "Sahara", "Arctic", "Mojave"], answer: "Amazon", explanation: "The Amazon Rainforest in South America is the largest." },
  { grade: "5", skill: "geo.5.latlong", prompt: "The imaginary line at 0° longitude is called the ___.", choices: ["Prime Meridian", "equator", "Tropic of Cancer", "date line"], answer: "Prime Meridian", explanation: "The Prime Meridian is 0° longitude." },
  { grade: "5", skill: "geo.5.usa", prompt: "Which is the largest U.S. state by land area?", choices: ["Alaska", "Texas", "California", "Florida"], answer: "Alaska", explanation: "Alaska is the largest U.S. state by area." },
];
