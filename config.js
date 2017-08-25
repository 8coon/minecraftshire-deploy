'use strict';

const mkdirs = require('mkdirs');

// Деплойеры
const APIServerDeployer = require('./deployers/APIServerDeployer');
const GeoDBDeployer = require('./deployers/GeoDBDeployer');


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
    geoDB_Path: '$/geo-db/',
    geoDB_URL: 'https://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz',
    geoDB_Deployer: GeoDBDeployer,

};

// Заменяем в конфиге $ на serverRoot
Object.keys(config).forEach(key => {
    if (typeof config[key] === 'string') {
        config[key] = config[key].replace('$', config.root);
    }
});

// Создаём несуществующие директории
Object.keys(config).forEach(key => {
    if (key.endsWith('Path') || key.endsWith('Logs')) {
        mkdirs(config[key]);
    }
});


module.exports = config;
