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
  γ: { name: "gamma" },
} as {
  [K: string]: {
    name?: string;
  };
};

/** Given a hole ID such as "π", return the ASCII name such as "pi" */
export function getHoleName(s: string): string {
  return holeTable[getHoleID(s)]?.name ?? s;
}

/** Given an ASCII name such as "pi", return the server's ID such as "π" */
export function getHoleID(s: string): string {
  for (let holeID in holeTable) {
    if (holeTable[holeID].name === s) {
      return holeID;
    }
  }
  return s;
}
