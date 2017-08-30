'use strict';

const fs = require('fs');
const cp = require('child_process');

// Утилиты
const readPID = require('../utils/readPID');


/**
 * Лаунчер Sinopia
 * @param config
 * @param params
 * @constructor
 */
function SinopiaDeployer(config, params) {
    this.pidPath = `${config.sinopia_Path}/sinopia.pid`;

    // Порядок выполнения методов
    this.order = ['stop', 'start'];
}


Object.assign(SinopiaDeployer.prototype, {

    /**
     * Останавливаем Sinopia
     */
    stop() {
        const pid = readPID(this.pidPath);
        if (!pid) return;

        try {
            process.kill(pid);
        } catch (e) {
            console.log('Unable to kill', pid);
            console.log('Is it still running?');
        }
    },

    /**
     * Запускаем Sinopia
     */
    start() {
        console.log('Running Sinopia...');
        const sinopia = cp.spawn('sinopia', [], {detached: true, stdio: 'inherit', shell: true});

        // Запишем pid в файл
        fs.writeFileSync(this.pidPath, sinopia.pid, 'utf8');

        return new Promise(resolve => {
            setTimeout(() => {
                server.unref();
                resolve();
            }, 5000);
        });
    }

});

module.exports = SinopiaDeployer;
