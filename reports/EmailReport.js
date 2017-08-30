'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;


/**
 * Отправляет уведомление по Email
 * @param {string} status
 * @param {object} params
 * @constructor
 */
function EmailReport(status, params) {
    this.status = status;
    this.logPath = params.jenkinsLogPath;
}


Object.assign(EmailReport.prototype, {

    /**
     * Читаем лог из файла
     */
    readLog() {
        return fs.readFileSync(this.logPath, 'utf8');
    },

    /**
     * Отправляем письмо
     */
    send() {
        const log = this.readLog();
        const cmd = `sendmail 'Minecraftshire Build Agent', ` +
                `"<strong>${new Date()}: Build ${status}</strong><br>"` +
                `=======================<br>` +
                `${log.replace('\n', '<br>')}<br>`;
        execSync(cmd);
    }

});


module.exports = EmailReport;
