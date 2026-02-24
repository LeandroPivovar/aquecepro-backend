const xlsx = require('xlsx');
const fs = require('fs');
try {
    const wb = xlsx.readFile('C:\\Users\\Usuario\\Documents\\code\\aquecepro\\CADASTRO PRODUTO.xlsx');
    const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
} catch (e) {
    console.error(e.message);
}
