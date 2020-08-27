const forge = require('node-forge');
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$%^&*";
const rand = () => {
    return Math.floor(Math.random() * (chars.length -1))
};
let digest = forge.md.sha1.create();
module.exports.generateString = () => {
    let generated  = "#", i = 0;
    while(++i < 16) {
        generated += chars[rand()];
    }
    return generated;
}

module.exports.hash = (string) => {
    digest.update(string);
    return digest.digest().toHex();
}