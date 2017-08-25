'use strict';

/**
 * Запускает деплойер
 * @param {constructor} Deployer
 * @param {object} config -- объект конфигурации
 * @param {object} params -- параметры из секретного файла конфигурации
 * @constructor
 */
function DeployerRunner(Deployer, config, params) {
    this.Deployer = Deployer;
    this.config = config;
    this.params = params;
    this.clear();
}


Object.assign(DeployerRunner.prototype, {

    /**
     * Запускает деплойер, возвращает промис
     */
    run() {
        let lastPromise = this.promise;

        // Итерируемся по всем задачам в деплойере в том порядке, в котором они были указаны
        (this.deployer.order || []).forEach(jobName => {
            // Создаём цепочку промисов
            lastPromise = lastPromise.then(() => {
                return new Promise(resolve => {
                    const promise = deployer[jobName]();

                    // Деплойер правда вернул промис -- нужно дождаться его выполнения
                    if (promise && typeof promise.then === 'function') {
                        promise.then(() => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            });
        });

        return lastPromise;
    },

    /**
     * Сбрасывает состояние раннера
     */
    clear() {
        const Deployer = this.Deployer;
        this.deployer = new Deployer(this.config, this.params);
        this.promise = Promise.resolve();
    }

});


module.exports = DeployerRunner;

