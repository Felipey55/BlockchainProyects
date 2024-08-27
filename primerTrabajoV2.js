const SHA256 = require("jssha");

// Función para generar el hash SHA-256
function generateHash(data) {
    const shaObj = new SHA256("SHA-256", "TEXT");
    shaObj.update(data);
    return shaObj.getHash("HEX");
}

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
                nextLevel.push(currentLevel[i]);
            }
        }

        console.log('Nivel actual del árbol:', nextLevel, '\n');
        currentLevel = nextLevel;
    }

    return currentLevel[0];
}

// Datos de las hojas
const data = ['4 Bitcoins', '1 Bitcoin', '9 Bitcoins', '0 Bitcoins', '99 Bitcoins', '12 Bitcoins'];
const leaves = data.map(item => generateHash(item));

// Mostrar los hashes de las palabras individuales
console.log('\n');
data.forEach((item, index) => {
    console.log(`Hash de "${item}":`, leaves[index]);
});
console.log('\n');

// Construir el árbol de Merkle y obtener la raíz
const merkleRoot = merkleTree(leaves);
console.log('\n');
console.log('Hash de la raíz del árbol:', merkleRoot);

// Implementar el Proof of Work
let prevHash = '000000000000000000000000000000000'; // Hash previo
let nonce = 0;
const difficulty = 6;

while (!generateHash(merkleRoot + prevHash + nonce).startsWith('0'.repeat(difficulty))) nonce++;

const blockHash = generateHash(merkleRoot + prevHash + nonce);
console.log(`Nonce encontrado: ${nonce}, Hash: ${blockHash}`);

// Actualizar el hash previo con el hash del bloque
prevHash = blockHash;
console.log('El nuevo hash previo es: ', prevHash, '\n');
