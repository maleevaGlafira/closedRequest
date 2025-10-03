const readline = require("readline-promise");
const { stdin, stdout } = require("node:process");

const IntervalSeconds = 60;
const FirebirdDB = require("./firebird");
const { Con_MSSQL } = require("./connections/con_mssql");
const moment = require("moment-timezone");
const config = require("config");

const { createLocalLogger } = require("./logger/loggers.js");
const SqlSelect = {
  Fb: {
    getData:
      "select ID_1562, ID_ORDER, EXCUTOR, STARTDATE, ENDDATE, ABOUT, ID_OFFICIALS, STATE, ID_DAMAGEPLACE from sentto_1562 where STARTDATE is not null and ENDDATE is not null and ID_OFFICIALS is not null and ABOUT is not null ",
    setReceived: "EXECUTE PROCEDURE READ_1562(?)",
  },
  MS: {
    getSystem: `select[dbo].[fnWho_opened_from_id_request](?) name_system`,
    getJob: `select id_connect FROM [dbo].[fnSelectJobs](?,'?');`,
  },
};
const MAX_Count = config.MAX_Count;
global.db = new FirebirdDB();
global.con_mssql = new Con_MSSQL();

async function PrePareFromMsSQL(ID_1562, ID_DAMAGEPLACE) {
  const system = await global.con_mssql.select(
    SqlSelect.MS.getSystem.replace("?", ID_1562)
  );
  const { name_system } = system.recordset[0];

  const SetId_JOb = await global.con_mssql.select(
    SqlSelect.MS.getJob.replace("?", ID_DAMAGEPLACE).replace("?", name_system)
  ); //`select id_connect FROM [dbo].[fnSelectJobs](${ID_DAMAGEPLACE},'${name_system}');`
  const ID_JOb = SetId_JOb.length == 0 ? 0 : SetId_JOb.recordsets[0].id_connect;
  return ID_JOb;
}

function prepareTimes(STARTDATE, ENDDATE) {
  const startDateUTC = moment
    .utc(STARTDATE)

    .tz("Etc/GMT-6")
    .format("YYYY-MM-DD HH:mm:ss");
  const endDateUTC = moment
    .utc(ENDDATE)
    .tz("Etc/GMT-6")
    .format("YYYY-MM-DD HH:mm:ss");

  return { startDateUTC, endDateUTC };
}

// index.js
async function getData() {
  this.logger = createLocalLogger("main");
  logger.info("Start");

  // Инициализация соединений
  try {
    await global.con_mssql.connect();
  } catch (err) {
    logger.error(
      `Initial MSSQL connection failed: ${err.message}\n${err.stack}`
    );
  }
  try {
    await global.db.reconnect();
  } catch (err) {
    logger.error(
      `Initial Firebird connection failed: ${err.message}\n${err.stack}`
    );
  }

  let stop = false,
    process = false;

  let intervalId = setInterval(async () => {
    if (!process) {
      process = true;
      try {
        await Write();
        if (stop) {
          console.log("!Start closed");
          global.db.close();
          global.con_mssql.close();
          clearInterval(intervalId);
          this.logger.info("==Stop");
        } else {
          console.log(new Date());
          process = false;
        }
      } catch (err) {
        logger.error(`Interval error: ${err.message}\n${err.stack}`);
        process = false; // Продолжаем цикл даже при ошибке
      }
    }
  }, IntervalSeconds * 1000);

  const rl = readline.default.createInterface({
    input: stdin,
    output: stdout,
    terminal: true,
  });

  rl.questionAsync("Press key to stop").then((result) => {
    console.log("Finish---", result);
    stop = true;
    rl.close();
  });
}

// index.js
async function Write() {
  const db = global.db;
  const con_mssql = global.con_mssql;

  // Проверка соединений
  if (!db.isConnected) {
    await db.reconnect();
  }
  if (!con_mssql.isConnected) {
    await con_mssql.reconnect();
  }

  // Если хотя бы одно соединение не восстановлено, прекращаем обработку
  if (!db.isConnected || !con_mssql.isConnected) {
    logger.error(
      `Cannot proceed: Firebird connected=${db.isConnected}, MSSQL connected=${con_mssql.isConnected}`
    );
    return;
  }

  try {
    const selectResult = await db.executeSelect(SqlSelect.Fb.getData);
    console.log("--Receive from =" + selectResult.length);
    logger.info("--Receive from =" + selectResult.length);
    let count = 0;
    const maxLen =
      selectResult.length > MAX_Count ? MAX_Count : selectResult.length;

    for (let i = 0; i < maxLen; i += 1) {
      logger.info(`FireBird Receive - ${JSON.stringify(selectResult[i])}`);
      const {
        ID_1562,
        ID_ORDER,
        STARTDATE,
        ENDDATE,
        ABOUT,
        ID_OFFICIALS,
        STATE,
        ID_DAMAGEPLACE,
        EXCUTOR,
      } = selectResult[i];

      try {
        const ID_JOb = await PrePareFromMsSQL(ID_1562, ID_DAMAGEPLACE);
        const { startDateUTC, endDateUTC } = prepareTimes(STARTDATE, ENDDATE);
        console.log(
          "id_1562=",
          ID_1562,
          " id_order=",
          ID_ORDER,
          startDateUTC,
          endDateUTC
        );

        const res = await con_mssql.performRequest(
          ID_1562,
          ID_OFFICIALS,
          ID_ORDER,
          EXCUTOR,
          ABOUT,
          startDateUTC,
          endDateUTC,
          STATE,
          ID_JOb
        );
        logger.info(`MSSQL Result - ${JSON.stringify(res)}`);

        if (res) {
          const res2 = await db.insert(
            SqlSelect.Fb.setReceived.replace("?", ID_1562)
          );
          if (res2) count += 1;
          logger.info(`FireBird Result - ${JSON.stringify(res2)}`);
        }
      } catch (err) {
        logger.error(
          `Error processing record ${ID_1562}: ${err.message}\n${err.stack}`
        );
        return; // Прекращаем обработку при любой ошибке, ждем следующего цикла
      }
    }
    logger.info("--Updated = " + count);
  } catch (error) {
    logger.error(`Error in Write: ${error.message}\n${error.stack}`);
    // Не прерываем цикл, ждем следующего интервала
  }
}

function testData() {
  const dt = new Date();
  console.log(dt);

  const utcD = moment(dt).format("YYYY-MM-DD HH:mm:ss");
  console.log(utcD);
}
getData();
testData();
