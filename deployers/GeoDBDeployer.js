'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;
const mkdirs = require('mkdirs');
const https = require('https');


/**
 * Установщик базы GeoDB
 * @param config
 * @param params
 * @constructor
 */
function GeoDBDeployer(config, params) {
    this.geoDBPath = config.geoDB_Path;
    this.geoDBUrl = config.getDB_URL;
    this.currentVersionPath = `${this.geoDBPath}/CurrentVersion`;

    // Порядок выполнения методов
    this.order = ['prepare', 'clear', 'fetch'];
}


Object.assign(GeoDBDeployer.prototype, {

    prepare() {
        mkdirs(this.geoDBPath);

        // Если прошлая версия была прилинкована -- удалить
        if (fs.existsSync(this.currentVersionPath)) {
            fs.unlinkSync(this.currentVersionPath);
        }
    },

    clear() {
        fs.readdirSync(this.geoDBPath).forEach(name => {
            if (name.startsWith('GeoLite2-City_')) {
                fs.unlinkSync(`${this.geoDBPath}/${name}`);
            }
        });
    },

    fetch() {
        // Загружаем и распаковываем БД
        execSync(`cd ${this.geoDBPath} && curl ${this.geoDBUrl} | tar xvz`);

        // Находим загруженное
        const newVersion = fs.readdirSync(this.geoDBPath).find(name => name.startsWith('GeoLite2-City_'));

        // Записываем версию в файл
        fs.writeFileSync(`${this.geoDBPath}/version.info`, newVersion, 'utf8');

        // Прилинковываем в CurrentVersion
        fs.linkSync(`${this.geoDBPath}/${newVersion}`, this.currentVersionPath);
    }

});
