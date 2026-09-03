import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
import { akmolaKazakhNames } from './akmola-translations.mjs';

const inputPath = 'C:/Users/Pine/OneDrive/Документы/Акмола список школ.xlsx';
const outputPath = 'outputs/akmola/Акмола список школ — қазақша.xlsx';
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItemAt(0);
const sheetName = sheet.name;

sheet.getRange('C2:C55').values = akmolaKazakhNames.map((name) => [name]);
await fs.mkdir('outputs/akmola', { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const check = await workbook.inspect({ kind: 'table', range: 'A1:F6', include: 'values', tableMaxRows: 6, tableMaxCols: 6, maxChars: 5000 });
console.log(check.ndjson);
console.log(`Saved ${outputPath}`);
