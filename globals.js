const pkg = require('./package.json');

const packageVersion = pkg.version.toString().slice();
const buildTime = new Date().toISOString().slice();
const releaseInformation = btoa(Date.now().toString()).slice();

module.exports = {
    packageVersion,
    buildTime,
    releaseInformation,
};
