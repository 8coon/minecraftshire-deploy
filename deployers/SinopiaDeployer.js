'use strict';

const cp = require('child_process');


/**
 * Лаунчер Sinopia
 * @param config
 * @param params
 * @constructor
 */
function SinopiaDeployer(config, params) {
    // Порядок выполнения методов
    this.order = ['launch'];
}


Object.assign(SinopiaDeployer.prototype, {

    /**
     * Запускаем Sinopia
     */
    launch() {
        console.log('Running Sinopia...');
        const server = cp.spawn('sinopia', [], {detached: true, stdio: 'inherit', shell: true});

        return new Promise(resolve => {
            setTimeout(() => {
                server.unref();
                resolve();
            }, 5000);
        });
    }

});

module.exports = SinopiaDeployer;
