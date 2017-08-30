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
        body = body.replace('\r\n', '<br>').replace('\n\r', '<br>').replace('\r', '<br>').replace('\n', '<br>');

        const from = 'github-trigger-server@minecraftshire.ru';
        const to = this.sendTo;
        const bodyFile = `${this.logPath}/../message.temp`;

        fs.writeFileSync(tempMessagePath, body, 'utf8');
        execSync(`ruby ${__filename}/../sendmail.rb ${from} ${to} ${subject} ${bodyFile}`);
        execSync(`rm ${bodyFile}`);
    },

    /**
     * Отправляем письмо
     */
    send() {
        console.log('Sending report to', this.sendTo);

        this.sendMail(
            'Minecraftshire Build Agent',
            `<strong>${new Date()}: Build ${this.status}</strong><br>=======================<br>` +
            `${this.readLog()}<br>`
        );
    }

});


module.exports = EmailReport;
