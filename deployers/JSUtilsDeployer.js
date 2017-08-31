'use strict';

const execSync = require('child_process').execSync;

// Утилиты
const incVersion = require('../utils/incVersion');


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
        incVersion(this.config, `${this.workspacePath}/package.json`);
        execSync(`cd "${this.workspacePath}" && npm publish && git reset --hard`);
    },

});

module.exports = JSUtilsDeployer;
