'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;
const path = require('path');


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
    this.workspacePath = params.jenkinsWorkspacePath;
    this.logPath = params.jenkinsLogPath;
    this.rubyPath = config.ruby;
}


Object.assign(EmailReport.prototype, {

    /**
     * Читаем лог из файла
     */
    readLog() {
        return fs.readFileSync(this.logPath, 'utf8');
    },

    sendMail(subject, body) {
        body = body.replace('\n', '<br>');

        const from = 'github-trigger-server@minecraftshire.ru';
        const to = this.sendTo;
        const bodyFile = `${this.workspacePath}/message.temp`;

        fs.writeFileSync(bodyFile, body, 'utf8');
        execSync(`${this.rubyPath} "${path.dirname(__filename)}/sendmail.rb" "${from}" "${to}" "${subject}" "${bodyFile}"`);
        // execSync(`rm "${bodyFile}"`);
    },

    /**
     * Отправляем письмо
     */
    send() {
        console.log('Sending report to', this.sendTo);

        this.sendMail(
            'Minecraftshire Build Agent',
            `<strong>Build ${this.status}: ${new Date()}</strong><br>=======================<br>` +
            `${this.readLog()}<br>`
        );
    }

});


module.exports = EmailReport;
