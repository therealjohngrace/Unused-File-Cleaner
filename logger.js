
const fs = require('fs');

const logFile = 'deletion-history.txt';

function logDeletion(filePath) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Deleted: ${filePath}\n`;

    // Appends to the .txt file (creates it automatically if it doesn't exist)
    fs.appendFileSync(logFile, logEntry, 'utf8');
}

module.exports = { logDeletion };
// logger.js
const fs = require('fs');

const logFile = 'deletion-history.txt'; 

function logDeletion(filePath) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Deleted: ${filePath}\n`;

    // It uses the name you set above to know where to write the data
    fs.appendFileSync(logFile, logEntry, 'utf8');
}

module.exports = { logDeletion };