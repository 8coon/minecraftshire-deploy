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
    this.sourceJarsPath = `${this.sourcePath}/target`;
    this.targetPath = config.apiServer_Path;
    this.logsPath = config.apiServer_Logs;
    this.pidPath = `${this.targetPath}/server.pid`;
    this.jarPath = `${this.targetPath}/server.jar`;

    this.jarCommand = `java -Xms16M -Xmx170M ` +
            `-jar ${this.jarPath} ` +
            `-secret ${params.secretToken} ` +
            `-path ${this.targetPath} ` +
            `-geoDB ${config.geoDB_Path} ` +
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
        const srcJar = fs.readdirSync(this.sourceJarsPath).find(name => name.endsWith('.jar'));

        return new Promise(resolve => rmdir(this.jarPath, resolve))
            .then(() => {
                execSync(`ln -s "${this.sourceJarsPath}/${srcJar}" ${this.jarPath}`);
            });
    },

    /**
     * Запускаем сервер
     */
    start() {
        execSync(this.jarCommand);
    }

});

module.exports = APIServerDeployer;
