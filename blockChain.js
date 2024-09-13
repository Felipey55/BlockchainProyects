// Importar la biblioteca fs para manejar archivos y jssha para generar hashes SHA-256
const fs = require('fs');
const SHA256 = require('jssha');

// Función para generar el hash SHA-256
function generateHash(data) {
    const shaObj = new SHA256("SHA-256", "TEXT");
    shaObj.update(data);
    return shaObj.getHash("HEX");
}

// Función para ordenar y convertir a JSON string
function sortedStringify(obj) {
    const sortedObj = {};
    Object.keys(obj).sort().forEach(key => {
        sortedObj[key] = obj[key];
    });
    return JSON.stringify(sortedObj);
}

// Función para obtener la hora local en formato ISO
function getLocalTime() {
    const date = new Date();
    return date.toLocaleString('sv-SE', { timeZoneName: 'short' }).replace(' ', 'T');
}

// Función para guardar el hash del bloque en un archivo JSON
function saveBlockHash(blockHash) {
    const filePath = './blockHashes.json';  // Ruta del archivo donde se guardarán los hashes de los bloques

    fs.readFile(filePath, 'utf8', (err, fileData) => {
        let jsonData;
        if (err) {
            console.log('Archivo no encontrado, creando uno nuevo.');
            jsonData = { hashes: [] };  // Si el archivo no existe, se crea un objeto con un array vacío
        } else {
            jsonData = JSON.parse(fileData);  // Si existe, se parsea el contenido del archivo
        }

        // Agregar el nuevo hash al array con la hora local en vez de UTC
        jsonData.hashes.push({ hash: blockHash, timestamp: getLocalTime() });

        // Escribir el archivo actualizado con los nuevos datos
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir el archivo:', err);
            } else {
                console.log('Hash del bloque guardado con éxito:', blockHash);
            }
        });
    });
}

// Datos de las transacciones a verificar
const transactionsToVerify = [
    { from: 'Ana', to: 'Sara', amount: 99 },
    { from: 'Juan', to: 'Pedro', amount: 12 },
    { from: 'Alice', to: 'Bob', amount: 4 },
    { from: 'Carlos', to: 'David', amount: 1 },
    { from: 'Elena', to: 'Fernando', amount: 9 },
    { from: 'Gina', to: 'Harry', amount: 6 },
    { from: 'Irene', to: 'Jack', amount: 50 },
];

// Verificación de la existencia de las transacciones en el archivo JSON
fs.readFile('./transactions.json', 'utf8', (err, fileData) => {
    if (err) {
        console.error('Error al leer el archivo:', err);
        return;
    }

    const jsonData = JSON.parse(fileData);
    const leaves = [];
    let allTransactionsExist = true; // Variable para controlar si todas las transacciones están presentes

    // Verificar si cada transacción que queremos verificar está presente
    transactionsToVerify.forEach(transaction => {
        const transactionHash = generateHash(sortedStringify(transaction));

        console.log(`Hash generado para la transacción de ${transaction.from} a ${transaction.to}: ${transactionHash}`);

        // Verificar si la transacción existe en el archivo
        const transactionExists = jsonData.transactions.some(storedTransaction => {
            return storedTransaction.hash === transactionHash;
        });

        if (transactionExists) {
            console.log(`La transacción de ${transaction.from} a ${transaction.to} de ${transaction.amount} BTC está presente.`);
            leaves.push(transactionHash);  // Solo agregar el hash si la transacción está presente
        } else {
            console.log(`La transacción de ${transaction.from} a ${transaction.to} de ${transaction.amount} BTC NO está presente.`);
            allTransactionsExist = false;  // Marcar como falso si alguna transacción no está presente
        }
    });

    // Si todas las transacciones están presentes, construir el árbol de Merkle y continuar con el PoW
    if (allTransactionsExist) {
        const merkleRoot = merkleTree(leaves);
        console.log('\nHash raíz del Árbol de Merkle:', merkleRoot);

        // Realizar el Proof of Work
        const difficulty = 3;  // Definir la dificultad del PoW (número de ceros iniciales)
        const prevHash = '000000000000000000000000000000000';  // Hash previo (simulado)
        const { nonce, hash: blockHash } = proofOfWork(merkleRoot, prevHash, difficulty);

        console.log(`Nonce encontrado: ${nonce}`);
        console.log(`Hash final del bloque: ${blockHash}`);

        // Guardar el nuevo hash del bloque en el archivo JSON
        saveBlockHash(blockHash);
    } else {
        console.log('El árbol de Merkle no se construyó porque algunas transacciones no están presentes.');
    }
});

// Función para construir un árbol de Merkle
function merkleTree(leaves) {
    let currentLevel = leaves;

    // Combinar hashes en pares hasta llegar a la raíz del árbol
    while (currentLevel.length > 1) {
        let nextLevel = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            if (i + 1 < currentLevel.length) {
                const combinedHash = generateHash(currentLevel[i] + currentLevel[i + 1]);
                nextLevel.push(combinedHash);
            } else {
                // Si hay un número impar de hojas, pasar el último hash sin combinar
                nextLevel.push(currentLevel[i]);
            }
        }

        console.log('Nivel actual del árbol de Merkle:', nextLevel);
        currentLevel = nextLevel;
    }

    // Retornar el hash raíz
    return currentLevel[0];
}

// Función de Proof of Work (PoW)
function proofOfWork(rootHash, previousHash, difficulty) {
    let nonce = 0;
    let hash = generateHash(rootHash + previousHash + nonce);
    const target = '0'.repeat(difficulty);

    // Incrementar el nonce hasta encontrar un hash que comience con el número adecuado de ceros
    while (!hash.startsWith(target)) {
        nonce++;
        hash = generateHash(rootHash + previousHash + nonce);
    }

    return { nonce, hash };
}
