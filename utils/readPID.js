'use strict';

const fs = require('fs');


/**
 * Читает pid запущенного процесса из файлаы
 * @param {string} pidPath
 * @return {number|null}
 */
module.exports = (pidPath) => {
    // PID не найден -- значит, процесс не запущен
    if (!fs.existsSync(pidPath)) {
        return null;
    }

    const pid = parseInt(fs.readFileSync(pidPath, 'utf8'), 10);

    // Чтобы случайно не убить ничего системного
    if (isNaN(pid) || pid < 10) {
        return null;
    }

    return pid;
};
