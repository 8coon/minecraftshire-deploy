'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;


/**
 * Отправляет уведомление по Email
 * @param {string} status
 * @param {object} config
 * @param {object} params
 * @constructor
 */
function EmailReport(status, config, params) {
    this.status = status;
    this.sendTo = config.adminEmail;
    this.logPath = params.jenkinsLogPath;
}


Object.assign(EmailReport.prototype, {

    /**
     * Читаем лог из файла
     */
    readLog() {
        return fs.readFileSync(this.logPath, 'utf8');
    },

    sendMail(subject, body) {
        const message = `From: github-trigger-server@minecraftshire.ru\\n` +
                `To: ${this.sendTo}\\n` +
                `MIME-Version: 1.0\\n` +
                `Content-Type: text/html\\n` +
                `Subject: ${subject}\\n` +
                `\\n` +
                `${body}`;
        console.log('Message', `echo "${message.replace('"', '\\"')}" | sendmail -t`);
        execSync(`echo "${message.replace('"', '\\"')}" | sendmail -t`);
    },

    /**
     * Отправляем письмо
     */
    send() {
        console.log('Sending report to', this.sendTo);

        this.sendMail(
            'Minecraftshire Build Agent',
            `<strong>${new Date()}: Build ${this.status}</strong><br>=======================<br>` +
            `${this.readLog().replace('\n', '<br>')}<br>`
        );
    }

});


module.exports = EmailReport;
