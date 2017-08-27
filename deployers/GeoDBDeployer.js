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
    this.order = ['clear', /*'fetch'*/];
}


Object.assign(GeoDBDeployer.prototype, {

    clear() {
        console.log(this.geoDBPath, fs.existsSync(this.geoDBPath));
        if (fs.existsSync(this.geoDBPath)) {
            return new Promise(resolve => rmdir(this.geoDBPath, resolve)).then(() => mkdirs(this.geoDBPath));
        }

        mkdirs(this.geoDBPath);
    },

    fetch() {
        // Загружаем и распаковываем БД
        execSync(`eval "cd ${this.geoDBPath} \n curl ${this.geoDBUrl} | tar xvz"`);

        // Находим загруженное
        const newVersion = fs.readdirSync(this.geoDBPath).find(name => name.startsWith('GeoLite2-City_'));

        // Записываем версию в файл
        fs.writeFileSync(`${this.geoDBPath}/version.info`, newVersion, 'utf8');

        // Прилинковываем в CurrentVersion
        execSync(`ln -s "${this.geoDBPath}/${newVersion}" ${this.currentVersionPath}`);
    }

});

module.exports = GeoDBDeployer;
