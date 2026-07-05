const xlsx = require('xlsx');
const fs = require('fs');

const primaryWb = xlsx.readFile('C:/Users/user-pc/Desktop/Dad\'s Project/Knowledgebase/Aquarium App Species.xlsx');
const primarySheet = primaryWb.Sheets[primaryWb.SheetNames[0]];
const primaryData = xlsx.utils.sheet_to_json(primarySheet);

const fallbackWb = xlsx.readFile('C:/Users/user-pc/Desktop/Dad\'s Project/Knowledgebase/Aquairist App Data set.xlsx');
const fallbackSheet = fallbackWb.Sheets[fallbackWb.SheetNames[0]];
const fallbackData = xlsx.utils.sheet_to_json(fallbackSheet);

const speciesMap = new Map();

// 1. Ingest fallback to get tank_environment
fallbackData.forEach(row => {
  const sciName = row['scientific_name'] || row['Scientific Name'];
  if (!sciName) return;
  // Infer tank_environment
  let env = 'freshwater';
  const group = (row['category_group'] || row['Group'] || '').toLowerCase();
  if (group.includes('marine') || group.includes('salt')) env = 'marine';
  else if (group.includes('brackish')) env = 'brackish';
  
  speciesMap.set(sciName.trim(), { tank_environment: env });
});

// 2. Primary ingestion
primaryData.forEach(row => {
  const sciName = row['scientific_name'] || row['Scientific Name'];
  const commonName = row['common_name'] || row['Common Name'];
  if (!sciName || !commonName) return;

  const key = sciName.trim();
  const existing = speciesMap.get(key) || { tank_environment: 'freshwater' };

  speciesMap.set(key, {
    common_name: commonName,
    scientific_name: key,
    tank_environment: existing.tank_environment,
    mismatch_risk: row['mismatch_risk_if_not_included'] || row['Mismatch Risk'] || null,
    mismatch_notes: row['reason_for_inclusion'] || row['Reason for Inclusion'] || null
  });
});

let sql = `TRUNCATE TABLE public.species_dictionary;\n`;
for (const [sciName, data] of speciesMap.entries()) {
  if (!data.common_name) continue; 
  sql += `INSERT INTO public.species_dictionary (common_name, scientific_name, tank_environment, mismatch_risk, mismatch_notes) VALUES (
    '${data.common_name.replace(/'/g, "''")}',
    '${data.scientific_name.replace(/'/g, "''")}',
    '${data.tank_environment.replace(/'/g, "''")}',
    ${data.mismatch_risk ? `'${data.mismatch_risk.replace(/'/g, "''")}'` : 'NULL'},
    ${data.mismatch_notes ? `'${data.mismatch_notes.replace(/'/g, "''")}'` : 'NULL'}
  );\n`;
}

fs.writeFileSync('supabase/migrations/seed_data.sql', sql);
console.log('Generated supabase/migrations/seed_data.sql with ' + speciesMap.size + ' entries');
