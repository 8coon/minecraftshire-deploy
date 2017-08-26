'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;
const mkdirs = require('mkdirs');
const https = require('https');
const rmdir = require('rmdir');


/**
 * Установщик базы GeoDB
 * @param config
 * @param params
 * @constructor
 */
function GeoDBDeployer(config, params) {
    this.geoDBPath = config.geoDB_Path;
    this.geoDBUrl = config.geoDB_URL;
    this.currentVersionPath = `${this.geoDBPath}/CurrentVersion`;

    // Порядок выполнения методов
    this.order = ['prepare', 'clear', 'fetch'];
}


Object.assign(GeoDBDeployer.prototype, {

    prepare() {
        mkdirs(this.geoDBPath);
        const promises = [];

        // Если прошлая версия была прилинкована -- удалить
        if (fs.existsSync(this.currentVersionPath)) {
            promises.push(new Promise(resolve => rmdir(this.currentVersionPath, resolve)));
        }

        return Promise.all(promises);
    },

    clear() {
        const promises = [];

        fs.readdirSync(this.geoDBPath).forEach(name => {
            if (name.startsWith('GeoLite2-City_')) {
                promises.push(new Promise(resolve => rmdir(`${this.geoDBPath}/${name}`, resolve)));
            }
        });

        return Promise.all(promises);
    },

    fetch() {
        // Загружаем и распаковываем БД
        execSync(`cd ${this.geoDBPath} && curl ${this.geoDBUrl} | tar xvz`);

        // Находим загруженное
        const newVersion = fs.readdirSync(this.geoDBPath).find(name => name.startsWith('GeoLite2-City_'));

        // Записываем версию в файл
        fs.writeFileSync(`${this.geoDBPath}/version.info`, newVersion, 'utf8');

        // Прилинковываем в CurrentVersion
        execSync(`ln -s "${this.geoDBPath}/${newVersion}" ${this.currentVersionPath}`);
    }

});

module.exports = GeoDBDeployer;
