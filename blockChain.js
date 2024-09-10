const fs = require('fs');
const SHA256 = require('jssha');

// Función para generar el hash SHA-256
function generateHash(data) {
    const shaObj = new SHA256("SHA-256", "TEXT");
    shaObj.update(data);
    return shaObj.getHash("HEX");
}

// Función de Proof of Work (PoW)
/**
 * Realiza el algoritmo de prueba de trabajo para un bloque.
 * @param {string} rootHash - Hash raíz del árbol de Merkle.
 * @param {string} previousHash - Hash del bloque anterior.
 * @param {number} difficulty - Número de ceros iniciales que debe tener el hash válido.
 * @returns {{nonce: number, hash: string}} - Retorna el nonce y el hash del bloque válido.
 */
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

// Función para construir un árbol de Merkle y mostrar los niveles
function merkleTree(leaves) {
    let currentLevel = leaves;

    while (currentLevel.length > 1) {
        let nextLevel = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            if (i + 1 < currentLevel.length) {
                const combinedHash = generateHash(currentLevel[i] + currentLevel[i + 1]);
                nextLevel.push(combinedHash);
            } else {
                nextLevel.push(currentLevel[i]);
            }
        }

        // Imprimir el nivel actual del árbol
        console.log('Nivel actual del árbol de Merkle:', nextLevel, '\n');
        currentLevel = nextLevel;
    }

    return currentLevel[0];
}

// Validar una transacción
function validateTransaction(transaction) {
    if (!transaction.from || !transaction.to || !transaction.amount) {
        return false;
    }
    return true;
}

// Validar todas las transacciones del bloque
function validateBlockTransactions(transactions) {
    for (let tx of transactions) {
        if (!validateTransaction(tx)) {
            return false;
        }
    }
    return true;
}

// Crear el bloque génesis y mostrar el árbol de Merkle
function createGenesisBlock() {
    const genesisTransactions = [{
        from: 'coinbase',
        to: 'miner1',
        amount: 50
    }];

    const leaves = genesisTransactions.map(tx => generateHash(JSON.stringify(tx)));

    // Mostrar los hashes individuales de las transacciones
    console.log('Transacciones en el bloque génesis:');
    genesisTransactions.forEach((tx, index) => {
        console.log(`Transacción: ${JSON.stringify(tx)}, Hash: ${leaves[index]}`);
    });

    // Generar y mostrar el árbol de Merkle
    const merkleRoot = merkleTree(leaves);

    // Prueba de trabajo para el bloque génesis
    const { nonce, hash } = proofOfWork(merkleRoot, '000000000000000000000000000000000', 3);

    return {
        previousHash: '000000000000000000000000000000000',
        merkleRoot,
        nonce,
        hash,
        transactions: genesisTransactions
    };
}

// Crear un nuevo bloque basado en transacciones
function createNewBlock(previousBlock, transactions, difficulty) {
    if (!validateBlockTransactions(transactions)) {
        console.error('Error: Las transacciones no son válidas.');
        return;
    }

    const leaves = transactions.map(tx => generateHash(JSON.stringify(tx)));
    const merkleRoot = merkleTree(leaves);

    // Prueba de trabajo para el nuevo bloque
    const { nonce, hash } = proofOfWork(merkleRoot, previousBlock.hash, difficulty);

    return {
        previousHash: previousBlock.hash,
        merkleRoot,
        nonce,
        hash,
        transactions
    };
}

// Leer transacciones del archivo JSON
fs.readFile('../BlockChain/transactions.json', 'utf8', (err, fileData) => {
    if (err) {
        console.error('Error al leer el archivo:', err);
        return;
    }

    const jsonData = JSON.parse(fileData);
    const data = [4, 1, 9, 0, 99, 12, 50];

    if (jsonData.transactions.length !== data.length) {
        console.error('Las transacciones no coinciden con las originales. Cantidad de transacciones diferente.');
        return;
    }

    const originalHashes = data.map(item => generateHash(item.toString()));
    const verification = jsonData.transactions.every((transaction, index) => {
        return transaction.hash === originalHashes[index];
    });

    if (!verification) {
        console.error('Las transacciones no coinciden con las originales.');
        return;
    }

    // Crear bloque génesis
    const genesisBlock = createGenesisBlock();
    console.log("Bloque génesis creado: ", genesisBlock);

    // Crear un nuevo bloque con transacciones
    const newTransactions = [
        { from: 'user1', to: 'user2', amount: 100 },
        { from: 'user2', to: 'user3', amount: 50 },
        { from: 'coinbase', to: 'miner1', amount: 50 } // Transacción Coinbase
    ];

    const newBlock = createNewBlock(genesisBlock, newTransactions, 3);
    console.log("Nuevo bloque creado: ", newBlock);
});
