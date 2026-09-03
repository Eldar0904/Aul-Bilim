import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
import { almatyUpdates, fullKazakhSchoolName } from './almaty-source-data.mjs';

const inputPath = 'C:/Users/Pine/OneDrive/Документы/Жоба мектеп тізімі.xlsx';
const outputDir = 'outputs/almaty';
const outputPath = `${outputDir}/Жоба мектеп тізімі — Алматы 50 қазақша.xlsx`;
const sheetName = 'Алматы 50';

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sheet = workbook.worksheets.getItem(sheetName);

const styleBefore = await workbook.inspect({
  kind: 'computedStyle',
  sheetId: sheetName,
  range: 'A1:G6',
  maxChars: 3000,
});
console.log(styleBefore.ndjson ?? styleBefore);

sheet.getRange('C3:C52').values = almatyUpdates.map(([schoolName], index) => [fullKazakhSchoolName(index, schoolName)]);

const verification = await workbook.inspect({
  kind: 'table',
  sheetId: sheetName,
  range: 'A1:G8',
  maxChars: 5000,
  tableMaxRows: 8,
  tableMaxCols: 7,
  tableMaxCellChars: 180,
});
console.log(verification.ndjson ?? verification);

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

try {
  const preview = await workbook.render({ sheetName, autoCrop: 'all', scale: 1, format: 'png' });
  await fs.writeFile(`${outputDir}/almaty-50-preview.png`, new Uint8Array(await preview.arrayBuffer()));
  console.log('Rendered workbook preview.');
} catch (error) {
  console.warn(`Workbook preview unavailable: ${error.message}`);
}

console.log(JSON.stringify({ outputPath, rowsUpdated: almatyUpdates.length }));
