'use strict';

const fs = require('fs');
const rmdir = require('rmdir');
const execSync = require('child_process').execSync;


/**
 * Может перезапускать сервер API и создавать симлинк на него
 * @param config
 * @param {{jenkinsWorkspacePath: string, secretToken: string}} params
 * @constructor
 */
function APIServerDeployer(config, params) {
    this.sourcePath = params.jenkinsWorkspacePath;
    this.targetPath = config.apiServer_Path;
    this.logsPath = config.apiServer_Logs;
    this.pidPath = `${this.targetPath}/server.pid`;

    this.jarCommand = `java -Xms16M -Xmx170M ` +
            `-jar "${this.sourcePath}/target/server.jar" ` +
            `-secret ${params.secretToken} ` +
            `-path ${this.targetPath} ` +
            `-geoDB ${config.geoDB_Path} ` +
            `-pid ${this.pidPath} ` +
            `-log ${this.logsPath} &`;

    // Порядок выполнения методов
    this.order = ['stop', 'relink', 'start'];
}


Object.assign(APIServerDeployer.prototype, {

    /**
     * Получить PID текущего сервера
     */
    getPID() {
        // PID не найден -- значит, сервер не запущен
        if (!fs.existsSync(this.pidPath)) {
            return null;
        }

        const pid = parseInt(fs.readFileSync(this.pidPath, 'utf8'), 10);

        // Чтобы случайно не убить ничего системного
        if (isNaN(pid) || pid < 10) {
            return null;
        }

        return pid;
    },

    /**
     * Остановить текущий сервер
     */
    stop() {
        const pid = this.getPID();
        if (!pid) return;

        process.kill(pid);
    },

    /**
     * Пересоздаём симлинк
     */
    relink() {
        const srcJar = fs.readdirSync(`${this.sourcePath}/target/`).find(name => name.endsWith('.jar'));

        if (fs.existsSync(`${this.sourcePath}/target/server.jar`)) {
            execSync(`rm "${this.sourcePath}/target/server.jar"`);
        }

        if (fs.existsSync(`${this.targetPath}/target/`)) {
            execSync(`rm "${this.targetPath}/target/"`);
        }

        return new Promise(resolve => rmdir(`${this.targetPath}/target/`, resolve))
            .then(() => {
                execSync(`ln -s "${this.sourcePath}/target/${srcJar}" "${this.sourcePath}/target/server.jar"`);
                execSync(`ln -s "${this.sourcePath}/target/" ${this.targetPath}/target/`);
            });
    },

    /**
     * Запускаем сервер
     */
    start() {
        console.log('Running server:', this.jarCommand);
        execSync(this.jarCommand);
    }

});

module.exports = APIServerDeployer;
