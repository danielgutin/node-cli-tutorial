const Excel = require('exceljs')
const path = require('path');

module.exports.printHeader = (content) => {
    console.log(`=========================================`)
    console.log(`${content}`)
    console.log(`=========================================`)
}

module.exports.printWeatherResults = (res) => {
    const { observation_time, temperature, weather_descriptions, wind_speed } = res.data.current;
    const { name, country, timezone_id } = res.data.location;
    console.table({
        name,
        country,
        timzone: timezone_id,
        time: observation_time,
        temperature,
        description: weather_descriptions[0],
        wind_speed
    })
}

module.exports.generateExcel = ({ 
    worksheetName, 
    headers, 
    rows, 
    generatedExcelName = new Date().toJSON().slice(0,10).split('-').reverse().join('-'), 
    outputPath = process.cwd() 
}) => {
    // --- creating the workbook & worksheet
    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet(worksheetName);
    // --- creating the header columns
    worksheet.columns = headers;
    
    // Make the header bold.
    // Note: in Excel the rows are 1 based, meaning the first row is 1 instead of 0.
    worksheet.getRow(1).font = {bold: true}

    // --- Dump all the data into Excel
    rows.forEach((dataRow) => {
        worksheet.addRow({ ...dataRow });
    })
    // --- creating the excel file
    workbook.xlsx.writeFile(`${path.resolve(outputPath, generatedExcelName)}.xlsx`)
    .then(() => console.log(`\nExcel file was generated in the following path: ${path.resolve(outputPath, generatedExcelName)}`))
    .catch((err) => console.log('Failed to create the Excel file', err))
}
