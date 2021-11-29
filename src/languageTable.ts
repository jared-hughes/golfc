const _languageTable = {
  // this needs some verification
  fish: { ext: "fish" },
  assembly: { ext: "asm" },
  bash: { ext: "bash" },
  brainfuck: { ext: "bf" },
  c: { ext: "c" },
  "c-sharp": { ext: "cs" },
  cobol: { ext: "cbl" },
  crystal: { ext: "cr" },
  "f-sharp": { ext: "fs" },
  fortran: { ext: "f90" },
  go: { ext: "go" },
  haskell: { ext: "hs" },
  hexagony: { ext: "hexagony" },
  j: { ext: "ijs" },
  java: { ext: "java" },
  javascript: { ext: "js" },
  julia: { ext: "jl" },
  lisp: { ext: "lisp" },
  lua: { ext: "lua" },
  nim: { ext: "nim" },
  pascal: { ext: "pas" },
  perl: { ext: "pl" },
  prolog: { ext: "pl" },
  php: { ext: "php" },
  powershell: { ext: "ps1" },
  python: { ext: "py" },
  raku: { ext: "raku" },
  ruby: { ext: "rb" },
  rust: { ext: "rs" },
  sql: { ext: "sql" },
  swift: { ext: "swift" },
  v: { ext: "v" },
  viml: { ext: "viml" },
  zig: { ext: "zig" },
};

type LanguageTable = {
  [K in keyof typeof _languageTable]: {
    ext: string;
  };
};

const languageTable: LanguageTable = _languageTable;

type Lang = keyof typeof languageTable;

export function isLang(s: string): s is Lang {
  return languageTable.hasOwnProperty(s);
}

export function assertIsLang(s: string): asserts s is Lang {
  if (!isLang(s)) {
    throw new Error(`Unrecognized lang: "${s}"`);
  }
}

export function getLangExt(s: Lang): string {
  return languageTable[s].ext;
}

export function getLangName(s: Lang) {
  // all names are safe, so return unchanged
  return s;
}
