// SummerSharp pre-K (ages 3–4) question bank — built for non-readers.
// Questions are picture/emoji-based and the prompt is read aloud; the answer
// choices are emoji, digits, or single letters the child taps. The prompt is
// self-contained when spoken (emoji are stripped from speech), and the on-screen
// emoji carry the specifics. Each item: { subject, grade:'PK', skill, prompt,
// choices, answer, explanation }. The generator shuffles choices.

export const PREK_QUESTIONS = [
  // ===== MATH readiness =====
  // PK.count — count 1–5
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many apples? 🍎🍎🍎", choices: ["2", "3", "4", "5"], answer: "3", explanation: "Count them: 1, 2, 3. There are 3 apples!" },
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many stars? ⭐⭐", choices: ["1", "2", "3", "4"], answer: "2", explanation: "1, 2 — there are 2 stars!" },
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many balloons? 🎈🎈🎈🎈", choices: ["2", "3", "4", "5"], answer: "4", explanation: "1, 2, 3, 4 — there are 4 balloons!" },
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many puppies? 🐶", choices: ["1", "2", "3", "4"], answer: "1", explanation: "There is just 1 puppy!" },
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many fish? 🐟🐟🐟🐟🐟", choices: ["3", "4", "5", "6"], answer: "5", explanation: "1, 2, 3, 4, 5 — there are 5 fish!" },
  // PK.shapes
  { subject: "math", grade: "PK", skill: "PK.shapes", prompt: "Which one is a circle?", choices: ["⚪", "🔺", "⬛", "⭐"], answer: "⚪", explanation: "A circle is perfectly round, like ⚪." },
  { subject: "math", grade: "PK", skill: "PK.shapes", prompt: "Which one is a star?", choices: ["⭐", "⚪", "🔺", "❤️"], answer: "⭐", explanation: "That's the star! ⭐" },
  { subject: "math", grade: "PK", skill: "PK.shapes", prompt: "Which one is a triangle?", choices: ["🔺", "⚪", "⬛", "⭐"], answer: "🔺", explanation: "A triangle has 3 sides, like 🔺." },
  { subject: "math", grade: "PK", skill: "PK.shapes", prompt: "Which one is a square?", choices: ["⬛", "⚪", "🔺", "❤️"], answer: "⬛", explanation: "A square has 4 equal sides, like ⬛." },
  { subject: "math", grade: "PK", skill: "PK.shapes", prompt: "Which one is a heart?", choices: ["❤️", "⚪", "⭐", "⬛"], answer: "❤️", explanation: "That's the heart! ❤️" },
  // PK.size — compare
  { subject: "math", grade: "PK", skill: "PK.size", prompt: "Which animal is the BIGGEST?", choices: ["🐘", "🐭", "🐜", "🐝"], answer: "🐘", explanation: "The elephant is the biggest! 🐘" },
  { subject: "math", grade: "PK", skill: "PK.size", prompt: "Which one is the SMALLEST?", choices: ["🐜", "🐘", "🦁", "🐴"], answer: "🐜", explanation: "The ant is the smallest! 🐜" },
  { subject: "math", grade: "PK", skill: "PK.size", prompt: "Which animal is the TALLEST?", choices: ["🦒", "🐭", "🐱", "🐸"], answer: "🦒", explanation: "The giraffe is the tallest! 🦒" },
  { subject: "math", grade: "PK", skill: "PK.size", prompt: "Which one is the LONGEST?", choices: ["🐍", "🐛", "🐞", "🦗"], answer: "🐍", explanation: "The snake is the longest! 🐍" },
  { subject: "math", grade: "PK", skill: "PK.size", prompt: "Which one is the HEAVIEST?", choices: ["🐘", "🪶", "🍃", "🎈"], answer: "🐘", explanation: "The elephant is the heaviest! A feather is very light." },
  // PK.patterns — what comes next
  { subject: "math", grade: "PK", skill: "PK.patterns", prompt: "What comes next?  🔴 🔵 🔴 🔵 ❓", choices: ["🔴", "🔵", "🟢", "🟡"], answer: "🔴", explanation: "Red, blue, red, blue… so red 🔴 comes next!" },
  { subject: "math", grade: "PK", skill: "PK.patterns", prompt: "What comes next?  ⭐ 🌙 ⭐ 🌙 ❓", choices: ["⭐", "🌙", "☀️", "⚡"], answer: "⭐", explanation: "Star, moon, star, moon… so star ⭐ comes next!" },
  { subject: "math", grade: "PK", skill: "PK.patterns", prompt: "What comes next?  🍎 🍌 🍎 🍌 ❓", choices: ["🍎", "🍌", "🍇", "🍊"], answer: "🍎", explanation: "Apple, banana, apple, banana… so apple 🍎 comes next!" },
  { subject: "math", grade: "PK", skill: "PK.patterns", prompt: "What comes next?  🔺 ⚪ 🔺 ⚪ ❓", choices: ["🔺", "⚪", "⬛", "⭐"], answer: "🔺", explanation: "Triangle, circle, triangle, circle… so triangle 🔺 comes next!" },
  { subject: "math", grade: "PK", skill: "PK.patterns", prompt: "What comes next?  🐶 🐱 🐶 🐱 ❓", choices: ["🐶", "🐱", "🐭", "🐰"], answer: "🐶", explanation: "Dog, cat, dog, cat… so dog 🐶 comes next!" },
  // PK.numbers — number recognition
  { subject: "math", grade: "PK", skill: "PK.numbers", prompt: "Which one is the number 2?", choices: ["2", "5", "7", "9"], answer: "2", explanation: "That's the number 2!" },
  { subject: "math", grade: "PK", skill: "PK.numbers", prompt: "Which one is the number 3?", choices: ["3", "8", "1", "6"], answer: "3", explanation: "That's the number 3!" },
  { subject: "math", grade: "PK", skill: "PK.numbers", prompt: "Find the number 5.", choices: ["5", "2", "9", "4"], answer: "5", explanation: "That's the number 5!" },
  { subject: "math", grade: "PK", skill: "PK.numbers", prompt: "Find the number 1.", choices: ["1", "7", "4", "8"], answer: "1", explanation: "That's the number 1!" },
  { subject: "math", grade: "PK", skill: "PK.numbers", prompt: "Which one is the number 4?", choices: ["4", "6", "0", "3"], answer: "4", explanation: "That's the number 4!" },

  // ===== READING readiness =====
  // PK.letters — uppercase recognition
  { subject: "reading", grade: "PK", skill: "PK.letters", prompt: "Which one is the letter B?", choices: ["B", "D", "P", "R"], answer: "B", explanation: "That's the letter B!" },
  { subject: "reading", grade: "PK", skill: "PK.letters", prompt: "Find the letter A.", choices: ["A", "H", "K", "X"], answer: "A", explanation: "That's the letter A!" },
  { subject: "reading", grade: "PK", skill: "PK.letters", prompt: "Which one is the letter S?", choices: ["S", "Z", "E", "C"], answer: "S", explanation: "That's the letter S!" },
  { subject: "reading", grade: "PK", skill: "PK.letters", prompt: "Find the letter M.", choices: ["M", "N", "W", "V"], answer: "M", explanation: "That's the letter M!" },
  { subject: "reading", grade: "PK", skill: "PK.letters", prompt: "Which one is the letter O?", choices: ["O", "Q", "C", "G"], answer: "O", explanation: "That's the letter O!" },
  // PK.listen — tap the named thing (listening + vocabulary)
  { subject: "reading", grade: "PK", skill: "PK.listen", prompt: "Tap the dog.", choices: ["🐶", "🐱", "🐦", "🐟"], answer: "🐶", explanation: "That's the dog! 🐶" },
  { subject: "reading", grade: "PK", skill: "PK.listen", prompt: "Tap the apple.", choices: ["🍎", "🍌", "🍇", "🍊"], answer: "🍎", explanation: "That's the apple! 🍎" },
  { subject: "reading", grade: "PK", skill: "PK.listen", prompt: "Tap the sun.", choices: ["☀️", "🌙", "⭐", "☁️"], answer: "☀️", explanation: "That's the sun! ☀️" },
  { subject: "reading", grade: "PK", skill: "PK.listen", prompt: "Tap the car.", choices: ["🚗", "✈️", "🚲", "⛵"], answer: "🚗", explanation: "That's the car! 🚗" },
  { subject: "reading", grade: "PK", skill: "PK.listen", prompt: "Tap the flower.", choices: ["🌸", "🌳", "🍄", "🌵"], answer: "🌸", explanation: "That's the flower! 🌸" },
  // PK.colors
  { subject: "reading", grade: "PK", skill: "PK.colors", prompt: "Tap the RED one.", choices: ["🔴", "🔵", "🟢", "🟡"], answer: "🔴", explanation: "That one is red! 🔴" },
  { subject: "reading", grade: "PK", skill: "PK.colors", prompt: "Tap the BLUE one.", choices: ["🔵", "🔴", "🟢", "🟡"], answer: "🔵", explanation: "That one is blue! 🔵" },
  { subject: "reading", grade: "PK", skill: "PK.colors", prompt: "Tap the GREEN one.", choices: ["🟢", "🔴", "🔵", "🟡"], answer: "🟢", explanation: "That one is green! 🟢" },
  { subject: "reading", grade: "PK", skill: "PK.colors", prompt: "Tap the YELLOW one.", choices: ["🟡", "🔴", "🔵", "🟢"], answer: "🟡", explanation: "That one is yellow! 🟡" },
  { subject: "reading", grade: "PK", skill: "PK.colors", prompt: "Tap the PURPLE one.", choices: ["🟣", "🔴", "🔵", "🟢"], answer: "🟣", explanation: "That one is purple! 🟣" },

  // ===== SCIENCE / discovery =====
  // PK.animals
  { subject: "science", grade: "PK", skill: "PK.animals", prompt: "Which animal says “moo”?", choices: ["🐄", "🐶", "🐱", "🐔"], answer: "🐄", explanation: "The cow says moo! 🐄" },
  { subject: "science", grade: "PK", skill: "PK.animals", prompt: "Which animal says “woof”?", choices: ["🐶", "🐱", "🐮", "🐸"], answer: "🐶", explanation: "The dog says woof! 🐶" },
  { subject: "science", grade: "PK", skill: "PK.animals", prompt: "Which animal can fly?", choices: ["🐦", "🐶", "🐟", "🐢"], answer: "🐦", explanation: "The bird can fly! 🐦" },
  { subject: "science", grade: "PK", skill: "PK.animals", prompt: "Which animal lives in the water?", choices: ["🐟", "🐶", "🐱", "🐰"], answer: "🐟", explanation: "The fish lives in the water! 🐟" },
  { subject: "science", grade: "PK", skill: "PK.animals", prompt: "Which one is a cat?", choices: ["🐱", "🐶", "🐭", "🐰"], answer: "🐱", explanation: "That's the cat! 🐱" },
  // PK.weather
  { subject: "science", grade: "PK", skill: "PK.weather", prompt: "Which one is the sun?", choices: ["☀️", "🌧️", "❄️", "🌈"], answer: "☀️", explanation: "That's the bright sun! ☀️" },
  { subject: "science", grade: "PK", skill: "PK.weather", prompt: "What do we see when it rains?", choices: ["🌧️", "☀️", "⭐", "🌈"], answer: "🌧️", explanation: "Rain falls from the clouds! 🌧️" },
  { subject: "science", grade: "PK", skill: "PK.weather", prompt: "Which one is snow?", choices: ["❄️", "☀️", "🌧️", "🌈"], answer: "❄️", explanation: "Snow is cold and white! ❄️" },
  { subject: "science", grade: "PK", skill: "PK.weather", prompt: "Which one is a rainbow?", choices: ["🌈", "☀️", "❄️", "🌧️"], answer: "🌈", explanation: "A rainbow has lots of colors! 🌈" },
  { subject: "science", grade: "PK", skill: "PK.weather", prompt: "What do we see in the sky at night?", choices: ["🌙", "☀️", "🌈", "🌧️"], answer: "🌙", explanation: "We see the moon at night! 🌙" },
  // PK.body
  { subject: "science", grade: "PK", skill: "PK.body", prompt: "Which one do you SEE with?", choices: ["👁️", "👂", "👃", "👋"], answer: "👁️", explanation: "You see with your eyes! 👁️" },
  { subject: "science", grade: "PK", skill: "PK.body", prompt: "Which one do you HEAR with?", choices: ["👂", "👁️", "👃", "👅"], answer: "👂", explanation: "You hear with your ears! 👂" },
  { subject: "science", grade: "PK", skill: "PK.body", prompt: "Which one do you SMELL with?", choices: ["👃", "👁️", "👂", "👋"], answer: "👃", explanation: "You smell with your nose! 👃" },
  { subject: "science", grade: "PK", skill: "PK.body", prompt: "Which one do you WAVE with?", choices: ["👋", "👁️", "👂", "👃"], answer: "👋", explanation: "You wave with your hand! 👋" },
  { subject: "science", grade: "PK", skill: "PK.body", prompt: "Which one do you WALK with?", choices: ["🦶", "👁️", "👂", "👃"], answer: "🦶", explanation: "You walk with your feet! 🦶" },

  // ========================================================================
  // ADDITIONAL PRE-K BANK — picture-based, read aloud. answer ∈ choices.
  // ========================================================================

  // PK.count (1–5)
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many cats? 🐱🐱", choices: ["1", "2", "3", "4"], answer: "2", explanation: "1, 2 — there are 2 cats!" },
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many flowers? 🌸🌸🌸🌸🌸", choices: ["3", "4", "5", "6"], answer: "5", explanation: "1, 2, 3, 4, 5 — there are 5 flowers!" },
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many cars? 🚗🚗🚗", choices: ["1", "2", "3", "4"], answer: "3", explanation: "1, 2, 3 — there are 3 cars!" },
  { subject: "math", grade: "PK", skill: "PK.count", prompt: "How many bees? 🐝🐝🐝🐝", choices: ["2", "3", "4", "5"], answer: "4", explanation: "1, 2, 3, 4 — there are 4 bees!" },
  // PK.shapes
  { subject: "math", grade: "PK", skill: "PK.shapes", prompt: "Which shape is round like a ball?", choices: ["⚪", "⬛", "🔺", "⭐"], answer: "⚪", explanation: "A circle is round, like a ball. ⚪" },
  { subject: "math", grade: "PK", skill: "PK.shapes", prompt: "Which shape has 3 points?", choices: ["🔺", "⚪", "⬛", "❤️"], answer: "🔺", explanation: "A triangle has 3 points and 3 sides. 🔺" },
  { subject: "math", grade: "PK", skill: "PK.shapes", prompt: "Which one is a square box?", choices: ["⬛", "⚪", "🔺", "⭐"], answer: "⬛", explanation: "A square has 4 equal sides. ⬛" },
  // PK.size
  { subject: "math", grade: "PK", skill: "PK.size", prompt: "Which one is the BIGGEST?", choices: ["🐳", "🐟", "🦐", "🐚"], answer: "🐳", explanation: "The whale is the biggest! 🐳" },
  { subject: "math", grade: "PK", skill: "PK.size", prompt: "Which one is the SMALLEST?", choices: ["🐝", "🦅", "🦉", "🦆"], answer: "🐝", explanation: "The bee is the smallest! 🐝" },
  { subject: "math", grade: "PK", skill: "PK.size", prompt: "Which one is the TALLEST?", choices: ["🌳", "🌷", "🍄", "🌱"], answer: "🌳", explanation: "The tree is the tallest! 🌳" },
  // PK.patterns
  { subject: "math", grade: "PK", skill: "PK.patterns", prompt: "What comes next?  🟡 🟢 🟡 🟢 ❓", choices: ["🟡", "🟢", "🔴", "🔵"], answer: "🟡", explanation: "Yellow, green, yellow, green… so yellow 🟡 is next!" },
  { subject: "math", grade: "PK", skill: "PK.patterns", prompt: "What comes next?  ☀️ ☁️ ☀️ ☁️ ❓", choices: ["☀️", "☁️", "🌙", "🌈"], answer: "☀️", explanation: "Sun, cloud, sun, cloud… so the sun ☀️ is next!" },
  { subject: "math", grade: "PK", skill: "PK.patterns", prompt: "What comes next?  🚗 🚙 🚗 🚙 ❓", choices: ["🚗", "🚙", "✈️", "🚲"], answer: "🚗", explanation: "Car, jeep, car, jeep… so the car 🚗 is next!" },
  // PK.numbers
  { subject: "math", grade: "PK", skill: "PK.numbers", prompt: "Which one is the number 6?", choices: ["6", "9", "2", "4"], answer: "6", explanation: "That's the number 6!" },
  { subject: "math", grade: "PK", skill: "PK.numbers", prompt: "Find the number 7.", choices: ["7", "1", "4", "9"], answer: "7", explanation: "That's the number 7!" },
  { subject: "math", grade: "PK", skill: "PK.numbers", prompt: "Which one is the number 0?", choices: ["0", "8", "6", "3"], answer: "0", explanation: "That's the number 0 — none at all!" },

  // PK.letters
  { subject: "reading", grade: "PK", skill: "PK.letters", prompt: "Which one is the letter C?", choices: ["C", "G", "O", "Q"], answer: "C", explanation: "That's the letter C!" },
  { subject: "reading", grade: "PK", skill: "PK.letters", prompt: "Find the letter T.", choices: ["T", "I", "L", "F"], answer: "T", explanation: "That's the letter T!" },
  { subject: "reading", grade: "PK", skill: "PK.letters", prompt: "Which one is the letter E?", choices: ["E", "F", "B", "H"], answer: "E", explanation: "That's the letter E!" },
  // PK.listen
  { subject: "reading", grade: "PK", skill: "PK.listen", prompt: "Tap the cat.", choices: ["🐱", "🐶", "🐠", "🐤"], answer: "🐱", explanation: "That's the cat! 🐱" },
  { subject: "reading", grade: "PK", skill: "PK.listen", prompt: "Tap the tree.", choices: ["🌳", "🌸", "🍄", "🌵"], answer: "🌳", explanation: "That's the tree! 🌳" },
  { subject: "reading", grade: "PK", skill: "PK.listen", prompt: "Tap the ball.", choices: ["⚽", "🚗", "📚", "🧸"], answer: "⚽", explanation: "That's the ball! ⚽" },
  // PK.colors
  { subject: "reading", grade: "PK", skill: "PK.colors", prompt: "Tap the ORANGE one.", choices: ["🟠", "🔴", "🔵", "🟢"], answer: "🟠", explanation: "That one is orange! 🟠" },
  { subject: "reading", grade: "PK", skill: "PK.colors", prompt: "Which fruit is red?", choices: ["🍎", "🍌", "🍇", "🫐"], answer: "🍎", explanation: "The apple is red! 🍎" },
  { subject: "reading", grade: "PK", skill: "PK.colors", prompt: "Which fruit is yellow?", choices: ["🍌", "🍎", "🍇", "🍊"], answer: "🍌", explanation: "The banana is yellow! 🍌" },

  // PK.animals
  { subject: "science", grade: "PK", skill: "PK.animals", prompt: "Which animal says “meow”?", choices: ["🐱", "🐶", "🐄", "🐷"], answer: "🐱", explanation: "The cat says meow! 🐱" },
  { subject: "science", grade: "PK", skill: "PK.animals", prompt: "Which animal hops?", choices: ["🐰", "🐟", "🐍", "🐌"], answer: "🐰", explanation: "The rabbit hops! 🐰" },
  { subject: "science", grade: "PK", skill: "PK.animals", prompt: "Which animal lives in a barn and says “oink”?", choices: ["🐷", "🐦", "🐠", "🦋"], answer: "🐷", explanation: "The pig says oink! 🐷" },
  // PK.weather
  { subject: "science", grade: "PK", skill: "PK.weather", prompt: "What do you wear when it is cold and snowy?", choices: ["🧥", "🩳", "👕", "🕶️"], answer: "🧥", explanation: "You wear a warm coat in the snow! 🧥" },
  { subject: "science", grade: "PK", skill: "PK.weather", prompt: "Which one is a cloud?", choices: ["☁️", "☀️", "⭐", "🌈"], answer: "☁️", explanation: "That's a fluffy cloud! ☁️" },
  { subject: "science", grade: "PK", skill: "PK.weather", prompt: "What helps on a bright sunny day?", choices: ["🕶️", "🧤", "🧣", "☂️"], answer: "🕶️", explanation: "Sunglasses help on a bright sunny day! 🕶️" },
  // PK.body
  { subject: "science", grade: "PK", skill: "PK.body", prompt: "Which one do you TASTE with?", choices: ["👅", "👁️", "👂", "🦶"], answer: "👅", explanation: "You taste with your tongue! 👅" },
  { subject: "science", grade: "PK", skill: "PK.body", prompt: "Which one do you CLAP with?", choices: ["👏", "🦶", "👂", "👃"], answer: "👏", explanation: "You clap with your hands! 👏" },
  { subject: "science", grade: "PK", skill: "PK.body", prompt: "Which part do you use to KICK a ball?", choices: ["🦶", "👁️", "👂", "👃"], answer: "🦶", explanation: "You kick with your foot! 🦶" },
];
