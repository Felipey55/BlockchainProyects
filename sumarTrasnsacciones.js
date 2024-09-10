// Importar la biblioteca fs para manejar archivos y jssha para generar hashes SHA-256
const fs = require('fs');
const SHA256 = require('jssha');

// Función para generar el hash SHA-256
/**
 * Genera un hash SHA-256 para los datos proporcionados.
 * @param {string} data - Datos de entrada en formato de texto.
 * @returns {string} - El hash SHA-256 en formato hexadecimal.
 */
function generateHash(data) {
    const shaObj = new SHA256("SHA-256", "TEXT");
    shaObj.update(data);
    return shaObj.getHash("HEX");
}

// Función para agregar múltiples transacciones al archivo JSON
/**
 * Agrega múltiples transacciones al archivo JSON y actualiza el archivo.
 * @param {Array<number>} transactionsData - Un array de transacciones.
 */
function addTransaction(transactionsData) {
    const filePath = '../BlockChain/transactions.json';

    // Leer el archivo JSON existente
    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        // Parsear el contenido del archivo JSON
        let jsonData = JSON.parse(fileData);

        // Generar los hashes de las nuevas transacciones y agregarlas al array
        transactionsData.forEach(transactionData => {
            const newHash = generateHash(transactionData.toString());
            jsonData.transactions.push({ data: transactionData, hash: newHash });
        });

        // Escribir el archivo JSON actualizado
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir el archivo:', err);
            } else {
                console.log('Nuevas transacciones agregadas con éxito:', transactionsData);
            }
        });
    });
}

// Ejemplo de uso: Agregar múltiples transacciones
addTransaction([70, 20, 35, 90]);

module.exports = { addTransaction };
