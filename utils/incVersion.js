'use strict';

const fs = require('fs');


const parseVersion = (str) => {
    str = str.split('.');

    return {
        major: parseInt(str[0], 10),
        minor: parseInt(str[1], 10) || 0,
        build: parseInt(str[2], 10) || 0,
    }
};

const serializeVersion = (version) => {
    return `${version.major}.${version.minor}.${version.build}`;
};


/**
 * Увеличивает версию пакета.
 * Версия пакета указывается, как major.minor.$, где $ увеличивается автоматически.
 * При увеличении major или minor $ сбрасывается в 0.
 * @param {config} config
 * @param {string} packagePath путь до package.json
 */
module.exports = (config, packagePath) => {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const name = pkg.name;
    const version = pkg.version || '0.0.$';

    // Читаем файл с прошлыми версиями пакетов
    let versions = {};
    if (fs.existsSync(config.version_Path)) {
        versions = JSON.parse(fs.readFileSync(config.version_Path, 'utf8'));
    }

    versions[name] = versions[name] || version.replace('$', '0');

    const cached = parseVersion(versions[name]);
    const built = parseVersion(version.replace('$', '0'));

    if (cached.major === built.major && cached.minor === built.minor) {
        cached.build++;
    } else {
        cached.major = built.major;
        cached.minor = built.minor;
        cached.build = 0;
    }

    versions[name] = serializeVersion(cached);
    pkg.version = versions[name];

    fs.writeFileSync(packagePath, JSON.stringify(pkg), 'utf8');
    fs.writeFileSync(config.version_Path, JSON.stringify(versions), 'utf8');
};
