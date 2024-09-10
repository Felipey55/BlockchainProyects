// Importar la biblioteca fs para manejar archivos y jssha para generar hashes SHA-256
const fs = require('fs');
const SHA256 = require('jssha');

// Función para generar el hash SHA-256
/**
 * Genera un hash SHA-256 para los datos proporcionados.
 * @param {string} data - Datos de entrada en formato de texto.
 * @returns {string} - El hash SHA-256 en formato hexadecimal.
 * 
 * Esta función utiliza la librería 'jssha' para generar un hash de los datos que se le pasan
 * en formato de texto. El hash SHA-256 es una función criptográfica de resumen que se utiliza 
 * para asegurar la integridad de los datos.
 */
function generateHash(data) {
    const shaObj = new SHA256("SHA-256", "TEXT");
    shaObj.update(data);
    return shaObj.getHash("HEX");
}

// Función para guardar el hash del bloque en un archivo JSON
/**
 * Guarda el hash del bloque en un archivo JSON.
 * @param {string} blockHash - El hash del bloque generado.
 * 
 * Esta función toma el hash del bloque generado y lo almacena en un archivo JSON 
 * llamado 'blockHashes.json'. Si el archivo no existe, lo crea y almacena los hashes
 * en un array. Cada hash se guarda con una marca de tiempo (timestamp) que indica 
 * cuándo fue generado.
 */
function saveBlockHash(blockHash) {
    const filePath = '../BlockChain/blockHashes.json';  // Ruta del archivo donde se guardarán los hashes de los bloques

    // Leer el archivo existente o crear uno nuevo si no existe
    fs.readFile(filePath, 'utf8', (err, fileData) => {
        let jsonData;
        if (err) {
            console.log('Archivo no encontrado, creando uno nuevo.');
            jsonData = { hashes: [] };  // Si el archivo no existe, se crea un objeto con un array vacío
        } else {
            jsonData = JSON.parse(fileData);  // Si existe, se parsea el contenido del archivo
        }

        // Agregar el nuevo hash al array con una marca de tiempo
        jsonData.hashes.push({ hash: blockHash, timestamp: new Date().toISOString() });

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

// Datos de las hojas (transacciones)
/**
 * Aquí definimos los datos de las transacciones que serán procesadas. 
 * Cada número en el array representa una transacción, y estos datos serán utilizados 
 * para construir un árbol de Merkle, que garantizará la integridad de las transacciones.
 */
const data = [4, 1, 9, 0, 99, 12, 50];  // Se añadió una nueva transacción

// Verificación de las transacciones con el archivo JSON
/**
 * Esta sección del código lee el archivo JSON que contiene las transacciones y las compara
 * con los datos originales para asegurarse de que no haya discrepancias.
 * 
 * Si el número de transacciones o los hashes no coinciden, se genera un error.
 * Si todo coincide, se procede a generar el árbol de Merkle y realizar la prueba de trabajo (PoW).
 */
fs.readFile('../BlockChain/transactions.json', 'utf8', (err, fileData) => {
    if (err) {
        console.error('Error al leer el archivo:', err);
        return;
    }

    const jsonData = JSON.parse(fileData);

    // Verificar si el número de transacciones coincide
    if (jsonData.transactions.length !== data.length) {
        console.error('Las transacciones no coinciden con las originales. Cantidad de transacciones diferente.');
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

    // Si la verificación pasa, continuar con la construcción del árbol de Merkle
    const leaves = data.map(item => generateHash(item.toString()));

    // Mostrar los hashes de las transacciones individuales
    console.log('\n');
    data.forEach((item, index) => {
        console.log(`Hash de "${item}":`, leaves[index]);
    });
    console.log('\n');

    // Construir el árbol de Merkle y obtener la raíz
    const merkleRoot = merkleTree(leaves);
    console.log('\nHash de la raíz del árbol:', merkleRoot);

    // Implementación del Proof of Work
    const difficulty = 3; // Dificultad definida por el número de ceros iniciales en el hash
    const prevHash = '000000000000000000000000000000000'; // Hash previo inicial

    // Encontrar el nonce y el hash válido
    const { nonce, hash: blockHash } = proofOfWork(merkleRoot, prevHash, difficulty);
    console.log(`Nonce encontrado: ${nonce}\nHash del bloque: ${blockHash}`);

    // Actualizar el hash previo con el hash del bloque actual
    console.log('El nuevo hash previo es: ', blockHash, '\n');

    // Guardar el nuevo hash del bloque en el archivo JSON
    saveBlockHash(blockHash);
});

// Función para construir un árbol de Merkle
/**
 * Construye un árbol de Merkle utilizando los hashes de las hojas (transacciones).
 * @param {string[]} leaves - Los hashes de las hojas del árbol (las transacciones).
 * @returns {string} - El hash raíz del árbol de Merkle.
 * 
 * Un árbol de Merkle es una estructura de datos que permite verificar la integridad de las transacciones
 * de manera eficiente. Combina pares de hashes hasta que se obtiene un único hash, conocido como el
 * hash raíz, que representa todas las transacciones en el bloque.
 */
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

        // Imprimir el nivel actual del árbol para seguimiento
        console.log('Nivel actual del árbol:', nextLevel, '\n');
        currentLevel = nextLevel;
    }

    // Retornar el hash raíz
    return currentLevel[0];
}

// Función de Proof of Work (PoW)
/**
 * Realiza la prueba de trabajo (Proof of Work) para generar un hash válido que cumpla con la dificultad requerida.
 * @param {string} rootHash - El hash raíz del árbol de Merkle.
 * @param {string} previousHash - El hash del bloque anterior.
 * @param {number} difficulty - Número de ceros iniciales requeridos en el hash.
 * @returns {{nonce: number, hash: string}} - El nonce y el hash que cumplen con la dificultad.
 * 
 * La prueba de trabajo (PoW) es un mecanismo utilizado para asegurar que se ha realizado una cantidad significativa
 * de esfuerzo computacional antes de aceptar un nuevo bloque en la cadena. En este caso, la función busca un hash
 * que comience con un número específico de ceros (definido por la dificultad) ajustando el valor del nonce.
 */
function proofOfWork(rootHash, previousHash, difficulty) {
    let nonce = 0;
    let hash = generateHash(rootHash + previousHash + nonce);
    const target = '0'.repeat(difficulty);

    // Incrementar el nonce hasta encontrar un hash que comience con el número adecuado de ceros
    while (!hash.startsWith(target)) {
        nonce++;
        hash = generateHash(rootHash + previousHash + nonce);
    }

    // Retornar el nonce y el hash encontrado
    return { nonce, hash };
}
