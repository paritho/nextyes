const forge = require('node-forge');
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@$%^&*";
const rand = () => {
    return Math.floor(Math.random() * (chars.length -1))
};

module.exports.salt = () => {
    let generated  = "#", i = 0;
    while(++i < 16) {
        generated += chars[rand()];
    }
    return generated;
}

module.exports.hasher = (str) => {
    const digest = forge.md.sha1.create();
    digest.update(str);
    return digest.digest().toHex();
}

module.exports.shaHash = (str) => {
    const digest = forge.md.sha256.create();
    digest.update(str);
    return digest.digest().toHex();
}