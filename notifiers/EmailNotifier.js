'use strict';

const fs = require('fs');


/**
 * Отправляет уведомление по Email
 * @param {string} status
 * @param {object} config
 * @param {object} params
 * @constructor
 */
function EmailNotifier(status, config, params) {
    this.status = status;

    console.log(JSON.stringify(params), params.jenkinsBuildURL);

    /*this.logFile = logFile;
    this.time = time;
    this.to =*/

}


Object.assign(EmailNotifier.prototype, {

    /**
     * Читаем лог из файла
     */
    readLog() {
        return fs.readFileSync(this.logFile, 'utf8');
    },

    /**
     * Отправляем письмо
     */
    send() {

    }

    /*sendmail 'Minecraftshire Build Agent', ""\
"<strong>#{Time.now.strftime('%d/%m/%Y %H:%M')}: Build SUCCESS</strong><br>"\
"Build time: #{(Time.now - start).duration}<br><br><br>"\
"=======================<br>"\
"#{@log.gsub "\n", '<br>'}<br>"*/

});


module.exports = EmailNotifier;
