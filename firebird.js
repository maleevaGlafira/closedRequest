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

  // Функция для проверки подключения
  async testPoolConnection() {
    let db = null;
    try {
      // Получаем соединение из пула
      db = await new Promise((resolve, reject) => {
        this.pool.get((errGet, connection) => {
          if (errGet) {
            reject(errGet);
          } else {
            resolve(connection);
          }
        });
      });

      // Опционально: выполнить простой запрос (например, SELECT 1 FROM RDB$DATABASE)
      const result = await new Promise((resolve, reject) => {
        db.query("SELECT 1 FROM RDB$DATABASE", (errTest, res) => {
          if (errTest) {
            reject(errTest);
          } else {
            resolve(res);
          }
        });
      });

      console.log("✅ Пул подключён и работает. Пример результата:", result);
      this.isConnected = true;
    } catch (error) {
      console.error("❌ Ошибка подключения к БД через пул:", error.message);
      this.isConnected = false;
    } finally {
      // Важно: вернуть соединение в пул!
      if (db) {
        db.detach(); // или db.release(), но в node-firebird используется detach()
      }
    }
  }

  // Проверка и восстановление соединения
  async reconnect() {
    try {
      await this.testPoolConnection();
      if (!this.isConnected) {
        if (this.pool) {
          this.pool.destroy();
        }
        this.pool = Firebird.pool(5, this.options);
        this.isConnected = true;
        this.logger.info("Firebird pool reconnected");
        return true;
      }
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
          db.query(sql, params, (errSel, result) => {
            if (errSel) {
              this.isConnected = false;
              return reject(errSel);
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
        this.pool.get((errGet, db) => {
          if (err) {
            this.isConnected = false;
            return reject(errGet);
          }
          db.query(sql, params, (errIns, result) => {
            if (err) {
              this.isConnected = false;
              return reject(errIns);
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
