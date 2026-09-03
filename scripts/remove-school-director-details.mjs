import fs from 'node:fs/promises';
import vm from 'node:vm';

const assets = [
  ['assets/abay-schools.js', 'ABAY_SCHOOLS'],
  ['assets/akmola-schools.js', 'AKMOLA_SCHOOLS'],
  ['assets/almaty-schools.js', 'ALMATY_SCHOOLS'],
  ['assets/karaganda-schools.js', 'KARAGANDA_SCHOOLS'],
  ['assets/kostanay-schools.js', 'KOSTANAY_SCHOOLS'],
  ['assets/kyzylorda-schools.js', 'KYZYLORDA_SCHOOLS'],
  ['assets/vko-schools.js', 'VKO_SCHOOLS'],
  ['assets/west-kazakhstan-schools.js', 'WEST_KAZAKHSTAN_SCHOOLS'],
  ['assets/zhambyl-schools.js', 'ZHAMBYL_SCHOOLS'],
];

function cleanDescription(value) {
  return String(value || '')
    .replace(/(?:директоры?|директор)\s*:\s*[\s\S]*?(?=(?:мекен\s*[-–]?\s*жай|мекенжай|адрес)\s*[:：]|$)/gi, '')
    .replace(/^\s*[-–,:;|]+\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

let updated = 0;
let removed = 0;
for (const [assetPath, globalName] of assets) {
  const source = await fs.readFile(assetPath, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  const data = context.window[globalName];
  let changed = false;
  for (const school of data.schools) {
    if (!school.desc) continue;
    for (const language of ['kk', 'ru']) {
      const before = school.desc[language] || '';
      const after = cleanDescription(before);
      if (after !== before) {
        school.desc[language] = after;
        changed = true;
        removed += 1;
      }
    }
  }
  if (changed) {
    await fs.writeFile(assetPath, `/* Director details removed from public school descriptions. */\nwindow.${globalName} = ${JSON.stringify(data, null, 2)};\n`, 'utf8');
    updated += 1;
  }
}

console.log(`Updated ${updated} assets; removed director text from ${removed} descriptions.`);
