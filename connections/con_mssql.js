// con_mssql.js
const sql = require("mssql");
const config = require("config");
const { createLocalLogger } = require("../logger/loggers.js");

class Con_MSSQL {
  constructor() {
    this.dbConf = config.get("dbConf").msSQL;
    console.log("Con_MSSQL=", this.dbConf);
    this.pool = null;
    this.logger = createLocalLogger("conMssQL");
    this.isConnected = false;
    this.retryDelay = 30000; // Задержка 30 секунд для повторного подключения
  }

  async connect() {
    try {
      this.pool = await sql.connect(this.dbConf);
      this.pool.pool.destroyTimeoutMillis = 10000;
      this.isConnected = true;
      this.logger.info("MSSQL connected");
      return true;
    } catch (err) {
      this.isConnected = false;
      this.logger.error(
        `MSSQL connection failed: ${err.message}\n${err.stack}`
      );
      throw err;
    }
  }

  async reconnect() {
    try {
      await this.close();
      await this.connect();
      return true;
    } catch (err) {
      this.isConnected = false;
      this.logger.error(
        `Failed to reconnect MSSQL: ${err.message}\n${err.stack}`
      );
      return false;
    }
  }

  async select(selSQL) {
    if (!this.isConnected) {
      await this.reconnect();
    }
    try {
      this.logger.info(`Select ${selSQL}`);
      return await this.pool.request().query(selSQL);
    } catch (err) {
      this.isConnected = false;
      this.logger.error(`Select failed: ${err.message}\n${err.stack}`);
      throw err;
    }
  }

  async performRequest(
    id_1562,
    fk_disp,
    id_order,
    Executors,
    context,
    DateOpened,
    DateClosed,
    state,
    id_job
  ) {
    if (!id_1562) return null;
    if (!this.isConnected) {
      await this.reconnect();
    }
    try {
      this.logger.info(
        `spImportKhNewToRequest_Performed - ${id_1562} ${fk_disp}, ${id_order}, ${Executors}, ${context}, ${DateOpened}, ${DateClosed}`
      );
      const result = await this.pool
        .request()
        .input("id", sql.Int, id_1562)
        .input("fk_disp", sql.Int, fk_disp)
        .input("id_order", sql.Int, id_order)
        .input("Executors", sql.VarChar(80), Executors)
        .input("context", sql.VarChar(2520), context)
        .input("DateOpened", sql.DateTime, DateOpened)
        .input("DateClosed", sql.DateTime, DateClosed)
        .input("STATE", sql.Int, state)
        .input("ID_Ispolnitel", sql.Int, null)
        .input("ID_Raboti", sql.Int, id_job)
        .output("error_number", sql.Int)
        .output("error_message", sql.VarChar(2048))
        .execute("spImportKhNewToRequest_Performed");
      return result.output;
    } catch (err) {
      this.isConnected = false;
      this.logger.error(`performRequest failed: ${err.message}\n${err.stack}`);
      throw err;
    }
  }

  async close() {
    if (this.pool) {
      console.log("Close MsSQL");
      await this.pool.close();
      this.pool = null;
      this.isConnected = false;
      this.logger.info("MSSQL pool closed");
    }
  }
}

module.exports = { Con_MSSQL };
