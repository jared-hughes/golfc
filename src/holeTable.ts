const _holeTable = {
  "12-days-of-christmas": {},
  "99-bottles-of-beer": {},
  "abundant-numbers": {},
  "arabic-to-roman": {},
  arrows: {},
  brainfuck: {},
  "christmas-trees": {},
  "css-colors": {},
  cubes: {},
  diamonds: {},
  divisors: {},
  "emirp-numbers": {},
  "ellipse-perimeters": {},
  emojify: {},
  "evil-numbers": {},
  fibonacci: {},
  "fizz-buzz": {},
  fractions: {},
  "happy-numbers": {},
  intersection: {},
  "julia-set": {},
  "kolakoski-constant": {},
  "kolakoski-sequence": {},
  "leap-years": {},
  "levenshtein-distance": {},
  "leyland-numbers": {},
  "look-and-say": {},
  "lucky-tickets": {},
  mandelbrot: {},
  maze: {},
  "morse-decoder": {},
  "morse-encoder": {},
  "musical-chords": {},
  "niven-numbers": {},
  "odd-polyomino-tiling": {},
  "odious-numbers": {},
  "ordinal-numbers": {},
  "pangram-grep": {},
  "pascals-triangle": {},
  "pernicious-numbers": {},
  poker: {},
  "prime-numbers": {},
  "qr-decoder": {},
  quine: {},
  recamán: {
    name: "recaman",
  },
  "rock-paper-scissors-spock-lizard": {},
  "roman-to-arabic": {},
  "rule-110": {},
  "seven-segment": {},
  "sierpiński-triangle": {
    name: "sierpinski-triangle",
  },
  "spelling-numbers": {},
  "star-wars-opening-crawl": {},
  sudoku: {},
  "sudoku-v2": {},
  "ten-pin-bowling": {},
  "tongue-twisters": {},
  "united-states": {},
  "vampire-numbers": {},
  "van-eck-sequence": {},
  λ: { name: "conways-constant" },
  π: { name: "pi" },
  τ: { name: "tau" },
  φ: { name: "phi" },
  "√2": { name: "sqrt2" },
  "𝑒": { name: "e" },
};

type HoleTable = {
  [K in keyof typeof _holeTable]: {
    name?: string;
  };
};

const holeTable: HoleTable = _holeTable;

type Hole = keyof typeof holeTable;

export function isHole(s: string): s is Hole {
  return holeTable.hasOwnProperty(s);
}

export function assertIsHole(s: string): asserts s is Hole {
  if (!isHole(s)) {
    throw new Error(`Unrecognized hole: "${s}"`);
  }
}

export function getHoleName(s: string): string {
  return holeTable[getHoleID(s)]?.name ?? s;
}

export function getHoleID(s: string): Hole {
  if (isHole(s)) return s;
  for (let holeID in holeTable) {
    if (isHole(holeID) && holeTable[holeID].name === s) {
      return holeID;
    }
  }
  throw new Error(`Unrecognized hole: "${s}""`);
}
