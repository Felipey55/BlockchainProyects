// Importar la biblioteca fs para manejar archivos y jssha para generar hashes SHA-256
const fs = require('fs'); // fs permite manejar la lectura y escritura de archivos en el sistema de archivos.
const SHA256 = require('jssha'); // jssha es una librería para generar hashes SHA-256, útil para asegurar la integridad de los datos.

// Función para generar el hash SHA-256
/**
 * Genera un hash SHA-256 para los datos proporcionados.
 * @param {string} data - Datos de entrada en formato de texto.
 * @returns {string} - El hash SHA-256 en formato hexadecimal.
 * 
 * Esta función utiliza el algoritmo criptográfico SHA-256 para generar un hash a partir de una cadena de texto.
 * Es especialmente útil en aplicaciones de blockchain, donde los hashes se utilizan para garantizar la integridad de las transacciones.
 */
function generateHash(data) {
    const shaObj = new SHA256("SHA-256", "TEXT");  // Crear un nuevo objeto SHA-256 con formato de texto.
    shaObj.update(data);  // Actualizar el objeto con los datos proporcionados.
    return shaObj.getHash("HEX");  // Obtener el hash generado en formato hexadecimal.
}

// Función para agregar múltiples transacciones al archivo JSON
/**
 * Agrega múltiples transacciones al archivo JSON y actualiza el archivo.
 * @param {Array<Object>} transactionsData - Un array de objetos que contienen las transacciones con las claves 'from', 'to', 'amount'.
 * 
 * Esta función toma un array de objetos que representan transacciones y las agrega a un archivo JSON. 
 * Cada transacción incluye los campos 'from', 'to' y 'amount', y es hasheada usando SHA-256 antes de ser almacenada en el archivo.
 * La función lee el archivo, actualiza el contenido con las nuevas transacciones y luego guarda el archivo actualizado.
 */
function addTransaction(transactionsData) {
    const filePath = '../BlockChain/transactions.json';  // Ruta del archivo JSON donde se almacenan las transacciones.

    // Leer el archivo JSON existente
    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
            console.error('Error al leer el archivo:', err);  // Si hay un error al leer el archivo, mostrar un mensaje de error.
            return;
        }

        // Parsear el contenido del archivo JSON
        let jsonData = JSON.parse(fileData);  // Convertir el contenido JSON del archivo en un objeto JavaScript.

        // Generar los hashes de las nuevas transacciones y agregarlas al array
        transactionsData.forEach(transactionData => {
            // Generar una cadena JSON ordenada y convertirla a texto para el hash
            const transactionString = JSON.stringify({
                from: transactionData.from,
                to: transactionData.to,
                amount: transactionData.amount
            });
            
            const newHash = generateHash(transactionString);  // Generar un hash para cada transacción.
            
            // Agregar la transacción completa con 'from', 'to', 'amount', y el hash generado
            jsonData.transactions.push({
                from: transactionData.from,
                to: transactionData.to,
                amount: transactionData.amount,
                hash: newHash
            });
        });

        // Escribir el archivo JSON actualizado
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir el archivo:', err);  // Si hay un error al escribir en el archivo, mostrar un mensaje de error.
            } else {
                console.log('Nuevas transacciones agregadas con éxito:', transactionsData);  // Mensaje que indica que las transacciones fueron agregadas exitosamente.
            }
        });
    });
}

// Ejemplo de uso: Agregar múltiples transacciones
/**
 * Ejemplo que demuestra cómo agregar múltiples transacciones con los campos 'from', 'to', y 'amount'.
 * Este bloque de código llama a la función addTransaction, proporcionando un array de transacciones.
 */
addTransaction([
    { from: 'Irene', to: 'Jack', amount: 10 },
    { from: 'Carlos', to: 'David', amount: 25 },
    { from: 'Alice', to: 'Bob', amount: 50 }
]);

// Exportar la función para poder usarla en otros módulos
/**
 * Exportamos la función addTransaction para que pueda ser utilizada en otros archivos de código.
 */
module.exports = { addTransaction };
