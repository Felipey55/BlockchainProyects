const SHA256 = require("jssha");

// Función para generar el hash SHA-256
/**
 * Genera un hash SHA-256 a partir de un dato proporcionado.
 */
function generateHash(data) {
    const shaObj = new SHA256("SHA-256", "TEXT"); // Crea un nuevo objeto SHA-256
    shaObj.update(data); // Actualiza el objeto SHA-256 con el dato
    return shaObj.getHash("HEX"); // Retorna el hash en formato hexadecimal
}

// Función para construir un árbol de Merkle
/**
 * Construye un árbol de Merkle a partir de una lista de hashes de hojas.
 */
function merkleTree(leaves) {
    let currentLevel = leaves; // Inicializa el nivel actual con las hojas

    // Mientras haya más de un hash en el nivel actual
    while (currentLevel.length > 1) {
        let nextLevel = []; // Lista para almacenar los hashes del siguiente nivel

        for (let i = 0; i < currentLevel.length; i += 2) {
            if (i + 1 < currentLevel.length) {
                // Combina dos hashes adyacentes y crea el hash padre
                const combinedHash = generateHash(currentLevel[i] + currentLevel[i + 1]);
                nextLevel.push(combinedHash); // Añade el hash padre al siguiente nivel
            } else {
                // Si hay un hash sin pareja, se sube solo al siguiente nivel
                nextLevel.push(currentLevel[i]);
            }
        }

        // Muestra el nivel actual del árbol
        console.log('Nivel actual del árbol:', nextLevel);


        // Actualiza el nivel actual al siguiente nivel
        currentLevel = nextLevel;
    }

    // El último hash en el nivel es la raíz de Merkle
    return currentLevel[0];
}

// Datos de las hojas
const data = ['4 Bitcoins', '1 Bitcoin', '9 Bitcoins', '0 Bitcoins']; // Array de datos de entrada
const leaves = data.map(item => generateHash(item)); // Genera los hashes para cada dato

// Mostrar los hashes de las palabras individuales
data.forEach((item, index) => {
    console.log(`Hash de "${item}":`, leaves[index]);
});

// Construir el árbol de Merkle y obtener la raíz
const merkleRoot = merkleTree(leaves);
console.log('Hash de la raíz del árbol:', merkleRoot);

// Calcular el hash de todo el bloque
let prevHash = '000000000000000000000000000000000'; // Hash previo (para simular bloques encadenados)
let nonce = 123456; // Nonce utilizado en la minería (valor arbitrario)
const blockHash = generateHash(merkleRoot + prevHash + nonce);
console.log('El hash de todo el bloque es:', blockHash);

// Volver el hash de todo el bloque el nuevo prevHash o el hash previo
prevHash = blockHash
console.log('El nuevo hash previo es: ',prevHash);
