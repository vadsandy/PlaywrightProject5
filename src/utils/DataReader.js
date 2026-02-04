const mssql = require('mssql');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
require('dotenv').config();

class DataReader {
    static async getJsonData(filePath, key) {
        const fullpath = path.resolve(filePath);
        const data = JSON.parse(fs.readFileSync(fullpath, 'utf-8'));
        return data[key];
    }

    static async getExcelData(filePath, sheetName, key) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(path.resolve(filePath));
        //use sheet name passed from the feature file
        const sheet = workbook.getWorksheet(sheetName);

        if(!sheet) {
            throw new Error(`Sheet "${sheetName}" not found in "${filePath}"`);    
        }

        let result = {};
        let keyColIndex = -1;
        const headerRow = sheet.getRow(1); // Added this missing line
        //Find the column where the header is key
        headerRow.eachCell((cell, colNumber) => {
            if (cell.value && cell.value.toString().toLowerCase() === "key") {
                keyColIndex = colNumber;
            }
        });

        if (keyColIndex === -1) {
            throw new Error(`Could not find column named "key" in sheet "${sheetName}"`);
        }

        //Find the row where our column mataches our specific key
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { //skip header row
                if (row.getCell(keyColIndex).value == key) {
                    // Map headers to result object dynamically
                    headerRow.eachCell((headerCell, colNumber) => {
                        const headerName = headerCell.value.toString();
                        result[headerName] = row.getCell(colNumber).value;
                    });
                }
            }
        });

        if (!Object.keys(result).length) {
            throw new Error(`Data for key "${key}" not found in sheet "${sheetName}"`);
        }
        return result;

    }

    static async getSqlData(query) {
        const config = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER || 'localhost',
            database: process.env.DB_NAME || 'PlaywrightTestData',
            port: parseInt(process.env.DB_PORT) || 1433,
            options: {
                encrypt: false, 
                trustServerCertificate: true,
                instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS'
            }
        };
        // This log is vital for debugging!
        console.log(`DB Connection: User=${config.user}, Server=${config.server}, Instance=${config.options.instanceName}`);
        
        const pool = await mssql.connect(config);
        const result = await pool.request().query(query);
        await pool.close();
        return result.recordset[0];
    }
}

module.exports = {DataReader};