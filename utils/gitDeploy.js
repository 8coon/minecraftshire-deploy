'use strict';

const execSync = require('child_process').execSync;


/**
 * Пушает данный репозиторий в мастер, создаёт от мастера ветку с номером версии
 * @param {string} path
 * @param {string} version
 */
module.exports = (path, version) => {
    execSync(`cd "${path}" && ` +
        `git add * && ` +
        `git commit -m "Version ${version}" && `
        `git push && ` +
        `git checkout -b ${version} && ` +
        `git push -u origin ${version} && ` +
        `git checkout master`
    );
};
