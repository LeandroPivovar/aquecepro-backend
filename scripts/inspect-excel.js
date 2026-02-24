const XLSX = require('xlsx');

const workbook = XLSX.readFile("../Planiliha de dimensionamento - Thais Zani 01.xlsx");
const sheetName = 'DadosClimaticos';
const sheet = workbook.Sheets[sheetName];

const data = XLSX.utils.sheet_to_json(sheet);
console.log("Keys of row 1:");
console.log(Object.keys(data[0]));
