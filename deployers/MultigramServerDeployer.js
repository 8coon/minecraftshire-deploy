'use strict';

const fs = require('fs');
const cp = require('child_process');
const rmdir = require('rmdir');
const mkdirs = require('mkdirs');
const execSync = require('child_process').execSync;
const https = require('https');
const http = require('http');

// Утилиты
const readPID = require('../utils/readPID');


/**
 * Может перезапускать сервер API и создавать симлинк на него
 * @param config
 * @param {{jenkinsWorkspacePath: string, secretToken: string}} params
 * @constructor
 */
function MultigramServerDeployer(config, params) {
    this.sourcePath = params.jenkinsWorkspacePath;
    this.targetPath = config.multigramServer_Path;
    this.logsPath = config.multigramServer_Logs;
    this.pidPath = `${this.targetPath}/server.pid`;

    this.branch = params.jenkinsBranchName;
    this.branch = (this.branch || 'master').split('/')[1] || this.branch || 'master';

    this.jarCommand = `(java -Xms16M -Xmx170M ` +
            `-jar "${this.sourcePath}/target/server.jar" ` +
            `-secret ${params.secretToken} ` +
            `-path ${this.targetPath} ` +
            `> ${this.logsPath}/server.log 2>&1 &` +
            `) && echo $! > ${this.pidPath} `;

    // Порядок выполнения методов
    this.order = ['stop', 'relink', 'start'];
}


Object.assign(MultigramServerDeployer.prototype, {

    /**
     * Остановить текущий сервер
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
     * Пересоздаём симлинк
     */
    relink() {
        const srcJar = fs.readdirSync(`${this.sourcePath}/target/`).find(name => name.endsWith('.jar'));

        // Удаляем симлинк на jar сервера в Jenkins Workspace
        if (fs.existsSync(`${this.sourcePath}/target/server.jar`)) {
            execSync(`rm "${this.sourcePath}/target/server.jar"`);
        }

        // Удаляем симлинк на Jenkins Workspace
        if (fs.existsSync(`${this.targetPath}/target`)) {
            execSync(`rm "${this.targetPath}/target"`);
        }

        // Удаляем симлинк на assets
        if (fs.existsSync(`${this.targetPath}/assets`)) {
            execSync(`rm "${this.targetPath}/assets"`);
        }

        // Удаляем старый лог
        if (fs.existsSync(`${this.logsPath}/server.log`)) {
            execSync(`rm "${this.logsPath}/server.log"`);
        }

        return new Promise(resolve => rmdir(`${this.targetPath}/target/`, resolve))
            .then(() => {
                execSync(`ln -s "${this.sourcePath}/target/${srcJar}" "${this.sourcePath}/target/server.jar"`);
                execSync(`ln -s "${this.sourcePath}/target/" ${this.targetPath}/target`);
                execSync(`ln -s "${this.sourcePath}/assets/" ${this.targetPath}/assets`);
            });
    },

    /**
     * Запускаем сервер
     */
    start(delay=10) {
        console.log('Running server...');
        const server = cp.spawn(this.jarCommand, [], {detached: true, stdio: 'inherit', shell: true});

        return new Promise(resolve => {
            setTimeout(() => {
                server.unref();
                resolve();
            }, delay * 1000);
        });
    },

});

module.exports = MultigramServerDeployer;
