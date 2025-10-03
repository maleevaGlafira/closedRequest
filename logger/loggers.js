const { createLogger, format, transports } = require("winston");

function createLocalLogger(procName) {
  return new MyLogger(procName);
}

class MyLogger {
  constructor(procName) {
    this.procName = procName;
    this.logger = null;
    this.dt = new Date();
  }

  #createLogger() {
    let currentDt = new Date();
    const timezoneFormat = () => {
      return new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Kiev",
      });
    };

    if (!this.logger || currentDt.getDay() != this.dt.getDay()) {
      const logLevels = {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5,
      };
      const dt = new Date();
      this.dt = dt;
      const logName = `./log/${
        this.procName
      }-${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}.log`;
      const logger = createLogger({
        format: format.combine(
          format.timestamp({ format: timezoneFormat }),
          format.json()
        ),
        levels: logLevels,
        transports: [new transports.File({ filename: logName })],
      });

      this.logger = logger;
    }
  }

  info(message) {
    this.#createLogger();
    this.logger.info(message);
  }

  error(message) {
    this.#createLogger();
    this.logger.error(String(message));
  }

  fatal(message) {
    this.#createLogger();
    this.logger.fatal(String(message));
  }

  debug(message) {
    this.#createLogger();
    this.logger.debug(String(message));
  }

  warn(message) {
    this.#createLogger();
    this.logger.warn(String(message));
  }
}
module.exports = { createLocalLogger };
