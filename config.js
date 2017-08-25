'use strict';

const mkdirs = require('mkdirs');

// Деплойеры
const APIServerDeployer = require('./deployers/APIServerDeployer');


// Конфиг
const config = {

    /**
     * Глобальный путь ко всему
     */
    root: '/home/deploy',

    /**
     * Секретный файл со вмеси ключами
     */
    secretConfig: '$/secret.json',


    /**
     * API Server
     */
    apiServer_Logs: '$/logs/api-server/',
    apiServer_Path: '$/api-server/',
    apiServer_Deployer: APIServerDeployer,


    /**
     * GeoDB Fetcher
     */
    geoDB_Path: '$/api-server/assets/geo-db',
    getDB_URL: 'https://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz',

};

// Заменяем в конфиге $ на serverRoot
Object.keys(config).forEach(key => {
    if (!key.startsWith('$')) {
        return;
    }

    config[key] = config.root + config[key].substring(1);
});

// Создаём несуществующие директории
Object.keys(config).forEach(key => {
    if (!key.endsWith('Path')) {
        return;
    }

    mkdirs(config[key]);
});


module.exports = config;
