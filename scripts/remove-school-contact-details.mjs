import fs from 'node:fs/promises';
import vm from 'node:vm';

const assetsDir = new URL('../assets/', import.meta.url);
const assetNames = (await fs.readdir(assetsDir))
  .filter((name) => name.endsWith('-schools.js'));

let changedFiles = 0;
let removedLines = 0;

for (const assetName of assetNames) {
  const assetPath = new URL(assetName, assetsDir);
  const source = await fs.readFile(assetPath, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  const [globalName] = Object.keys(context.window);
  const data = context.window[globalName];
  let changed = false;

  for (const school of data.schools || []) {
    for (const lang of ['kk', 'ru']) {
      const description = school.desc && school.desc[lang];
      if (typeof description !== 'string') continue;
      const cleaned = description
        .split(/\r?\n|\\n/)
        .filter((line) => !/^\s*(?:e-?mail|телефон|phone)\s*:/i.test(line))
        .join('\\n')
        .trim();
      if (cleaned !== description) {
        removedLines += description.split(/\r?\n|\\n/).length - cleaned.split(/\r?\n|\\n/).length;
        school.desc[lang] = cleaned;
        changed = true;
      }
    }
  }

  if (changed) {
    await fs.writeFile(assetPath, `/* Contact details removed from school descriptions. */\nwindow.${globalName} = ${JSON.stringify(data, null, 2)};\n`, 'utf8');
    changedFiles += 1;
  }
}

console.log(`Updated ${changedFiles} asset file(s); removed ${removedLines} contact line(s).`);
