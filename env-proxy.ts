import pkg from './package.json';
export var process = {
    env: new Proxy({
        __PACKAGE_VERSION__: JSON.stringify(pkg.version),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        __RELEASE_INFORMATION__: JSON.stringify(btoa(Date.now().toString())),
    }, {
        get: (target, property) => property in target ? target[property as keyof typeof target] : '',
    })
}