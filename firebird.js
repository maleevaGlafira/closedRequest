// firebird.js
const Firebird = require("node-firebird");
const config = require("config");
const { createLocalLogger } = require("./logger/loggers.js");

class FirebirdDB {
  constructor() {
    const dbConf = config.get("dbConf").Fb;
    this.options = dbConf;
    console.log("FB_option ", dbConf);
    this.pool = Firebird.pool(5, this.options);
    this.logger = createLocalLogger("FirebirdDB");
    this.isConnected = false;
    this.retryDelay = 30000; // Задержка 30 секунд для повторного подключения
  }

  // Проверка и восстановление соединения
  async reconnect() {
    try {
      if (this.pool) {
        this.pool.destroy();
      }
      this.pool = Firebird.pool(5, this.options);
      this.isConnected = true;
      this.logger.info("Firebird pool reconnected");
      return true;
    } catch (err) {
      this.isConnected = false;
      this.logger.error(
        `Failed to reconnect Firebird pool: ${err.message}\n${err.stack}`
      );
      return false;
    }
  }

  // Метод для выполнения запроса
  async executeSelect(sql, params) {
    this.logger.info(`${sql} ${JSON.stringify(params)}`);
    if (!this.isConnected) {
      await this.reconnect();
    }
    try {
      return await new Promise((resolve, reject) => {
        this.pool.get((err, db) => {
          if (err) {
            this.isConnected = false;
            return reject(err);
          }
          db.query(sql, params, (err, result) => {
            if (err) {
              this.isConnected = false;
              return reject(err);
            }
            db.detach();
            resolve(result);
          });
        });
      });
    } catch (err) {
      this.logger.error(`executeSelect failed: ${err.message}\n${err.stack}`);
      throw err;
    }
  }

  // Метод для вставки данных
  async insert(sql, params) {
    this.logger.info(`${sql} ${JSON.stringify(params)}`);
    if (!this.isConnected) {
      await this.reconnect();
    }
    try {
      return await new Promise((resolve, reject) => {
        this.pool.get((err, db) => {
          if (err) {
            this.isConnected = false;
            return reject(err);
          }
          db.query(sql, params, (err, result) => {
            if (err) {
              this.isConnected = false;
              return reject(err);
            }
            db.detach();
            resolve(result);
          });
        });
      });
    } catch (err) {
      this.logger.error(`insert failed: ${err.message}\n${err.stack}`);
      throw err;
    }
  }

  // Метод для закрытия пула соединений
  close() {
    if (this.pool) {
      this.pool.destroy();
      this.isConnected = false;
      this.logger.info("Firebird pool closed");
    }
  }
}

module.exports = FirebirdDB;
