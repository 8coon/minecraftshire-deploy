'use strict';

const execSync = require('child_process').execSync;
const fs = require('fs');


/**
 * Пушает данный репозиторий в мастер, создаёт от мастера ветку с номером версии
 * @param {string} path
 * @param {string} version
 */
module.exports = (path, version) => {
    const pkg = JSON.parse(fs.readFileSync(`${path}/package.json`, 'utf8'));
    pkg.version = version;
    fs.writeFileSync(`${path}/package.json`, JSON.stringify(pkg), 'utf8');

    execSync(`cd "${path}" && ` +
        `git add * && ` +
        `git commit -m "Version ${version}" && ` +
        `git push && ` +
        `git checkout -b ${version} && ` +
        `git push -u origin ${version} && ` +
        `git checkout master`
    );
};
