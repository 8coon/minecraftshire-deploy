'use strict';

const fs = require('fs');


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
    this.jarPath = `${this.targetPath}/server.jar`;

    this.jarCommand = `java -Xms16M -Xmx170M 
            -jar ${this.jarPath} 
            -secret ${params.secretToken} 
            -path ${this.targetPath} 
            -geoDB ${config.geoDB_Path} 
            -log ${this.logsPath} &`.replace('\n', '');

    // Порядок выполнения методов
    this.order = ['stop', 'unlink'];
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
     * Убрать симлинк
     */
    unlink() {
        fs.unlinkSync()
    }

});

module.exports = APIServerDeployer;
