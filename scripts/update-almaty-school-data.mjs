import fs from 'node:fs/promises';
import vm from 'node:vm';
import { almatyUpdates, fullKazakhSchoolName } from './almaty-source-data.mjs';

const path = new URL('../assets/almaty-schools.js', import.meta.url);
const source = await fs.readFile(path, 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const data = context.window.ALMATY_SCHOOLS;

if (data.schools.length !== almatyUpdates.length) {
  throw new Error(`Expected ${almatyUpdates.length} schools, found ${data.schools.length}`);
}

for (const [index, school] of data.schools.entries()) {
  const [kk, address] = almatyUpdates[index];
  school.kk = fullKazakhSchoolName(index, kk);
  school.desc = {
    kk: `Мекенжайы: ${address}`,
    ru: `Адрес: ${address}`,
  };
}

const output = `/* Auto-generated — Almaty Region schools reconciled with Жоба мектеп тізімі.xlsx / Алматы 50 */\nwindow.ALMATY_SCHOOLS = ${JSON.stringify(data, null, 2)};\n`;
await fs.writeFile(path, output, 'utf8');
console.log(`Updated ${data.schools.length} Almaty schools in ${path.pathname}`);
