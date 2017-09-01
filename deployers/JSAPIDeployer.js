'use strict';

const execSync = require('child_process').execSync;


/**
 * Паблишер JS API
 * @param config
 * @param params
 * @constructor
 */
function JSAPIDeployer(config, params) {
    this.config = config;
    this.workspacePath = params.jenkinsWorkspacePath;

    // Порядок выполнения методов
    this.order = ['publish'];
}


Object.assign(JSAPIDeployer.prototype, {

    /**
     * Меняем версию пакета, публикуем его, сбрасываем изменения
     */
    publish() {
    },

});

module.exports = JSAPIDeployer;
