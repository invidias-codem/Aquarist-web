import * as xlsx from 'xlsx';
import fs from 'fs';

function dumpHeaders(filePath) {
  try {
    const wb = xlsx.readFile(filePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const headers = xlsx.utils.sheet_to_json(sheet, {header: 1})[0];
    console.log(`\nHeaders for ${filePath}:`);
    console.log(headers);
  } catch(e) {
    console.error(e.message);
  }
}

dumpHeaders('C:/Users/user-pc/Desktop/Dad\'s Project/Knowledgebase/Aquarium App Species.xlsx');
dumpHeaders('C:/Users/user-pc/Desktop/Dad\'s Project/Knowledgebase/Aquairist App Data set.xlsx');
