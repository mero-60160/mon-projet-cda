const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('/Users/atici/projet_cda/docs_livrables/DELPERIE_YANN_dossier_de_projet.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(function(err) {
    console.log("Error:", err);
});
