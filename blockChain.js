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

// Datos de las hojas (puedes agregar o quitar transacciones aquí)
const data = [4, 1, 9, 0, 99, 12, 50,9999];  // Se añadió una nueva transacción

// Verificación de las transacciones con el archivo JSON
fs.readFile('../BlockChain/transactions.json', 'utf8', (err, fileData) => {
    if (err) {
        console.error('Error al leer el archivo:', err);
        return;
    }

    const jsonData = JSON.parse(fileData);

    // Verificar si el número de transacciones coincide
    if (jsonData.transactions.length !== data.length) {
        console.error('Las transacciones no coinciden con las originales. Cantidad de transacciones y/o diferente.');
        return;
    }

    // Generar los hashes de las transacciones originales
    const originalHashes = data.map(item => generateHash(item.toString()));

    // Verificar si los hashes del archivo JSON coinciden con los generados
    const verification = jsonData.transactions.every((transaction, index) => {
        return transaction.hash === originalHashes[index];
    });

    if (!verification) {
        console.error('Las transacciones no coinciden con las originales.');
        return;
    }

    // Si la verificación pasa, continuar con la construcción del árbol de Merkle y demás.
    const leaves = data.map(item => generateHash(item.toString()));

    // Mostrar los hashes de las palabras individuales
    console.log('\n');
    data.forEach((item, index) => {
        console.log(`Hash de "${item}":`, leaves[index]);
    });
    console.log('\n');

    // Construir el árbol de Merkle y obtener la raíz
    const merkleRoot = merkleTree(leaves);
    console.log('\nHash de la raíz del árbol:', merkleRoot);

    // Implementación del Proof of Work
    const difficulty = 5; // Dificultad definida por el número de ceros iniciales
    const prevHash = '000000000000000000000000000000000'; // Hash previo inicial

    // Encontrar el nonce y el hash válido
    const { nonce, hash: blockHash } = proofOfWork(merkleRoot, prevHash, difficulty);
    console.log(`Nonce encontrado: ${nonce}, Hash del bloque: ${blockHash}`);

    // Actualizar el hash previo con el hash del bloque actual
    console.log('El nuevo hash previo es: ', blockHash, '\n');
});

// Función para construir un árbol de Merkle
function merkleTree(leaves) {
    let currentLevel = leaves;

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

        // Imprimir el nivel actual del árbol para seguimiento
        console.log('Nivel actual del árbol:', nextLevel, '\n');
        currentLevel = nextLevel;
    }

    return currentLevel[0];
}

// Función de Proof of Work (PoW)
function proofOfWork(rootHash, previousHash, difficulty) {
    let nonce = 0;
    let hash = generateHash(rootHash + previousHash + nonce);
    const target = '0'.repeat(difficulty);

    while (!hash.startsWith(target)) {
        nonce++;
        hash = generateHash(rootHash + previousHash + nonce);
    }

    return { nonce, hash };
}
