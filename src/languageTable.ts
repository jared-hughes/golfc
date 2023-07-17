const extTable: Record<string, string> = {
  fish: "fish",
  assembly: "asm",
  awk: "awk",
  bash: "bash",
  basic: "bas",
  brainfuck: "bf",
  c: "c",
  cpp: "cpp",
  "c-sharp": "cs",
  cobol: "cbl",
  crystal: "cr",
  d: "d",
  dart: "dart",
  elixir: "ex",
  "f-sharp": "fs",
  forth: "fth",
  fortran: "f90",
  go: "go",
  golfscript: "gs",
  haskell: "hs",
  hexagony: "hexagony",
  j: "ijs",
  janet: "janet",
  java: "java",
  javascript: "js",
  julia: "jl",
  k: "k",
  lisp: "lisp",
  lua: "lua",
  nim: "nim",
  ocaml: "ml",
  pascal: "pas",
  perl: "pl",
  prolog: "pro",
  php: "php",
  "php-7": "php",
  powershell: "ps1",
  python: "py",
  r: "r",
  raku: "raku",
  ruby: "rb",
  rust: "rs",
  sed: "sed",
  sql: "sql",
  swift: "swift",
  tcl: "tcl",
  tex: "tex",
  v: "v",
  viml: "viml",
  wren: "wren",
  zig: "zig",
};

export function getLangExt(s: string): string {
  if (extTable[s] !== undefined) return extTable[s];
  const fileExt = s.slice(0, 3);
  console.warn(
    `Unrecognized language "${s}". Assuming file extension is ${fileExt}`
  );
  return fileExt;
}

export function getLangName(s: string) {
  // all names are safe, so return unchanged
  return s;
}
