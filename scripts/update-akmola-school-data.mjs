import fs from 'node:fs/promises';
import vm from 'node:vm';
import { akmolaKazakhNames } from './akmola-translations.mjs';

const assetPath = new URL('../assets/akmola-schools.js', import.meta.url);
const source = await fs.readFile(assetPath, 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const data = context.window.AKMOLA_SCHOOLS;

if (!data || data.schools.length !== akmolaKazakhNames.length) {
  throw new Error(`Expected ${akmolaKazakhNames.length} Akmola schools, received ${data && data.schools.length}`);
}

data.schools.forEach((school, index) => {
  school.kk = akmolaKazakhNames[index];
  school.desc = { kk: '', ru: '' };
});

await fs.writeFile(assetPath, `/* Updated from Акмола список школ.xlsx — Kazakh full school names. */\nwindow.AKMOLA_SCHOOLS = ${JSON.stringify(data, null, 2)};\n`, 'utf8');
console.log(`Updated ${data.schools.length} Akmola school names.`);
