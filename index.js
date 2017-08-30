'use strict';


const fs = require('fs');
const DeployerRunner = require('./runners/DeployerRunner');

// Конфиг
const config = require('./config');

// Нотификации
const EmailReport = require('./reports/EmailReport');

// Секретные параметры
const params = JSON.parse(fs.readFileSync(config.secretConfig, 'utf8'));

// Параметры командной строки
const args = require('args-parser')(process.argv);

// Да, параметры команной строки имеют большй приоритет, чем то, что было в файле!
Object.assign(params, args);


// Если список тасков не передан -- запустим все!
if (!args.tasks) {
    args.tasks = [];

    Object.keys(config).forEach(key => {
        if (key.includes('_')) {
            args.tasks.push(key.split('_')[0]);
        }
    });
} else {
    args.tasks = args.tasks.split(',');
}


console.log('Running tasks:', args.tasks.join(', '));

// Запускаем таски
let lastPromise = Promise.resolve();
args.tasks.forEach(taskName => {
    console.log('Preparing task:', taskName, 'with deployer', `${taskName}_Deployer`);
    const runner = new DeployerRunner(config[`${taskName}_Deployer`], config, params);

    // Создаём цепочку промисов
    lastPromise = lastPromise.then(() => {
        console.log('Started task:', taskName);

        return runner.run()
            .then(() => console.log('Finished task:', taskName))
            .catch(err => {
                console.error(err);
                console.log('Failed task:', taskName);
                console.log('Aborting...');

                new EmailReport('FAIL', config, params).send();
                process.exit(-1);
            })
    });
});


lastPromise
    .then(() => {
        console.log('Finished tasks:', args.tasks.join(', '));

        new EmailReport('SUCCESS', config, params).send();
        process.exit(0);
    });
