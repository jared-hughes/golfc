const holeTable = {
  recamán: {
    name: "recaman",
  },
  "sierpiński-triangle": {
    name: "sierpinski-triangle",
  },
  λ: { name: "conways-constant" },
  π: { name: "pi" },
  τ: { name: "tau" },
  φ: { name: "phi" },
  "√2": { name: "sqrt2" },
  "𝑒": { name: "e" },
} as {
  [K: string]: {
    name?: string;
  };
};

export function getHoleName(s: string): string {
  return holeTable[getHoleID(s)]?.name ?? s;
}

export function getHoleID(s: string): string {
  for (let holeID in holeTable) {
    if (holeTable[holeID].name === s) {
      return holeID;
    }
  }
  return s;
}
