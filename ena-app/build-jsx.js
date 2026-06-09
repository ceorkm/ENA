/* Precompile the design-handoff JSX to plain JS using the vendored Babel
   standalone (no npm install, fully offline). Output loads as classic scripts,
   preserving the same global-sharing behavior the prototype relied on. */
const fs = require("fs");
const path = require("path");

const Babel = require("./dist/vendor/babel.min.js");

const files = ["bar", "onboarding", "app"];
for (const name of files) {
  const src = path.join(__dirname, "dist", name + ".jsx");
  const dst = path.join(__dirname, "dist", "build", name + ".js");
  const code = fs.readFileSync(src, "utf8");
  const out = Babel.transform(code, {
    presets: ["react"],
    sourceType: "script",
  }).code;
  // Wrap each file in its own scope so top-level const/let don't collide across
  // files (they share one global lexical scope as classic scripts otherwise).
  // Cross-file communication happens via `window` (the files already do this).
  const wrapped = "(function(){\n" + out + "\n})();\n";
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, wrapped);
  console.log("compiled", name + ".jsx ->", "build/" + name + ".js", "(" + out.length + " bytes)");
}
console.log("done");
