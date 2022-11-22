process.env.__RELEASE_INFORMATION__ = btoa(Date.now().toString());
require(`${__dirname}/${process.argv[2]}`);
