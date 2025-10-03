import mysql from "mysql2";
import { createLocalLogger } from "../logger/loggers.js";
import config from "config";
export class conMySQL {
  constructor() {
    const dbConf = config.get("dbConf").mySQL;

    this.pool = mysql.createPool(dbConf).promise();

    this.isConnect = false;

    this.logger = createLocalLogger("con_mysql");
  }

  close() {
    this.pool.end();
  }

  //   connect(funSelect) {
  //     this.con.connect((err) => {
  //       if (err) {
  //         this.isConnect = false;
  //         this.logger.error(err);
  //         throw err;
  //       }
  //       console.log("is connect");
  //       this.isConnect = true;
  //       const result = funSelect(this.con);
  //       console.log("end;");
  //     });
  //   }

  async getRegions() {
    let rows = await this.pool.execute("select * from region");
    return rows;
  }

  async select(sql, data = []) {
    let result = await this.pool.query(sql, data);

    // if (err) throw err;
    return result[0];
  }

  async execute(sql, data = []) {
    let result = await this.pool.query(sql, data);

    // if (err) throw err;
    return result;
  }

  get() {
    const con = this.con;
    con.connect(function (err) {
      if (err) throw err;
      //Select only "name" and "address" from "customers":
      logger.info("Connect");
      const qr = con.query(
        "select * from region",
        function (err, result, fields) {
          if (err) throw err;
          return;
        }
      );
      con.end();
    });
  }
}
