// SummerSharp Economics bank — authored & fact-checked, grade-appropriate.
// Florida Social Studies (SS) Economics strand. Needs-vs-wants items use only
// unambiguous contrasts (food/water/shelter = needs; toys/candy/games = wants);
// money values are exact. Hand-authored; `standard` left null. Each item:
// { grade, skill, prompt, choices, answer, explanation }. Generator sets
// subject="economics", shuffles choices, computes index — `answer` must match a
// choice exactly. Skill tags prefixed `econ.`

export const ECONOMICS = [
  // ===== KINDERGARTEN ===== (needs vs wants, money, jobs)
  // econ.K.needswants
  { grade: "K", skill: "econ.K.needswants", prompt: "Which is something you NEED to live?", choices: ["Food", "A toy", "Candy", "A video game"], answer: "Food", explanation: "Food is a need — your body must have it to live." },
  { grade: "K", skill: "econ.K.needswants", prompt: "Which is a WANT, not a need?", choices: ["A toy", "Water", "Food", "A place to live"], answer: "A toy", explanation: "A toy is a want — it's nice to have but not needed to live." },
  { grade: "K", skill: "econ.K.needswants", prompt: "Your body NEEDS ___ to stay alive.", choices: ["water", "stickers", "balloons", "games"], answer: "water", explanation: "Water is a need; people cannot live without it." },
  // econ.K.money
  { grade: "K", skill: "econ.K.money", prompt: "What do people use to buy things at a store?", choices: ["Money", "Leaves", "Rocks", "Crayons"], answer: "Money", explanation: "People use money to buy the things they need and want." },
  { grade: "K", skill: "econ.K.money", prompt: "A penny, a nickel, and a dime are all kinds of ___.", choices: ["coins", "fruits", "animals", "toys"], answer: "coins", explanation: "Pennies, nickels, and dimes are coins — a kind of money." },
  // econ.K.jobs
  { grade: "K", skill: "econ.K.jobs", prompt: "Why do grown-ups go to work at a job?", choices: ["To earn money", "To get sleepy", "To skip lunch", "To stay home"], answer: "To earn money", explanation: "People work at jobs to earn money." },
  { grade: "K", skill: "econ.K.jobs", prompt: "A person who bakes and sells bread has the job of a ___.", choices: ["baker", "pilot", "dentist", "firefighter"], answer: "baker", explanation: "A baker bakes bread and other treats to sell." },

  // ===== GRADE 1 ===== (goods vs services, money, jobs)
  // econ.1.needswants
  { grade: "1", skill: "econ.1.needswants", prompt: "Which group lists only NEEDS?", choices: ["Food, water, and shelter", "Toys, candy, and games", "Stickers and balloons", "Movies and ice cream"], answer: "Food, water, and shelter", explanation: "Food, water, and shelter are needs everyone must have." },
  { grade: "1", skill: "econ.1.needswants", prompt: "A family has a little money. They should spend it FIRST on ___.", choices: ["food for dinner", "a new video game", "fireworks", "a toy robot"], answer: "food for dinner", explanation: "Needs like food come before wants when money is limited." },
  // econ.1.goodsservices
  { grade: "1", skill: "econ.1.goodsservices", prompt: "A 'good' is something you can ___.", choices: ["touch and own, like a book", "only hear", "never see", "only dream about"], answer: "touch and own, like a book", explanation: "Goods are objects you can touch and own, like toys, food, or books." },
  { grade: "1", skill: "econ.1.goodsservices", prompt: "A 'service' is work that someone does for ___.", choices: ["you, like cutting hair", "the moon", "no one", "robots only"], answer: "you, like cutting hair", explanation: "A service is helpful work someone does for you, like a haircut." },
  { grade: "1", skill: "econ.1.goodsservices", prompt: "Which one is a GOOD (an object)?", choices: ["An apple", "A bus ride", "A doctor's checkup", "A haircut"], answer: "An apple", explanation: "An apple is a good — an object you can hold. The others are services." },
  // econ.1.money
  { grade: "1", skill: "econ.1.money", prompt: "If something costs more money, it is more ___ than a cheaper item.", choices: ["expensive", "tasty", "colorful", "quiet"], answer: "expensive", explanation: "Costing more money means it is more expensive." },
  // econ.1.jobs
  { grade: "1", skill: "econ.1.jobs", prompt: "A person who grows crops and raises animals for food is a ___.", choices: ["farmer", "pilot", "singer", "banker"], answer: "farmer", explanation: "Farmers grow crops and raise animals." },

  // ===== GRADE 2 ===== (goods/services, saving, money value, trade)
  // econ.2.goodsservices
  { grade: "2", skill: "econ.2.goodsservices", prompt: "Which one is a SERVICE?", choices: ["A teacher teaching a class", "A bag of apples", "A bicycle", "A pair of shoes"], answer: "A teacher teaching a class", explanation: "Teaching is a service — helpful work. The others are goods." },
  { grade: "2", skill: "econ.2.goodsservices", prompt: "A doctor giving a checkup is an example of a ___.", choices: ["service", "good", "toy", "coin"], answer: "service", explanation: "A checkup is a service the doctor provides." },
  // econ.2.saving
  { grade: "2", skill: "econ.2.saving", prompt: "Putting money away to use later is called ___.", choices: ["saving", "spending", "losing", "eating"], answer: "saving", explanation: "Saving means keeping money to use in the future." },
  { grade: "2", skill: "econ.2.saving", prompt: "If you want to buy something that costs more than you have, you should ___.", choices: ["save up over time", "give up forever", "take it for free", "throw your money away"], answer: "save up over time", explanation: "Saving a little at a time helps you afford bigger things." },
  // econ.2.money
  { grade: "2", skill: "econ.2.money", prompt: "How many cents is one dollar?", choices: ["100", "10", "50", "1000"], answer: "100", explanation: "One dollar equals 100 cents." },
  { grade: "2", skill: "econ.2.money", prompt: "How much is a quarter worth?", choices: ["25 cents", "5 cents", "10 cents", "1 cent"], answer: "25 cents", explanation: "A quarter is worth 25 cents." },
  { grade: "2", skill: "econ.2.money", prompt: "Which coin is worth the most?", choices: ["A quarter", "A dime", "A nickel", "A penny"], answer: "A quarter", explanation: "A quarter (25¢) is worth more than a dime, nickel, or penny." },
  // econ.2.trade
  { grade: "2", skill: "econ.2.trade", prompt: "Trading one thing for another without using money is called ___.", choices: ["bartering", "saving", "earning", "borrowing"], answer: "bartering", explanation: "Bartering means swapping goods or services without money." },

  // ===== GRADE 3 ===== (scarcity, producers/consumers, choices)
  // econ.3.scarcity
  { grade: "3", skill: "econ.3.scarcity", prompt: "Scarcity means there is ___.", choices: ["not enough for everyone's wants", "too much of everything", "only candy", "no such thing as choices"], answer: "not enough for everyone's wants", explanation: "Scarcity is when there isn't enough to satisfy everyone's wants." },
  { grade: "3", skill: "econ.3.scarcity", prompt: "Because of scarcity, people must make ___.", choices: ["choices", "noise", "rain", "mountains"], answer: "choices", explanation: "Since we can't have everything, scarcity forces us to choose." },
  // econ.3.producerconsumer
  { grade: "3", skill: "econ.3.producerconsumer", prompt: "A person who MAKES or sells goods is a ___.", choices: ["producer", "consumer", "tourist", "citizen"], answer: "producer", explanation: "A producer makes or provides goods and services." },
  { grade: "3", skill: "econ.3.producerconsumer", prompt: "A person who BUYS and uses goods is a ___.", choices: ["consumer", "producer", "governor", "explorer"], answer: "consumer", explanation: "A consumer buys and uses goods and services." },
  // econ.3.choices
  { grade: "3", skill: "econ.3.choices", prompt: "When you choose one thing, the thing you give up is called the ___.", choices: ["trade-off", "bonus", "prize", "refund"], answer: "trade-off", explanation: "A trade-off is what you give up when you make a choice." },
  // econ.3.income
  { grade: "3", skill: "econ.3.income", prompt: "The money a person earns from working is called ___.", choices: ["income", "weather", "scarcity", "a service"], answer: "income", explanation: "Income is the money you earn from a job." },

  // ===== GRADE 4 ===== (opportunity cost, budgets, supply & demand)
  // econ.4.opportunitycost
  { grade: "4", skill: "econ.4.opportunitycost", prompt: "Opportunity cost is the value of the next-best thing you ___ when you choose.", choices: ["give up", "win", "buy twice", "save forever"], answer: "give up", explanation: "Opportunity cost is the best thing you give up to get what you chose." },
  { grade: "4", skill: "econ.4.opportunitycost", prompt: "If you spend your money on a game, the opportunity cost might be the ___ you didn't buy.", choices: ["book", "sunshine", "weekend", "holiday"], answer: "book", explanation: "The opportunity cost is the other thing (the book) you gave up." },
  // econ.4.budget
  { grade: "4", skill: "econ.4.budget", prompt: "A budget is a plan for how to ___ your money.", choices: ["earn, spend, and save", "lose", "hide and forget", "color"], answer: "earn, spend, and save", explanation: "A budget plans how you earn, spend, and save money." },
  { grade: "4", skill: "econ.4.budget", prompt: "Spending less money than you earn lets you ___.", choices: ["save", "go broke", "owe money", "run out instantly"], answer: "save", explanation: "Spending less than you earn means you can save the rest." },
  // econ.4.supplydemand
  { grade: "4", skill: "econ.4.supplydemand", prompt: "When LOTS of people want a toy but there are very few left, the price often goes ___.", choices: ["up", "down", "to zero", "away"], answer: "up", explanation: "High demand and low supply usually push the price up." },
  { grade: "4", skill: "econ.4.supplydemand", prompt: "'Demand' means how much people ___ to buy something.", choices: ["want", "hate", "forget", "lose"], answer: "want", explanation: "Demand is how much people want and are willing to buy." },
  // econ.4.business
  { grade: "4", skill: "econ.4.business", prompt: "The money a business has left after paying its costs is called ___.", choices: ["profit", "scarcity", "a service", "a tax refund"], answer: "profit", explanation: "Profit is what's left after a business pays its costs." },

  // ===== GRADE 5 ===== (markets, banking, specialization, trade) =====
  // econ.5.market
  { grade: "5", skill: "econ.5.market", prompt: "A place or system where goods and services are bought and sold is a ___.", choices: ["market", "museum", "mountain", "memory"], answer: "market", explanation: "A market is where buyers and sellers trade goods and services." },
  { grade: "5", skill: "econ.5.market", prompt: "In a market, the price is set by both buyers and ___.", choices: ["sellers", "the weather", "the moon", "teachers only"], answer: "sellers", explanation: "Prices come from the interaction of buyers and sellers." },
  // econ.5.banking
  { grade: "5", skill: "econ.5.banking", prompt: "A bank is a safe place to keep your money and can pay you ___ on savings.", choices: ["interest", "homework", "weather", "stickers"], answer: "interest", explanation: "Banks keep money safe and can pay interest on savings." },
  { grade: "5", skill: "econ.5.banking", prompt: "Interest is extra money the bank pays you for ___ your money there.", choices: ["saving", "spending", "losing", "hiding"], answer: "saving", explanation: "Interest is a reward for keeping (saving) money in the bank." },
  // econ.5.specialization
  { grade: "5", skill: "econ.5.specialization", prompt: "When people focus on the one job they do best, it is called ___.", choices: ["specialization", "scarcity", "bartering", "budgeting"], answer: "specialization", explanation: "Specialization is focusing on what you do best, then trading for the rest." },
  { grade: "5", skill: "econ.5.specialization", prompt: "Countries and people TRADE because no one can produce ___ by themselves.", choices: ["everything they need", "nothing at all", "only toys", "rain"], answer: "everything they need", explanation: "Trade lets people get goods they don't or can't make themselves." },
  // econ.5.taxes
  { grade: "5", skill: "econ.5.taxes", prompt: "Money people pay to the government to fund services like roads and schools is called ___.", choices: ["taxes", "tips", "allowance", "interest"], answer: "taxes", explanation: "Taxes are money paid to the government to pay for public services." },

  // ===== ADDITIONAL BANK (deeper coverage) =====
  // K
  { grade: "K", skill: "econ.K.needswants", prompt: "Which is a NEED that keeps you warm and safe?", choices: ["A home to live in", "A balloon", "A board game", "A stuffed animal"], answer: "A home to live in", explanation: "A home (shelter) is a need that keeps you safe and warm." },
  { grade: "K", skill: "econ.K.money", prompt: "If you don't have enough money for two toys, you can buy ___.", choices: ["one toy", "both anyway", "three toys", "the whole store"], answer: "one toy", explanation: "With limited money you can only buy what you can afford." },
  { grade: "K", skill: "econ.K.jobs", prompt: "A person who teaches students at school has the job of a ___.", choices: ["teacher", "pilot", "chef", "farmer"], answer: "teacher", explanation: "A teacher's job is helping students learn." },
  // 1
  { grade: "1", skill: "econ.1.goodsservices", prompt: "Which one is a SERVICE?", choices: ["A bus driver giving you a ride", "A loaf of bread", "A soccer ball", "A box of crayons"], answer: "A bus driver giving you a ride", explanation: "Driving you somewhere is a service. The others are goods." },
  { grade: "1", skill: "econ.1.jobs", prompt: "People use the money they earn from a job to buy ___.", choices: ["things they need and want", "only air", "nothing ever", "homework"], answer: "things they need and want", explanation: "Earned money pays for needs and wants." },
  { grade: "1", skill: "econ.1.needswants", prompt: "Which is a WANT?", choices: ["A new video game", "Drinking water", "A warm coat in winter", "Healthy food"], answer: "A new video game", explanation: "A video game is a want; the others are needs." },
  // 2
  { grade: "2", skill: "econ.2.money", prompt: "How many quarters make one dollar?", choices: ["4", "2", "10", "100"], answer: "4", explanation: "Four quarters (4 × 25¢) equal 100¢, which is one dollar." },
  { grade: "2", skill: "econ.2.saving", prompt: "A good place to keep money you are saving is a ___.", choices: ["piggy bank or bank", "puddle", "trash can", "sandbox"], answer: "piggy bank or bank", explanation: "A piggy bank or a real bank keeps saved money safe." },
  { grade: "2", skill: "econ.2.goodsservices", prompt: "Buying a toy at a store is buying a ___.", choices: ["good", "service", "tax", "vote"], answer: "good", explanation: "A toy is a good — an object you can hold and own." },
  // 3
  { grade: "3", skill: "econ.3.scarcity", prompt: "When a store sells out of a popular item, that is an example of ___.", choices: ["scarcity", "plenty", "saving", "a service"], answer: "scarcity", explanation: "Running out because there isn't enough is scarcity." },
  { grade: "3", skill: "econ.3.producerconsumer", prompt: "A bakery that makes and sells cakes is acting as a ___.", choices: ["producer", "consumer", "voter", "tourist"], answer: "producer", explanation: "The bakery produces and sells goods, so it is a producer." },
  { grade: "3", skill: "econ.3.income", prompt: "Money you receive as a gift or allowance is also a kind of ___.", choices: ["income", "tax", "service", "scarcity"], answer: "income", explanation: "Income is money you receive, including allowance or gifts." },
  // 4
  { grade: "4", skill: "econ.4.budget", prompt: "In a budget, the money you set aside and do not spend is your ___.", choices: ["savings", "scarcity", "demand", "service"], answer: "savings", explanation: "Money you keep instead of spending is savings." },
  { grade: "4", skill: "econ.4.supplydemand", prompt: "'Supply' means how much of something is ___ to buy.", choices: ["available", "forbidden", "imaginary", "broken"], answer: "available", explanation: "Supply is how much of a good is available for sale." },
  { grade: "4", skill: "econ.4.opportunitycost", prompt: "You have time to do ONE activity. Choosing to play soccer means the opportunity cost is the ___ you skipped.", choices: ["other activity", "weather", "calendar", "soccer ball"], answer: "other activity", explanation: "Opportunity cost is the next-best thing you gave up." },
  // 5
  { grade: "5", skill: "econ.5.banking", prompt: "Borrowing money that must be paid back, often with extra, is called taking out a ___.", choices: ["loan", "gift", "tax refund", "service"], answer: "loan", explanation: "A loan is borrowed money you repay, usually with interest." },
  { grade: "5", skill: "econ.5.market", prompt: "If many stores sell the same item, they ___ for customers.", choices: ["compete", "sleep", "vote", "hide"], answer: "compete", explanation: "Sellers compete for customers, which can lower prices." },
  { grade: "5", skill: "econ.5.taxes", prompt: "Public schools, roads, and parks are often paid for with ___.", choices: ["tax money", "candy", "homework", "stickers"], answer: "tax money", explanation: "Tax money funds public services like schools, roads, and parks." },
];
