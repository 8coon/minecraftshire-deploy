'use strict';

const execSync = require('child_process').execSync;


/**
 * Паблишер Kaibito Workers
 * @param config
 * @param params
 * @constructor
 */
function WorkersDeployer(config, params) {
    this.config = config;
    this.workspacePath = params.jenkinsWorkspacePath;
    this.mavenPath = config.maven_Path;

    // Порядок выполнения методов
    this.order = ['copy'];
}


Object.assign(WorkersDeployer.prototype, {

    copy() {
        const srcRepo = `${this.workspacePath}/target/mvn-repo`;
        const dstRepo = this.mavenPath;

        console.log(`Copying "${srcRepo}" to "${dstRepo}"...`);
        execSync(`rsync -a "${srcRepo}/" "${dstRepo}/"`);
    },

});

module.exports = WorkersDeployer;
