// SummerSharp science question bank — authored, fact-checked, grade-appropriate.
// Science is factual (like reading), so these are hand-authored, not procedurally
// generated. Each item is skill-tagged so the adaptive engine targets weak spots.
// `standard` is left null: Florida science is NGSSS (not B.E.S.T.) and we don't
// fabricate benchmark codes we can't verify — mapping skills to official NGSSS
// benchmarks is a follow-up. The generator shuffles choices and computes the
// answer index, so `answer` must match one of `choices` exactly.

export const SCIENCE_QUESTIONS = [
  // ===== KINDERGARTEN =====
  // K.senses — the five senses
  { grade: "K", skill: "K.senses", prompt: "Which body part do you use to see?", choices: ["Eyes", "Ears", "Nose", "Hands"], answer: "Eyes", explanation: "We see the world with our eyes." },
  { grade: "K", skill: "K.senses", prompt: "You use your ears to ___.", choices: ["hear", "see", "smell", "taste"], answer: "hear", explanation: "Ears let you hear sounds." },
  { grade: "K", skill: "K.senses", prompt: "Which sense tells you that candy is sweet?", choices: ["Taste", "Sight", "Hearing", "Smell"], answer: "Taste", explanation: "Your tongue tastes sweet, sour, and salty." },
  { grade: "K", skill: "K.senses", prompt: "You use your nose to ___.", choices: ["smell", "hear", "see", "touch"], answer: "smell", explanation: "Your nose smells flowers, food, and more." },
  { grade: "K", skill: "K.senses", prompt: "Which body part helps you feel if a kitten is soft?", choices: ["Your skin", "Your eyes", "Your ears", "Your nose"], answer: "Your skin", explanation: "We feel soft and hard things by touch, with our skin." },
  { grade: "K", skill: "K.senses", prompt: "How many senses do people have?", choices: ["5", "2", "3", "10"], answer: "5", explanation: "The five senses are sight, hearing, smell, taste, and touch." },
  // K.livingnonliving
  { grade: "K", skill: "K.livingnonliving", prompt: "Which one is a living thing?", choices: ["A dog", "A rock", "A chair", "A toy"], answer: "A dog", explanation: "A dog grows, eats, and moves — it is living." },
  { grade: "K", skill: "K.livingnonliving", prompt: "Living things need ___ to grow.", choices: ["food and water", "nothing", "paint", "glass"], answer: "food and water", explanation: "All living things need food and water." },
  { grade: "K", skill: "K.livingnonliving", prompt: "Which one is NOT living?", choices: ["A car", "A tree", "A fish", "A bird"], answer: "A car", explanation: "A car does not eat or grow, so it is non-living." },
  { grade: "K", skill: "K.livingnonliving", prompt: "Which living thing can grow bigger?", choices: ["A baby", "A spoon", "A ball", "A sock"], answer: "A baby", explanation: "Babies are living and grow bigger over time." },
  { grade: "K", skill: "K.livingnonliving", prompt: "A flower is ___.", choices: ["living", "not living", "a kind of rock", "a toy"], answer: "living", explanation: "Plants like flowers are living things." },
  { grade: "K", skill: "K.livingnonliving", prompt: "Which one is non-living?", choices: ["A rock", "A cat", "A worm", "A plant"], answer: "A rock", explanation: "A rock does not grow or need food — it is non-living." },
  // K.weather
  { grade: "K", skill: "K.weather", prompt: "What do we call the white, cold flakes that fall in winter?", choices: ["Snow", "Sun", "Wind", "Sand"], answer: "Snow", explanation: "Snow falls when it is very cold." },
  { grade: "K", skill: "K.weather", prompt: "On a clear sunny day, the sky usually looks ___.", choices: ["blue", "green", "purple", "black"], answer: "blue", explanation: "A clear daytime sky looks blue." },
  { grade: "K", skill: "K.weather", prompt: "What falls from clouds when it rains?", choices: ["Water", "Rocks", "Leaves", "Sand"], answer: "Water", explanation: "Rain is water falling from clouds." },
  { grade: "K", skill: "K.weather", prompt: "Which weather is warm and bright?", choices: ["Sunny", "Snowy", "Rainy", "Windy"], answer: "Sunny", explanation: "Sunny weather is warm and bright." },
  { grade: "K", skill: "K.weather", prompt: "What should you wear when it is cold and snowy?", choices: ["A warm coat", "A swimsuit", "Sandals", "Sunglasses only"], answer: "A warm coat", explanation: "A warm coat keeps you warm in cold weather." },
  { grade: "K", skill: "K.weather", prompt: "Clouds are made of tiny drops of ___.", choices: ["water", "sand", "dirt", "glass"], answer: "water", explanation: "Clouds are made of tiny water drops." },
  // K.daynight
  { grade: "K", skill: "K.daynight", prompt: "What do we see in the sky during the daytime?", choices: ["The sun", "The moon", "Many stars", "A lamp"], answer: "The sun", explanation: "The sun lights up the daytime sky." },
  { grade: "K", skill: "K.daynight", prompt: "When do we usually see the moon and stars?", choices: ["At night", "At noon", "In the morning", "Never"], answer: "At night", explanation: "The moon and stars show up at night." },
  { grade: "K", skill: "K.daynight", prompt: "The sun gives us ___.", choices: ["light and warmth", "rain", "snow", "wind"], answer: "light and warmth", explanation: "The sun gives Earth light and heat." },
  { grade: "K", skill: "K.daynight", prompt: "It is dark outside during the ___.", choices: ["night", "day", "noon", "sunrise"], answer: "night", explanation: "Night is the dark part of the day." },
  { grade: "K", skill: "K.daynight", prompt: "We have day and night because the Earth ___.", choices: ["spins", "stops", "melts", "grows"], answer: "spins", explanation: "Earth spins, so different sides face the sun." },
  { grade: "K", skill: "K.daynight", prompt: "Which is brightest in the daytime sky?", choices: ["The sun", "A star", "The moon", "A cloud"], answer: "The sun", explanation: "The sun is the brightest thing in our sky." },
  // K.pushpull
  { grade: "K", skill: "K.pushpull", prompt: "When you open a drawer toward you, you ___ it.", choices: ["pull", "push", "drop", "eat"], answer: "pull", explanation: "Pulling brings something toward you." },
  { grade: "K", skill: "K.pushpull", prompt: "To make a swing go, you give it a ___.", choices: ["push", "drink", "color", "song"], answer: "push", explanation: "A push makes the swing move away." },
  { grade: "K", skill: "K.pushpull", prompt: "A push or a pull can make something ___.", choices: ["move", "sing", "melt", "grow"], answer: "move", explanation: "Pushes and pulls are forces that move things." },
  { grade: "K", skill: "K.pushpull", prompt: "Pulling a wagon makes it come ___ you.", choices: ["toward", "away from", "above", "below"], answer: "toward", explanation: "A pull brings the wagon toward you." },
  { grade: "K", skill: "K.pushpull", prompt: "Which one needs a push or pull to move?", choices: ["A toy car", "A star", "The wind", "Your shadow"], answer: "A toy car", explanation: "A toy car only moves when you push or pull it." },
  { grade: "K", skill: "K.pushpull", prompt: "Kicking a ball gives it a ___.", choices: ["push", "pull", "smell", "taste"], answer: "push", explanation: "A kick is a push that sends the ball away." },
  // K.animalneeds
  { grade: "K", skill: "K.animalneeds", prompt: "Animals need ___ to live.", choices: ["food, water, and air", "only toys", "only sunlight", "nothing"], answer: "food, water, and air", explanation: "All animals need food, water, and air." },
  { grade: "K", skill: "K.animalneeds", prompt: "A fish needs ___ to live in.", choices: ["water", "sand", "fire", "dry air"], answer: "water", explanation: "Fish live and breathe in water." },
  { grade: "K", skill: "K.animalneeds", prompt: "What do baby animals get from their parents?", choices: ["Care and food", "Homework", "Money", "Cars"], answer: "Care and food", explanation: "Parents help feed and protect their babies." },
  { grade: "K", skill: "K.animalneeds", prompt: "Birds build ___ to keep their eggs safe.", choices: ["nests", "cars", "boxes of toys", "swimming pools"], answer: "nests", explanation: "Birds build nests for their eggs." },
  { grade: "K", skill: "K.animalneeds", prompt: "Like people, animals need to ___ when they are tired.", choices: ["sleep", "fly", "read", "drive"], answer: "sleep", explanation: "Animals rest and sleep to get their energy back." },
  { grade: "K", skill: "K.animalneeds", prompt: "A dog needs water to ___.", choices: ["drink", "paint", "drive", "read"], answer: "drink", explanation: "Animals drink water to stay alive." },

  // ===== GRADE 1 =====
  // 1.plants
  { grade: "1", skill: "1.plants", prompt: "Which part of a plant takes in water from the soil?", choices: ["Roots", "Leaves", "Flower", "Petals"], answer: "Roots", explanation: "Roots soak up water and hold the plant in the ground." },
  { grade: "1", skill: "1.plants", prompt: "Which part of a plant makes seeds?", choices: ["Flower", "Roots", "Stem", "Soil"], answer: "Flower", explanation: "Flowers make seeds that can grow into new plants." },
  { grade: "1", skill: "1.plants", prompt: "Plants need ___ to make their food.", choices: ["sunlight", "darkness", "candy", "rocks"], answer: "sunlight", explanation: "Plants use sunlight to make their own food." },
  { grade: "1", skill: "1.plants", prompt: "Which part holds the plant up and carries water to the leaves?", choices: ["Stem", "Root", "Flower", "Seed"], answer: "Stem", explanation: "The stem holds the plant up and moves water around." },
  { grade: "1", skill: "1.plants", prompt: "A new plant usually grows from a ___.", choices: ["seed", "rock", "leaf only", "cloud"], answer: "seed", explanation: "Most plants start as a seed." },
  { grade: "1", skill: "1.plants", prompt: "Besides sunlight and air, plants need ___ to grow.", choices: ["water", "soda", "milk", "juice"], answer: "water", explanation: "Plants need water to grow healthy." },
  // 1.animalbabies
  { grade: "1", skill: "1.animalbabies", prompt: "A baby dog is called a ___.", choices: ["puppy", "kitten", "calf", "chick"], answer: "puppy", explanation: "A baby dog is a puppy." },
  { grade: "1", skill: "1.animalbabies", prompt: "A baby cat is called a ___.", choices: ["kitten", "puppy", "cub", "foal"], answer: "kitten", explanation: "A baby cat is a kitten." },
  { grade: "1", skill: "1.animalbabies", prompt: "A baby cow is called a ___.", choices: ["calf", "foal", "lamb", "chick"], answer: "calf", explanation: "A baby cow is a calf." },
  { grade: "1", skill: "1.animalbabies", prompt: "A baby frog is called a ___.", choices: ["tadpole", "chick", "kit", "puppy"], answer: "tadpole", explanation: "A baby frog is a tadpole that lives in water." },
  { grade: "1", skill: "1.animalbabies", prompt: "Most baby animals look ___ their parents.", choices: ["like", "nothing like", "older than", "the same age as"], answer: "like", explanation: "Baby animals usually look like their parents." },
  { grade: "1", skill: "1.animalbabies", prompt: "A baby chicken is called a ___.", choices: ["chick", "duckling", "kid", "calf"], answer: "chick", explanation: "A baby chicken is a chick." },
  // 1.seasons
  { grade: "1", skill: "1.seasons", prompt: "In which season do leaves fall off many trees?", choices: ["Fall", "Summer", "Spring", "Winter"], answer: "Fall", explanation: "Leaves drop in fall (autumn)." },
  { grade: "1", skill: "1.seasons", prompt: "Which season is usually the coldest?", choices: ["Winter", "Summer", "Spring", "Fall"], answer: "Winter", explanation: "Winter is the coldest season." },
  { grade: "1", skill: "1.seasons", prompt: "In spring, many plants begin to ___.", choices: ["grow", "freeze", "disappear", "sleep forever"], answer: "grow", explanation: "Spring is warm and wet, so plants start growing." },
  { grade: "1", skill: "1.seasons", prompt: "Which season is usually the warmest?", choices: ["Summer", "Winter", "Fall", "None"], answer: "Summer", explanation: "Summer is the warmest season." },
  { grade: "1", skill: "1.seasons", prompt: "How many seasons are there in a year?", choices: ["Four", "Two", "Ten", "One"], answer: "Four", explanation: "The four seasons are spring, summer, fall, and winter." },
  { grade: "1", skill: "1.seasons", prompt: "We often see flowers bloom in ___.", choices: ["spring", "winter", "the middle of the night", "never"], answer: "spring", explanation: "Many flowers bloom in the spring." },
  // 1.shadow
  { grade: "1", skill: "1.shadow", prompt: "A shadow is made when an object blocks ___.", choices: ["light", "water", "wind", "sound"], answer: "light", explanation: "When something blocks light, it makes a shadow." },
  { grade: "1", skill: "1.shadow", prompt: "You need ___ to make a shadow.", choices: ["light", "only darkness", "rain", "snow"], answer: "light", explanation: "No light means no shadow." },
  { grade: "1", skill: "1.shadow", prompt: "A shadow is ___ than the bright area around it.", choices: ["darker", "brighter", "louder", "wetter"], answer: "darker", explanation: "A shadow is a dark spot where light is blocked." },
  { grade: "1", skill: "1.shadow", prompt: "When the sun is high in the sky at noon, shadows are usually ___.", choices: ["short", "very long", "invisible always", "rainbow-colored"], answer: "short", explanation: "When the sun is overhead, shadows are short." },
  { grade: "1", skill: "1.shadow", prompt: "Which can make a shadow?", choices: ["A solid toy", "Clear water", "Clean air", "Empty space"], answer: "A solid toy", explanation: "Solid things block light and make shadows." },
  { grade: "1", skill: "1.shadow", prompt: "Light travels in a ___ line.", choices: ["straight", "curvy", "zigzag", "circle"], answer: "straight", explanation: "Light moves in straight lines." },
  // 1.materials
  { grade: "1", skill: "1.materials", prompt: "Which object is usually made of metal?", choices: ["A spoon", "A cotton shirt", "A paper book", "A glass window"], answer: "A spoon", explanation: "Many spoons are made of metal." },
  { grade: "1", skill: "1.materials", prompt: "Which material can you see through?", choices: ["Glass", "Wood", "Brick", "Metal"], answer: "Glass", explanation: "Glass is clear, so you can see through it." },
  { grade: "1", skill: "1.materials", prompt: "Which material is soft and good for a blanket?", choices: ["Cloth", "Metal", "Rock", "Glass"], answer: "Cloth", explanation: "Cloth is soft and warm, good for blankets." },
  { grade: "1", skill: "1.materials", prompt: "Rubber is ___.", choices: ["stretchy and bendy", "hard as a rock", "made of glass", "clear like air"], answer: "stretchy and bendy", explanation: "Rubber can stretch and bend." },
  { grade: "1", skill: "1.materials", prompt: "We often use ___ to build strong bridges.", choices: ["metal", "paper", "cotton", "feathers"], answer: "metal", explanation: "Metal is strong and good for building." },
  { grade: "1", skill: "1.materials", prompt: "Which material floats easily on water?", choices: ["Wood", "A heavy rock", "A metal nail", "A brick"], answer: "Wood", explanation: "Wood is light and floats on water." },
  // 1.sky
  { grade: "1", skill: "1.sky", prompt: "Which gives us light during the day?", choices: ["The sun", "The moon", "The stars", "A streetlight"], answer: "The sun", explanation: "The sun lights up the day." },
  { grade: "1", skill: "1.sky", prompt: "We can see many tiny ___ in the night sky.", choices: ["stars", "suns", "rainbows", "clouds only"], answer: "stars", explanation: "Stars sparkle in the night sky." },
  { grade: "1", skill: "1.sky", prompt: "The moon looks bright because it reflects light from the ___.", choices: ["sun", "Earth", "stars", "streetlights"], answer: "sun", explanation: "The moon has no light of its own; it reflects the sun." },
  { grade: "1", skill: "1.sky", prompt: "The sun is actually a ___.", choices: ["star", "planet", "cloud", "moon"], answer: "star", explanation: "The sun is a star that is close to us." },
  { grade: "1", skill: "1.sky", prompt: "During a clear day, the sky usually looks ___.", choices: ["blue", "black", "green", "red"], answer: "blue", explanation: "The clear daytime sky is blue." },
  { grade: "1", skill: "1.sky", prompt: "Which looks bigger to us because it is much closer to Earth?", choices: ["The moon", "A faraway star", "A distant planet", "The whole sky"], answer: "The moon", explanation: "The moon is close, so it looks big. Stars are far, so they look tiny." },

  // ===== GRADE 2 =====
  // 2.matter
  { grade: "2", skill: "2.matter", prompt: "Ice is an example of a ___.", choices: ["solid", "liquid", "gas", "shadow"], answer: "solid", explanation: "Ice is frozen water, which is a solid." },
  { grade: "2", skill: "2.matter", prompt: "Water that you can pour is a ___.", choices: ["liquid", "solid", "gas", "rock"], answer: "liquid", explanation: "Liquids flow and can be poured." },
  { grade: "2", skill: "2.matter", prompt: "The air all around us is a ___.", choices: ["gas", "solid", "liquid", "metal"], answer: "gas", explanation: "Air is a gas that spreads out to fill space." },
  { grade: "2", skill: "2.matter", prompt: "When ice melts, it turns into ___.", choices: ["liquid water", "a gas right away", "a solid rock", "sand"], answer: "liquid water", explanation: "Melting ice becomes liquid water." },
  { grade: "2", skill: "2.matter", prompt: "Which one keeps its own shape?", choices: ["A solid block", "A liquid", "A gas", "Steam"], answer: "A solid block", explanation: "Solids keep their shape; liquids and gases do not." },
  { grade: "2", skill: "2.matter", prompt: "When water boils, it turns into steam, which is a ___.", choices: ["gas", "solid", "rock", "liquid forever"], answer: "gas", explanation: "Boiling water makes steam, a gas." },
  // 2.lifecycle
  { grade: "2", skill: "2.lifecycle", prompt: "A butterfly starts its life as an ___.", choices: ["egg", "adult butterfly", "bird", "bee"], answer: "egg", explanation: "A butterfly's life begins as a tiny egg." },
  { grade: "2", skill: "2.lifecycle", prompt: "What does a caterpillar turn into?", choices: ["A butterfly", "A frog", "A bee", "A bird"], answer: "A butterfly", explanation: "A caterpillar changes into a butterfly." },
  { grade: "2", skill: "2.lifecycle", prompt: "The butterfly life cycle is: egg, caterpillar, chrysalis, then ___.", choices: ["butterfly", "egg again first", "tadpole", "seed"], answer: "butterfly", explanation: "After the chrysalis, an adult butterfly comes out." },
  { grade: "2", skill: "2.lifecycle", prompt: "A frog begins its life as a ___.", choices: ["tadpole", "puppy", "chick", "seed"], answer: "tadpole", explanation: "Frogs hatch as tadpoles that swim in water." },
  { grade: "2", skill: "2.lifecycle", prompt: "A new plant's life can start from a ___.", choices: ["seed", "brick", "cloud", "rock"], answer: "seed", explanation: "Many plants start their life cycle as a seed." },
  { grade: "2", skill: "2.lifecycle", prompt: "Inside a chrysalis, a caterpillar ___ into a butterfly.", choices: ["changes", "disappears", "shrinks to nothing", "turns into a rock"], answer: "changes", explanation: "The caterpillar's body changes into a butterfly inside the chrysalis." },
  // 2.magnets
  { grade: "2", skill: "2.magnets", prompt: "A magnet can pull on objects made of ___.", choices: ["iron or steel", "wood", "paper", "plastic"], answer: "iron or steel", explanation: "Magnets attract metals like iron and steel." },
  { grade: "2", skill: "2.magnets", prompt: "Will a magnet stick to a metal paper clip?", choices: ["Yes", "No, never", "Only if it is wet", "Only plastic"], answer: "Yes", explanation: "Metal paper clips are attracted to magnets." },
  { grade: "2", skill: "2.magnets", prompt: "Two magnets can ___ each other.", choices: ["push or pull", "only talk to", "eat", "paint"], answer: "push or pull", explanation: "Magnets can attract (pull) or repel (push) each other." },
  { grade: "2", skill: "2.magnets", prompt: "A magnet will NOT pick up a ___.", choices: ["plastic toy", "steel nail", "iron paper clip", "metal key"], answer: "plastic toy", explanation: "Magnets do not stick to plastic." },
  { grade: "2", skill: "2.magnets", prompt: "The two ends of a magnet are called its ___.", choices: ["poles", "wheels", "wings", "tails"], answer: "poles", explanation: "A magnet has a north pole and a south pole." },
  { grade: "2", skill: "2.magnets", prompt: "A magnet can attract a paper clip through ___.", choices: ["a thin sheet of paper", "a thick steel door", "solid rock", "nothing at all"], answer: "a thin sheet of paper", explanation: "Magnet force can work through thin things like paper." },
  // 2.weather
  { grade: "2", skill: "2.weather", prompt: "We measure how hot or cold it is with a ___.", choices: ["thermometer", "ruler", "clock", "scale"], answer: "thermometer", explanation: "A thermometer measures temperature." },
  { grade: "2", skill: "2.weather", prompt: "Strong moving air is called ___.", choices: ["wind", "rain", "snow", "sunshine"], answer: "wind", explanation: "Wind is air that is moving." },
  { grade: "2", skill: "2.weather", prompt: "A tool that shows which way the wind is blowing is a ___.", choices: ["weather vane", "thermometer", "scale", "ruler"], answer: "weather vane", explanation: "A weather vane points in the direction the wind comes from." },
  { grade: "2", skill: "2.weather", prompt: "Which season often brings snow in cold places?", choices: ["Winter", "Summer", "Spring", "None"], answer: "Winter", explanation: "Snow usually falls in winter." },
  { grade: "2", skill: "2.weather", prompt: "Many dark clouds in the sky may mean ___ is coming.", choices: ["rain", "only sunshine", "snow in summer", "nothing"], answer: "rain", explanation: "Dark, heavy clouds often bring rain." },
  { grade: "2", skill: "2.weather", prompt: "Weather can change from ___.", choices: ["day to day", "never", "only once a year", "only at night"], answer: "day to day", explanation: "Weather changes often, even day to day." },
  // 2.habitats
  { grade: "2", skill: "2.habitats", prompt: "A habitat is a place where an animal ___.", choices: ["lives", "goes to school", "buys food", "watches TV"], answer: "lives", explanation: "A habitat is an animal's home, where it lives." },
  { grade: "2", skill: "2.habitats", prompt: "A fish's habitat is the ___.", choices: ["water", "desert sand", "treetop", "snow"], answer: "water", explanation: "Fish live in water." },
  { grade: "2", skill: "2.habitats", prompt: "A camel is well suited to live in the hot, dry ___.", choices: ["desert", "ocean", "ice cap", "forest pond"], answer: "desert", explanation: "Camels can live in the dry desert." },
  { grade: "2", skill: "2.habitats", prompt: "A polar bear lives where it is very ___.", choices: ["cold", "hot", "dry", "sandy"], answer: "cold", explanation: "Polar bears live in cold, icy places." },
  { grade: "2", skill: "2.habitats", prompt: "A habitat gives animals food, water, and ___.", choices: ["shelter", "toys", "money", "homework"], answer: "shelter", explanation: "A good habitat provides food, water, and shelter." },
  { grade: "2", skill: "2.habitats", prompt: "Which animal lives in a forest habitat?", choices: ["A deer", "A shark", "A whale", "A dolphin"], answer: "A deer", explanation: "Deer live in forests; sharks and whales live in the ocean." },

  // ===== GRADE 3 =====
  // 3.watercycle
  { grade: "3", skill: "3.watercycle", prompt: "When the sun heats water and it turns into vapor, it is called ___.", choices: ["evaporation", "raining", "freezing", "snowing"], answer: "evaporation", explanation: "Evaporation is liquid water turning into water vapor." },
  { grade: "3", skill: "3.watercycle", prompt: "Water vapor cools high in the sky and forms ___.", choices: ["clouds", "rocks", "wind", "sand"], answer: "clouds", explanation: "Cooled water vapor forms clouds." },
  { grade: "3", skill: "3.watercycle", prompt: "Water that falls from clouds as rain or snow is called ___.", choices: ["precipitation", "evaporation", "a shadow", "wind"], answer: "precipitation", explanation: "Rain, snow, and sleet are all precipitation." },
  { grade: "3", skill: "3.watercycle", prompt: "The water cycle is powered by energy from the ___.", choices: ["sun", "moon", "wind", "ground"], answer: "sun", explanation: "The sun's heat drives the whole water cycle." },
  { grade: "3", skill: "3.watercycle", prompt: "When water vapor cools and turns back into liquid drops, it is ___.", choices: ["condensation", "melting", "evaporation", "freezing"], answer: "condensation", explanation: "Condensation is water vapor turning back into liquid." },
  { grade: "3", skill: "3.watercycle", prompt: "After it rains, water collects in ___.", choices: ["rivers and lakes", "the sun", "the air only", "clouds only"], answer: "rivers and lakes", explanation: "Rain collects in rivers, lakes, and oceans." },
  // 3.energy
  { grade: "3", skill: "3.energy", prompt: "The sun gives off light and ___ energy.", choices: ["heat", "sound", "metal", "rock"], answer: "heat", explanation: "The sun gives off light and heat energy." },
  { grade: "3", skill: "3.energy", prompt: "A drum makes ___ energy when you hit it.", choices: ["sound", "light", "ice", "rock"], answer: "sound", explanation: "Hitting a drum makes it vibrate and create sound energy." },
  { grade: "3", skill: "3.energy", prompt: "A flashlight gives off ___ energy.", choices: ["light", "sound only", "cold", "water"], answer: "light", explanation: "A flashlight makes light energy." },
  { grade: "3", skill: "3.energy", prompt: "Rubbing your hands together quickly makes ___.", choices: ["heat", "ice", "rain", "light"], answer: "heat", explanation: "Rubbing makes friction, which produces heat." },
  { grade: "3", skill: "3.energy", prompt: "Energy that comes from the sun is called ___ energy.", choices: ["solar", "sound", "muscle", "wind"], answer: "solar", explanation: "Energy from the sun is solar energy." },
  { grade: "3", skill: "3.energy", prompt: "Which of these uses electrical energy to work?", choices: ["A lamp", "A rock", "A wooden spoon", "A paper clip"], answer: "A lamp", explanation: "A lamp uses electrical energy to make light." },
  // 3.forces
  { grade: "3", skill: "3.forces", prompt: "A force is a push or a ___.", choices: ["pull", "song", "color", "smell"], answer: "pull", explanation: "Forces are pushes and pulls." },
  { grade: "3", skill: "3.forces", prompt: "Which force pulls objects down toward the Earth?", choices: ["Gravity", "Wind", "Light", "Sound"], answer: "Gravity", explanation: "Gravity pulls everything toward the Earth." },
  { grade: "3", skill: "3.forces", prompt: "A force can change an object's ___.", choices: ["motion", "color", "name", "smell"], answer: "motion", explanation: "Forces can speed up, slow down, or turn objects." },
  { grade: "3", skill: "3.forces", prompt: "Friction is a force that ___ moving things.", choices: ["slows down", "speeds up", "colors", "feeds"], answer: "slows down", explanation: "Friction slows objects as surfaces rub together." },
  { grade: "3", skill: "3.forces", prompt: "The harder you push a ball, the ___ it goes.", choices: ["faster", "slower", "smaller", "quieter"], answer: "faster", explanation: "A bigger push gives the ball more speed." },
  { grade: "3", skill: "3.forces", prompt: "When you drop a ball, ___ pulls it to the ground.", choices: ["gravity", "a magnet", "wind only", "sound"], answer: "gravity", explanation: "Gravity pulls the dropped ball down." },
  // 3.matterchange
  { grade: "3", skill: "3.matterchange", prompt: "Heating water enough makes it ___.", choices: ["boil into steam", "freeze", "turn to rock", "disappear forever"], answer: "boil into steam", explanation: "Enough heat makes water boil and become steam." },
  { grade: "3", skill: "3.matterchange", prompt: "Cooling water below freezing makes it turn into ___.", choices: ["ice", "gas", "sand", "metal"], answer: "ice", explanation: "Water freezes into solid ice when it gets cold enough." },
  { grade: "3", skill: "3.matterchange", prompt: "Melting and freezing are changes you can ___.", choices: ["reverse", "never undo", "only do once", "not see"], answer: "reverse", explanation: "You can melt ice and freeze it again — these changes can be reversed." },
  { grade: "3", skill: "3.matterchange", prompt: "Which is a property of matter you can measure?", choices: ["Mass", "Its name", "Its luck", "Its mood"], answer: "Mass", explanation: "Mass (how much matter) can be measured." },
  { grade: "3", skill: "3.matterchange", prompt: "When you stir sugar into water, the sugar ___.", choices: ["dissolves", "vanishes forever", "becomes a rock", "turns into air"], answer: "dissolves", explanation: "The sugar dissolves and mixes into the water." },
  { grade: "3", skill: "3.matterchange", prompt: "Matter is anything that has mass and takes up ___.", choices: ["space", "time", "sound", "light"], answer: "space", explanation: "Matter has mass and takes up space." },
  // 3.soilrocks
  { grade: "3", skill: "3.soilrocks", prompt: "Soil is made of tiny bits of ___ and rotted plants.", choices: ["rock", "plastic", "glass", "metal"], answer: "rock", explanation: "Soil contains broken-down rock and rotted plant matter." },
  { grade: "3", skill: "3.soilrocks", prompt: "Which is a natural Earth material?", choices: ["A rock", "A plastic toy", "A metal can", "A glass bottle"], answer: "A rock", explanation: "Rocks form naturally on Earth." },
  { grade: "3", skill: "3.soilrocks", prompt: "Worms help make soil ___ for plants.", choices: ["healthy", "poisonous", "frozen", "dry as dust"], answer: "healthy", explanation: "Worms loosen soil and add nutrients, helping plants." },
  { grade: "3", skill: "3.soilrocks", prompt: "When wind and water slowly break rocks into smaller pieces, it is called ___.", choices: ["weathering", "planting", "melting", "freezing"], answer: "weathering", explanation: "Weathering breaks big rocks into smaller pieces over time." },
  { grade: "3", skill: "3.soilrocks", prompt: "Plants grow best in good ___.", choices: ["soil", "glass", "metal", "plastic"], answer: "soil", explanation: "Healthy soil helps plants grow." },
  { grade: "3", skill: "3.soilrocks", prompt: "Sand is made of tiny pieces of ___.", choices: ["rock", "candy", "cloth", "wood"], answer: "rock", explanation: "Sand is made of very small bits of rock and shell." },

  // ===== GRADE 4 =====
  // 4.circuits
  { grade: "4", skill: "4.circuits", prompt: "For a bulb to light in a simple circuit, the path must be ___.", choices: ["complete", "broken", "wet", "painted"], answer: "complete", explanation: "Electricity needs a complete (closed) path to flow." },
  { grade: "4", skill: "4.circuits", prompt: "What part stores the energy that makes a circuit work?", choices: ["The battery", "The wire alone", "The switch alone", "The air"], answer: "The battery", explanation: "The battery supplies the energy for the circuit." },
  { grade: "4", skill: "4.circuits", prompt: "What part can open or close a circuit to turn it on or off?", choices: ["A switch", "A battery", "A bulb", "A magnet"], answer: "A switch", explanation: "A switch opens or closes the circuit." },
  { grade: "4", skill: "4.circuits", prompt: "Materials that let electricity flow through them are called ___.", choices: ["conductors", "insulators", "magnets", "shadows"], answer: "conductors", explanation: "Conductors, like metal, let electricity flow." },
  { grade: "4", skill: "4.circuits", prompt: "Which is a good conductor of electricity?", choices: ["Metal wire", "Rubber", "Dry wood", "Plastic"], answer: "Metal wire", explanation: "Metals are good conductors of electricity." },
  { grade: "4", skill: "4.circuits", prompt: "If a wire in the circuit is broken, the bulb will ___.", choices: ["not light", "shine brighter", "change color", "make sound"], answer: "not light", explanation: "A broken path stops the electricity, so the bulb goes out." },
  // 4.energytransfer
  { grade: "4", skill: "4.energytransfer", prompt: "Heat naturally moves from a ___ object to a ___ object.", choices: ["hotter object to a cooler one", "cooler object to a hotter one", "to no object", "in a circle forever"], answer: "hotter object to a cooler one", explanation: "Heat flows from hot to cold." },
  { grade: "4", skill: "4.energytransfer", prompt: "The sun's energy travels to Earth as ___.", choices: ["light and heat", "sound", "electricity in wires", "wind"], answer: "light and heat", explanation: "The sun sends energy to Earth as light and heat." },
  { grade: "4", skill: "4.energytransfer", prompt: "A moving object has ___ energy.", choices: ["motion (kinetic)", "no", "frozen", "sound only"], answer: "motion (kinetic)", explanation: "Anything moving has energy of motion." },
  { grade: "4", skill: "4.energytransfer", prompt: "Plants change the sun's light energy into ___.", choices: ["stored food energy", "sound energy", "electricity", "wind"], answer: "stored food energy", explanation: "Plants store the sun's energy as food (sugar)." },
  { grade: "4", skill: "4.energytransfer", prompt: "When you turn on a lamp, electrical energy changes into ___.", choices: ["light and heat", "only sound", "rain", "wind"], answer: "light and heat", explanation: "A lamp turns electrical energy into light (and some heat)." },
  { grade: "4", skill: "4.energytransfer", prompt: "Energy can change from one form to ___.", choices: ["another", "nothing", "only sound", "only light"], answer: "another", explanation: "Energy can change forms, like electrical to light." },
  // 4.weatherclimate
  { grade: "4", skill: "4.weatherclimate", prompt: "The usual weather in a place over many years is called its ___.", choices: ["climate", "a single storm", "a forecast", "a season only"], answer: "climate", explanation: "Climate is the typical weather over a long time." },
  { grade: "4", skill: "4.weatherclimate", prompt: "Weather is what is happening ___.", choices: ["right now", "over 100 years", "only in winter", "only at night"], answer: "right now", explanation: "Weather is the conditions happening now or today." },
  { grade: "4", skill: "4.weatherclimate", prompt: "A place near the equator usually has a ___ climate.", choices: ["warm", "freezing", "snowy all year", "dark"], answer: "warm", explanation: "Places near the equator get strong sunlight and stay warm." },
  { grade: "4", skill: "4.weatherclimate", prompt: "Scientists who study the weather are called ___.", choices: ["meteorologists", "geologists", "zookeepers", "astronauts"], answer: "meteorologists", explanation: "Meteorologists study and predict the weather." },
  { grade: "4", skill: "4.weatherclimate", prompt: "A tool that measures how much rain falls is a ___.", choices: ["rain gauge", "thermometer", "compass", "ruler for length"], answer: "rain gauge", explanation: "A rain gauge collects and measures rainfall." },
  { grade: "4", skill: "4.weatherclimate", prompt: "Which sentence describes climate, not today's weather?", choices: ["It is usually hot and dry here.", "It is raining right now.", "The wind is strong today.", "It is cloudy this afternoon."], answer: "It is usually hot and dry here.", explanation: "Climate is the usual pattern; the others describe today." },
  // 4.moon
  { grade: "4", skill: "4.moon", prompt: "The moon seems to change shape because of how ___ lights it.", choices: ["the sun", "a streetlamp", "the Earth", "the stars"], answer: "the sun", explanation: "We see the part of the moon lit by the sun, which changes." },
  { grade: "4", skill: "4.moon", prompt: "About how long does it take the moon to go through all its phases?", choices: ["About a month", "One day", "One year", "One hour"], answer: "About a month", explanation: "The moon's phases repeat about every 29–30 days." },
  { grade: "4", skill: "4.moon", prompt: "When we cannot see the lit moon at all, it is called a ___ moon.", choices: ["new", "full", "half", "blue"], answer: "new", explanation: "At a new moon, the lit side faces away from us." },
  { grade: "4", skill: "4.moon", prompt: "When the whole lit side faces us, it is a ___ moon.", choices: ["full", "new", "thin crescent", "broken"], answer: "full", explanation: "A full moon is when we see the entire lit side." },
  { grade: "4", skill: "4.moon", prompt: "The moon does not make its own light; it ___ the sun's light.", choices: ["reflects", "blocks", "swallows", "creates"], answer: "reflects", explanation: "The moon shines by reflecting sunlight." },
  { grade: "4", skill: "4.moon", prompt: "The moon moves around (orbits) the ___.", choices: ["Earth", "Sun directly", "Mars", "stars"], answer: "Earth", explanation: "The moon orbits the Earth." },
  // 4.adaptations
  { grade: "4", skill: "4.adaptations", prompt: "A polar bear's thick fur is an adaptation that helps it stay ___.", choices: ["warm", "cool in the desert", "invisible", "fast in water only"], answer: "warm", explanation: "Thick fur keeps the polar bear warm in the cold." },
  { grade: "4", skill: "4.adaptations", prompt: "A cactus stores ___ to survive in the dry desert.", choices: ["water", "sand", "sunlight in a box", "rocks"], answer: "water", explanation: "A cactus stores water to live where it rarely rains." },
  { grade: "4", skill: "4.adaptations", prompt: "The shape of a bird's beak helps it ___.", choices: ["eat its kind of food", "fly only", "sing songs only", "see at night"], answer: "eat its kind of food", explanation: "Beak shapes are adapted to the foods birds eat." },
  { grade: "4", skill: "4.adaptations", prompt: "An adaptation is a feature that helps a living thing ___.", choices: ["survive", "do homework", "get taller forever", "stop eating"], answer: "survive", explanation: "Adaptations help living things survive in their habitat." },
  { grade: "4", skill: "4.adaptations", prompt: "A fish has gills that let it ___.", choices: ["breathe in water", "walk on land", "fly", "sleep standing"], answer: "breathe in water", explanation: "Gills let fish take oxygen from water." },
  { grade: "4", skill: "4.adaptations", prompt: "A chameleon can change color to ___.", choices: ["hide from danger", "get taller", "make light", "freeze water"], answer: "hide from danger", explanation: "Changing color helps a chameleon blend in (camouflage)." },

  // ===== GRADE 5 =====
  // 5.solar
  { grade: "5", skill: "5.solar", prompt: "What is at the center of our solar system?", choices: ["The Sun", "The Earth", "The Moon", "Jupiter"], answer: "The Sun", explanation: "The Sun is at the center; the planets orbit it." },
  { grade: "5", skill: "5.solar", prompt: "Which planet do we live on?", choices: ["Earth", "Mars", "Venus", "Saturn"], answer: "Earth", explanation: "We live on Earth, the third planet from the Sun." },
  { grade: "5", skill: "5.solar", prompt: "Planets move around the Sun in paths called ___.", choices: ["orbits", "shadows", "tunnels", "rivers"], answer: "orbits", explanation: "An orbit is the path a planet takes around the Sun." },
  { grade: "5", skill: "5.solar", prompt: "Which is the largest planet in our solar system?", choices: ["Jupiter", "Earth", "Mars", "Mercury"], answer: "Jupiter", explanation: "Jupiter is the biggest planet." },
  { grade: "5", skill: "5.solar", prompt: "The Sun is a ___.", choices: ["star", "planet", "moon", "comet"], answer: "star", explanation: "The Sun is the star at the center of our solar system." },
  { grade: "5", skill: "5.solar", prompt: "Which planet is known as the 'Red Planet'?", choices: ["Mars", "Venus", "Saturn", "Neptune"], answer: "Mars", explanation: "Mars looks reddish, so it's called the Red Planet." },
  // 5.matter
  { grade: "5", skill: "5.matter", prompt: "The tiny particles that make up all matter are too small to ___.", choices: ["see with your eyes", "be real", "matter", "move"], answer: "see with your eyes", explanation: "Matter is made of tiny particles far too small to see." },
  { grade: "5", skill: "5.matter", prompt: "A change where no new substance forms, like melting, is a ___ change.", choices: ["physical", "chemical", "magical", "living"], answer: "physical", explanation: "Melting is a physical change — it's still the same substance." },
  { grade: "5", skill: "5.matter", prompt: "Burning wood into ash and smoke is a ___ change.", choices: ["chemical", "physical", "frozen", "reversible"], answer: "chemical", explanation: "Burning makes new substances, so it's a chemical change." },
  { grade: "5", skill: "5.matter", prompt: "When matter changes state, the amount of matter (its mass) ___.", choices: ["stays the same", "disappears", "doubles", "becomes light"], answer: "stays the same", explanation: "Mass is conserved — it stays the same when matter changes state." },
  { grade: "5", skill: "5.matter", prompt: "In which state are the particles packed most tightly?", choices: ["Solid", "Gas", "Liquid", "Steam"], answer: "Solid", explanation: "In a solid, particles are packed tightly together." },
  { grade: "5", skill: "5.matter", prompt: "Mixing things that can be separated again makes a ___.", choices: ["mixture", "brand-new substance forever", "chemical reaction", "gas only"], answer: "mixture", explanation: "A mixture can usually be separated back into its parts." },
  // 5.forcemotion
  { grade: "5", skill: "5.forcemotion", prompt: "An object at rest stays at rest unless a ___ acts on it.", choices: ["force", "color", "sound", "shadow"], answer: "force", explanation: "It takes a force to start a still object moving." },
  { grade: "5", skill: "5.forcemotion", prompt: "The force that pulls objects toward the Earth is ___.", choices: ["gravity", "friction", "magnetism only", "sound"], answer: "gravity", explanation: "Gravity pulls objects toward Earth." },
  { grade: "5", skill: "5.forcemotion", prompt: "Which force resists motion when two surfaces rub together?", choices: ["Friction", "Gravity", "Magnetism", "Sound"], answer: "Friction", explanation: "Friction acts against motion between rubbing surfaces." },
  { grade: "5", skill: "5.forcemotion", prompt: "To make a moving cart speed up, you apply a force in the ___ of motion.", choices: ["direction", "opposite", "color", "sound"], answer: "direction", explanation: "A force in the direction of motion speeds an object up." },
  { grade: "5", skill: "5.forcemotion", prompt: "A heavier object needs ___ force to start moving than a lighter one.", choices: ["more", "less", "no", "zero"], answer: "more", explanation: "More mass needs more force to move." },
  { grade: "5", skill: "5.forcemotion", prompt: "A push or pull that can change an object's speed or direction is a ___.", choices: ["force", "habitat", "mineral", "season"], answer: "force", explanation: "A force changes how an object moves." },
  // 5.foodweb
  { grade: "5", skill: "5.foodweb", prompt: "The original source of energy for almost all food chains is the ___.", choices: ["Sun", "soil", "moon", "wind"], answer: "Sun", explanation: "The Sun's energy starts nearly every food chain." },
  { grade: "5", skill: "5.foodweb", prompt: "Plants that make their own food are called ___.", choices: ["producers", "consumers", "decomposers", "predators"], answer: "producers", explanation: "Producers (plants) make their own food using sunlight." },
  { grade: "5", skill: "5.foodweb", prompt: "An animal that eats only plants is a ___.", choices: ["herbivore", "carnivore", "producer", "decomposer"], answer: "herbivore", explanation: "Herbivores eat only plants." },
  { grade: "5", skill: "5.foodweb", prompt: "An animal that eats other animals is a ___.", choices: ["carnivore", "producer", "herbivore that eats grass", "plant"], answer: "carnivore", explanation: "Carnivores eat other animals." },
  { grade: "5", skill: "5.foodweb", prompt: "Which break down dead plants and animals and return nutrients to the soil?", choices: ["Decomposers", "Producers", "The Sun", "Herbivores"], answer: "Decomposers", explanation: "Decomposers, like fungi, recycle nutrients back to the soil." },
  { grade: "5", skill: "5.foodweb", prompt: "In a food chain, energy passes from one living thing to the ___.", choices: ["next", "Sun", "soil only", "air"], answer: "next", explanation: "Energy moves from one living thing to the next in a food chain." },
  // 5.body
  { grade: "5", skill: "5.body", prompt: "Which organ pumps blood through your body?", choices: ["The heart", "The lungs", "The stomach", "The brain"], answer: "The heart", explanation: "The heart pumps blood all around your body." },
  { grade: "5", skill: "5.body", prompt: "Which organs take in oxygen when you breathe?", choices: ["The lungs", "The kidneys", "The heart", "The liver"], answer: "The lungs", explanation: "The lungs bring oxygen into your body." },
  { grade: "5", skill: "5.body", prompt: "The brain is the main organ of the ___ system.", choices: ["nervous", "digestive", "skeletal", "muscular"], answer: "nervous", explanation: "The brain and nerves make up the nervous system." },
  { grade: "5", skill: "5.body", prompt: "Your ___ give your body shape and help it move.", choices: ["bones", "hair", "fingernails", "freckles"], answer: "bones", explanation: "Bones (the skeleton) support and move your body." },
  { grade: "5", skill: "5.body", prompt: "Food is broken down in your ___ system.", choices: ["digestive", "nervous", "skeletal", "breathing"], answer: "digestive", explanation: "The digestive system breaks down food." },
  { grade: "5", skill: "5.body", prompt: "Blood carries ___ to all parts of your body.", choices: ["oxygen and nutrients", "only water", "only air bubbles", "sound"], answer: "oxygen and nutrients", explanation: "Blood delivers oxygen and nutrients to your cells." },
  // 5.watercycle (deeper)
  { grade: "5", skill: "5.watercycle", prompt: "The change from liquid water to water vapor is called ___.", choices: ["evaporation", "condensation", "precipitation", "freezing"], answer: "evaporation", explanation: "Evaporation turns liquid water into vapor." },
  { grade: "5", skill: "5.watercycle", prompt: "The change from water vapor back to liquid, forming clouds, is ___.", choices: ["condensation", "precipitation", "evaporation", "melting"], answer: "condensation", explanation: "Condensation forms cloud droplets from vapor." },
  { grade: "5", skill: "5.watercycle", prompt: "Most of Earth's water is found in the ___.", choices: ["oceans", "clouds", "rivers", "underground only"], answer: "oceans", explanation: "Oceans hold most of Earth's water." },
  { grade: "5", skill: "5.watercycle", prompt: "Water that soaks down into the ground becomes ___.", choices: ["groundwater", "a cloud", "a rock", "vapor right away"], answer: "groundwater", explanation: "Water that sinks into the ground is called groundwater." },
  { grade: "5", skill: "5.watercycle", prompt: "The water cycle recycles Earth's water over and over, powered by the ___.", choices: ["Sun", "wind only", "moon", "ground"], answer: "Sun", explanation: "The Sun's energy keeps the water cycle going." },
  { grade: "5", skill: "5.watercycle", prompt: "Rain, snow, sleet, and hail are all forms of ___.", choices: ["precipitation", "evaporation", "condensation", "groundwater"], answer: "precipitation", explanation: "All water falling from the sky is precipitation." },
];
