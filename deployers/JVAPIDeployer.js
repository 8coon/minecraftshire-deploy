'use strict';

const execSync = require('child_process').execSync;


/**
 * Паблишер JV API
 * @param config
 * @param params
 * @constructor
 */
function JVAPIDeployer(config, params) {
    this.config = config;
    this.workspacePath = params.jenkinsWorkspacePath;
    this.mavenPath = config.maven_Path;

    // Порядок выполнения методов
    this.order = ['copy'];
}


Object.assign(JVAPIDeployer.prototype, {

    copy() {
        const srcRepo = `${this.workspacePath}/target/mvn-repo`;
        const dstRepo = this.mavenPath;

        execSync(`rsync -a "${dstRepo}" "${srcRepo}"`);
    },

});

module.exports = JVAPIDeployer;
