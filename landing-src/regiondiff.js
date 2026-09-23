// Generic region diff between two files. Usage: node regiondiff.js A B [maxRegions]
const fs = require("fs");
const [,, pa, pb, maxArg] = process.argv;
const MAX = Number(maxArg) || 1e9;
const A = fs.readFileSync(pa, "utf8"), B = fs.readFileSync(pb, "utf8");
console.log(`A(stale) ${pa}  ${A.length} chars`);
console.log(`B(good)  ${pb}  ${B.length} chars`);
console.log(`delta ${B.length - A.length}\n`);
let i = 0, j = 0, n = 0;
while (i < A.length && j < B.length && n < MAX) {
  if (A[i] === B[j]) { i++; j++; continue; }
  let back = 0;                       // walk back equally on both sides
  while (back < 60 && i - back > 0 && /[^\s>";,]/.test(A[i - back - 1])) back++;
  const si = i - back, sj = j - back;
  let bi = -1, bj = -1;
  outer:
  for (let d = 1; d < 6000; d++)
    for (const [x, y] of [[i + d, j], [i, j + d], [i + d, j + d]])
      if (x + 24 <= A.length && y + 24 <= B.length && A.substr(x, 24) === B.substr(y, 24)) { bi = x; bj = y; break outer; }
  if (bi < 0) { console.log(`--- region ${++n} @A ${i}: NO RESYNC`); break; }
  n++;
  console.log(`--- region ${n} @A ${si} ---`);
  console.log("  STALE: " + JSON.stringify(A.slice(si, bi)));
  console.log("  GOOD : " + JSON.stringify(B.slice(sj, bj)));
  i = bi; j = bj;
}
console.log(`\n${n} differing region(s)`);
