'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;
const mkdirs = require('mkdirs');
const https = require('https');
const rmdir = require('rmdir');


/**
 * Установщик панели управления
 * @param config
 * @param params
 * @constructor
 */
function PanelDeployer(config, params) {
    this.panelPath = config.panel_Path;
    this.workspacePath = params.jenkinsWorkspacePath;

    // Порядок выполнения методов
    this.order = ['install'];
}


Object.assign(PanelDeployer.prototype, {

    /**
     * Удаляем старую панель, копируем ту, что собрал Jenkins
     */
    install() {
        execSync(`rm -rf "${this.panelPath}"`);
        execSync(`cp -R "${this.workspacePath}/build/" "${this.panelPath}"`);
    }

});

module.exports = PanelDeployer;
