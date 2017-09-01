'use strict';

const execSync = require('child_process').execSync;


/**
 * Паблишер JS Utils
 * @param config
 * @param params
 * @constructor
 */
function JSUtilsDeployer(config, params) {
    this.config = config;
    this.workspacePath = params.jenkinsWorkspacePath;

    // Порядок выполнения методов
    this.order = ['publish'];
}


Object.assign(JSUtilsDeployer.prototype, {

    /**
     * Меняем версию пакета, публикуем его, сбрасываем изменения
     */
    publish() {
    },

});

module.exports = JSUtilsDeployer;
