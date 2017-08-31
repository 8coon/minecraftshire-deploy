'use strict';

const mkdirs = require('mkdirs');

// Деплойеры
const APIServerDeployer = require('./deployers/APIServerDeployer');
const GeoDBDeployer = require('./deployers/GeoDBDeployer');
const PanelDeployer = require('./deployers/PanelDeployer');
const SinopiaDeployer = require('./deployers/SinopiaDeployer');
const JSUtilsDeployer = require('./deployers/JSUtilsDeployer');
const JSAPIDeployer = require('./deployers/JSAPIDeployer');


// Конфиг
const config = {

    /**
     * Глобальный путь ко всему
     */
    root: '/home/deploy',


    /**
     * Путь до Ruby
     */
    ruby: '/root/.rbenv/shims/ruby',


    /**
     * Email для уведомлений
     */
    adminEmail: 'gpuzzletime@icloud.com',


    /**
     * Секретный файл со вмеси ключами
     */
    secretConfig: '$/secret.json',


    /**
     * Путь до файла с версиями опубликованных пакетов
     */
    version_Path: '$',
    version_File: 'published-packages.json',


    /**
     * API Server
     */
    apiServer_Logs: '$/logs/api-server',
    apiServer_Path: '$/api-server',
    apiServer_Deployer: APIServerDeployer,


    /**
     * GeoDB Fetcher
     */
    geoDB_Path: '$/geo-db',
    geoDB_URL: 'https://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz',
    geoDB_Deployer: GeoDBDeployer,


    /**
     * Panel
     */
    panel_Path: '$/panel',
    panel_Deployer: PanelDeployer,


    /**
     * Sinopia
     */
    sinopia_Path: '$/sinopia',
    sinopia_Deployer: SinopiaDeployer,


    /**
     * JS Utils
     */
    jsUtils_Deployer: JSUtilsDeployer,


    /**
     * JS API
     */
    jsAPI_Deployer: JSAPIDeployer,

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
