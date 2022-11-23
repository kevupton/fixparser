const globals = require('./../globals');
global.__PACKAGE_VERSION__ = JSON.stringify(globals.packageVersion);
global.__BUILD_TIME__ = JSON.stringify(globals.buildTime);
global.__RELEASE_INFORMATION__ = JSON.stringify(globals.releaseInformation);

require(`${__dirname}/${process.argv[2]}`);
