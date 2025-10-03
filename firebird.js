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

  // Приватный метод: выполняет callback с подключением из пула
  async _withConnection(callback) {
    let db = null;

    try {
      // Получаем соединение из пула (обёртка в Promise)
      db = await new Promise((resolve, reject) => {
        this.pool.get((err, connection) => {
          if (err) {
            this.isConnected = false;
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });

      // Выполняем переданный callback (например, запрос)
      const result = await callback(db);
      return result;
    } catch (err) {
      throw err; // Пробрасываем ошибку наверх
    } finally {
      // Гарантированно освобождаем соединение, даже если была ошибка
      if (db) {
        try {
          db.detach();
        } catch (e) {
          this.logger.warn("Failed to detach DB connection:", e.message);
        }
      }
    }
  }
  // Метод для SELECT-запросов
  async executeSelect(sql, params = []) {
    this.logger.info(`${sql} ${JSON.stringify(params)}`);
    if (!this.isConnected) {
      await this.reconnect();
    }

    try {
      return await this._withConnection((db) => {
        return new Promise((resolve, reject) => {
          db.query(sql, params, (err, result) => {
            if (err) {
              this.isConnected = false;
              return reject(err);
            }
            resolve(result);
          });
        });
      });
    } catch (err) {
      this.logger.error(`executeSelect failed: ${err.message}\n${err.stack}`);
      throw err;
    }
  }

  // Метод для INSERT/UPDATE/DELETE
  async insert(sql, params = []) {
    this.logger.info(`${sql} ${JSON.stringify(params)}`);
    if (!this.isConnected) {
      await this.reconnect();
    }

    try {
      return await this._withConnection((db) => {
        return new Promise((resolve, reject) => {
          db.query(sql, params, (err, result) => {
            if (err) {
              this.isConnected = false;
              return reject(err);
            }
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
