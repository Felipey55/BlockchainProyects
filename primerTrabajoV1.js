const SHA256 = require("jssha");  

//Primera parte del arbol
const shaObj0 = new SHA256("SHA-256", "TEXT"); 
const shaObj1 = new SHA256("SHA-256", "TEXT"); 
const shaObj01 = new SHA256("SHA-256", "TEXT");

//Segunda parte del arbol
const shaObj2 = new SHA256("SHA-256", "TEXT");
const shaObj3 = new SHA256("SHA-256", "TEXT");
const shaObj23 = new SHA256("SHA-256", "TEXT");

shaObj0.update('hola');  
shaObj1.update('chao'); 
shaObj2.update('carlos'); 
shaObj3.update('felipe'); 



//Primera parte del arbol
const hash0 = shaObj0.getHash("HEX");  
console.log('Primer hash de la palabra "hola": ',hash0);  

const hash1 = shaObj1.getHash("HEX");  
console.log('Segundo hash de la palabra "chao": ',hash1);  

hash01 = hash0 + hash1

shaObj01.update(hash01);
const hash_01 = shaObj01.getHash("HEX");
console.log('Hash de las palabras "hola y chao": ',hash_01);


//Segunda parte del arbol
const hash2 = shaObj2.getHash("HEX");  
console.log('Tercer hash de la palabra "carlos": ',hash2);  

const hash3 = shaObj3.getHash("HEX");  
console.log('Cuarto hash de la palabra "felipe": ',hash3);  

hash23 = hash2 + hash3

shaObj23.update(hash23);
const hash_23 = shaObj23.getHash("HEX");
console.log('Hash de las palabras "carlos y felipe": ',hash_23);


//Punta del arbol
const shaObjMerkleRoot = new SHA256("SHA-256", "TEXT");
merkleRoot = hash_01 + hash_23

shaObjMerkleRoot.update(merkleRoot);
const merkle_Root_Final = shaObjMerkleRoot.getHash("HEX");
console.log('Hash de la raíz del arbol:',merkle_Root_Final);

//Block Hash
let prevHash = '000000000000000000000000000000000'
let nonce = 123456

const shaObjBlockHash = new SHA256("SHA-256", "TEXT");
blockHash = merkle_Root_Final + prevHash + nonce

shaObjBlockHash.update(blockHash);
const block = shaObjBlockHash.getHash("HEX");
console.log('El hash de todo el bloque es: ',block);


