// Each scenario has a situation, three strategic choices, and outcomes
// Each choice affects: gold, army, happiness, reputation (each -3 to +3)

export const SCENARIOS = [
  {
    id: 1,
    title: 'The Dragon Problem',
    situation:
      'A dragon has moved into the volcano near your capital. Citizens are terrified. The dragon seems… friendly? He keeps waving.',
    choices: [
      {
        label: '🗡️ Send the army to fight it',
        outcome: 'Your brave army returned mostly singed. The dragon is fine.',
        effects: {gold: -1, army: -2, happiness: -1, reputation: 1},
      },
      {
        label: '🤝 Invite it to a diplomatic tea party',
        outcome:
          "Surprisingly effective. The dragon is now your ambassador. He breathes fire at rude diplomats.",
        effects: {gold: 0, army: 0, happiness: 2, reputation: 3},
      },
      {
        label: '🏠 Build him a nicer volcano',
        outcome:
          'The dragon moved in immediately and left a 5-star Yelp review for your kingdom.',
        effects: {gold: -2, army: 0, happiness: 3, reputation: 2},
      },
    ],
  },
  {
    id: 2,
    title: 'The Magic Potato',
    situation:
      'Farmers found a potato that can predict the future. It only communicates in riddles and occasionally screams at 3am.',
    choices: [
      {
        label: '📜 Declare it a national oracle',
        outcome:
          'Citizens flock to hear its wisdom. Most riddles are just potato puns.',
        effects: {gold: 2, army: 0, happiness: 2, reputation: 1},
      },
      {
        label: '🍟 Eat it (for science)',
        outcome:
          'It tasted of destiny. You gained the power to predict French fry prices.',
        effects: {gold: 1, army: 0, happiness: -1, reputation: -2},
      },
      {
        label: '🔬 Lock it up for research',
        outcome:
          'Scientists are baffled. The potato has filed for a restraining order.',
        effects: {gold: -1, army: 0, happiness: 0, reputation: 0},
      },
    ],
  },
  {
    id: 3,
    title: 'The Ninja Tax Collector',
    situation:
      'Your tax collector has been replaced by a ninja who collects taxes silently from rooftops and leaves origami receipts.',
    choices: [
      {
        label: '✅ Keep the ninja — efficiency is key',
        outcome:
          'Tax revenue tripled. Nobody knows how. The ninja is Employee of the Month.',
        effects: {gold: 3, army: 0, happiness: -1, reputation: 1},
      },
      {
        label: '🔍 Investigate where the real tax collector went',
        outcome:
          'Found him. He was napping. The ninja was his side hustle.',
        effects: {gold: 0, army: 0, happiness: 1, reputation: 0},
      },
      {
        label: '📢 Announce the ninja publicly',
        outcome:
          'Citizens love it. Tourism booms. Other kingdoms want a ninja tax collector.',
        effects: {gold: 2, army: 0, happiness: 3, reputation: 2},
      },
    ],
  },
  {
    id: 4,
    title: 'The Mutinous Bakers',
    situation:
      "Your kingdom's bakers have gone on strike, demanding more butter and the right to name a street after sourdough.",
    choices: [
      {
        label: '🧈 Give them all the butter',
        outcome:
          'Morale soared. The bread is incredible. Everyone is slightly chubby.',
        effects: {gold: -2, army: 0, happiness: 3, reputation: 1},
      },
      {
        label: '🏙️ Name the street Sourdough Boulevard',
        outcome:
          "They went back to work immediately. The street sign smells amazing.",
        effects: {gold: 0, army: 0, happiness: 2, reputation: 1},
      },
      {
        label: '🍕 Import pizza from a rival kingdom',
        outcome:
          'The bakers returned in fury. But now you have pizza, so it balances out.',
        effects: {gold: -1, army: 0, happiness: 0, reputation: -1},
      },
    ],
  },
  {
    id: 5,
    title: 'The Time-Traveling Goat',
    situation:
      "A goat appeared in the royal gardens. It has a newspaper from the future. The headline reads: 'LOCAL GOAT CAUSES INCIDENT.'",
    choices: [
      {
        label: '📰 Read the rest of the newspaper',
        outcome:
          "You learned next week's lottery numbers and that something called 'the goat incident' is still a mystery.",
        effects: {gold: 3, army: 0, happiness: 1, reputation: 0},
      },
      {
        label: '🐐 Lock up the goat to prevent the incident',
        outcome:
          "The goat escaped. You ARE the incident. History writes itself.",
        effects: {gold: 0, army: -1, happiness: -1, reputation: -2},
      },
      {
        label: '🤷 Shrug and feed it hay',
        outcome:
          "The goat seemed pleased. It left a golden acorn. Timeline unchanged.",
        effects: {gold: 1, army: 0, happiness: 1, reputation: 1},
      },
    ],
  },
  {
    id: 6,
    title: 'The Enchanted Wi-Fi',
    situation:
      "A wizard accidentally created a magic Wi-Fi network. Password is 'dragonfire'. It connects to an alternate dimension's internet.",
    choices: [
      {
        label: '📡 Make it a public service',
        outcome:
          'Citizens thrilled. Alternate-dimension memes are confusing but viral.',
        effects: {gold: 0, army: 0, happiness: 3, reputation: 2},
      },
      {
        label: '💰 Charge for access',
        outcome:
          "Revenue streams in. Someone bought a unicorn on alternate-eBay. It arrived.",
        effects: {gold: 3, army: 0, happiness: 1, reputation: 0},
      },
      {
        label: '🔌 Shut it down — too risky',
        outcome:
          "Riots. Mild ones, but still. People miss the alternate-dimension cat videos.",
        effects: {gold: 0, army: 1, happiness: -2, reputation: -1},
      },
    ],
  },
  {
    id: 7,
    title: 'The Singing Swamp',
    situation:
      "The royal swamp has started singing show tunes at midnight. Frogs are harmonizing. It's… actually pretty good.",
    choices: [
      {
        label: '🎭 Turn it into an amphitheater',
        outcome:
          "Tickets sell out for months. The frogs formed a union and demanded spotlight rental.",
        effects: {gold: 3, army: 0, happiness: 3, reputation: 2},
      },
      {
        label: '🔇 Drain the swamp (stop the noise)',
        outcome:
          "The frogs moved to the capital and performed anyway. You cannot stop the frogs.",
        effects: {gold: 0, army: 0, happiness: -1, reputation: -2},
      },
      {
        label: '🎤 Send your worst knight to battle-rap the frogs',
        outcome:
          "Surprisingly, he won. The swamp respects it. Uneasy alliance formed.",
        effects: {gold: 0, army: 1, happiness: 2, reputation: 1},
      },
    ],
  },
  {
    id: 8,
    title: 'The Invisible Army',
    situation:
      "Your court wizard accidentally made the entire army invisible. They're still there — you can hear them arguing about lunch.",
    choices: [
      {
        label: "🥪 Resolve the lunch debate first",
        outcome:
          "Army morale is now legendary. Invisibility was kept as a tactical bonus.",
        effects: {gold: -1, army: 2, happiness: 1, reputation: 1},
      },
      {
        label: '🔮 Demand the wizard fix it immediately',
        outcome:
          "He tried. Half are now polka-dotted. Visible, but deeply embarrassed.",
        effects: {gold: 0, army: -1, happiness: 0, reputation: -1},
      },
      {
        label: '📣 Announce the invisible army to intimidate rivals',
        outcome:
          "Rivals are extremely confused. Three surrendered to the empty field.",
        effects: {gold: 0, army: 1, happiness: 1, reputation: 3},
      },
    ],
  },
];

export const TOTAL_ROUNDS = 5;
