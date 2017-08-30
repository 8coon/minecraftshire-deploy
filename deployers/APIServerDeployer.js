'use strict';

const fs = require('fs');
const cp = require('child_process');
const rmdir = require('rmdir');
const mkdirs = require('mkdirs');
const execSync = require('child_process').execSync;
const https = require('https');
const http = require('http');


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
            `-geo ${config.geoDB_Path} ` +
            `-pid ${this.pidPath} ` +
            `-log ${this.logsPath}/server.log &`;

    // Порядок выполнения методов
    this.order = ['stop', 'relink', 'start', 'wait'];
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

    /**
     * Ждём, пока сервер прогрузится и ответит нам на тестовый запрос
     * @param timeout время ожидания загрузки
     * @param delay перерыв между запросами
     */
    wait(timeout=60, delay=5) {
        return new Promise((resolve, reject) => {
            let resolveTimer;
            // Реджектимся через 60 секунд, если сервер не загрузился
            const rejectTimer = setTimeout(() => {
                console.log('Was waiting the server to load for 60s, it didn\'t -- Rejecting...');
                clearInterval(resolveTimer);

                reject();
            }, timeout * 1000);

            let promise = Promise.resolve();

            // Пингуем сервер каждые delay секунд
            resolveTimer = setInterval(() => {
                promise = promise.then(() => new Promise(res => {
                    console.log('Making request to api/service/version...');

                    const request = http.request({
                        url: 'http://localhost:5101/service/version',
                        method: 'POST',
                    }, result => {

                        if (result.ok && String(result.body).startsWith('{')) {
                            console.log('Request OK, server loaded');

                            clearTimeout(rejectTimer);
                            clearTimeout(resolveTimer);

                            resolve();
                            res();

                            return;
                        }

                        res();
                    });

                    request.setTimeout(4000, () => {
                        console.log('Request timed out');
                        request.abort();
                    });

                    request.on('error', res);
                }))
            }, delay * 1000);
        });
    }


});

module.exports = APIServerDeployer;
