import { Con_MSSQL } from "./con_mssql.js";
import sql from "mssql";
import dayjs from "dayjs";

export class ProceduresMSSQL extends Con_MSSQL {
  // MsSqlProcName = spInsertNewDispetcher;
  async addSidedDispatcher(disp, fk_place) {
    // Если disp is null  не вставляем
    if (disp) {
      try {
        if (!this.pool) {
          await this.connect();
        }
        const result = await this.pool
          .request()
          .input("disp", sql.VarChar(64), disp)
          .input("fk_place", sql.Int, fk_place)
          .output("id", sql.Int)
          .output("error_number", sql.Int)
          .output("error_message", sql.VarChar(2048))
          .execute("spInsertNewDispetcher");
        return result.output;
      } catch (e) {
        this.logger.error(`addSidedDispatcher (disp, fk_place)` + e);
        return null;
      }
    } else {
      return null;
    }
  }

  /** insertRequest
   * MsSqlProcName=sp_API_Import1562NewToRequest
   * @param {Object} Obj
   * @param {int}  Obj.appealId
   * @param {int}  Obj.appealCd
   * @param {Date}  Obj.appealDate
   * @param {int}  Obj.id_aux_opened = 96
   * @param {String(20)}  Obj.CallerPhoneNumber
   * @param {String}  Obj.CallerFullName
   * @param {int}  Obj.FK_REGION_ETALONE
   * @param {int}  Obj.FK_STREET_ETALONE
   * @param {String}  Obj.HOUSE
   * @param {String}  Obj.APPARTMENT
   * @param {String}  Obj.NumberFloor
   * @param {String  }  Obj.Podesd
   * @param {int}  Obj.AppealWorkId
   * @param {string}  Obj.AppealCmt
   * @param {string}  Obj.AppealWorkStatusName
   * @param {int}  Obj.AppealTypeId
   * @param {SmallInt}  Obj.IsEmergency
   * @param {int} Obj.AppurtenanceState
   * @param {int} Obj.id_sided_dispetcher
   * @param {int} Obj.AppealStatusId
   * @param {int} Obj.AppealWorkStatusId
   * @param {int} Obj.AppealCategoryId
   * @param {String} Obj.AppealCategoryName
   * @param {String} Obj.CategoryParentCd
   * @param {int} Obj.CustomerKindId
   * @param {SmallInt} Obj.IsPublic
   * @param {String} Obj.KontrolName
   * @param {Date} Obj.WorkDateBegin
   * @param {Date} Obj.WorkDateEnd
   * @param {Date} Obj.KontrolDate
   * @param {Date} Obj.PlanDateReglament
   * @param {Date} Obj.PlanDate
   * @param {Date} Obj.TimeToInformReglament
   * @param {Date} Obj.TimeToArriveReglament
   * @param {Date} Obj.timeToCheckReglament
   * @param {Date} Obj.timeToInform
   * @param {Date} Obj.timeToArrive
   * @param {Date} Obj.timeToCheck
   * @param {SmallInt*} Obj.oznakId
   * @param {Date} Obj.modifyDt
   * @param {string} Obj.uniqueid
   * @param {string} Obj.appealWorkCmt
   * @returns {Object<int, string> Error code, error number
   */
  async insertRequest({
    appealId,
    appealCd,
    appealDate,
    id_aux_opened,
    callerPhoneNumber,
    callerFullName,
    fK_REGION_ETALONE,
    fK_STREET_ETALONE,
    hOUSE,
    aPPARTMENT,
    numberFloor,
    podesd,
    appealWorkId,
    appealCmt,
    appealWorkStatusName,
    appealTypeId,
    isEmergency,
    appurtenanceState,
    id_sided_dispetcher,
    appealStatusId,
    appealWorkStatusId,
    appealCategoryId,
    appealCategoryCd,
    appealCategoryName,
    categoryParentCd,
    customerKindId,
    isPublic,
    kontrolName,
    workDateBegin,
    workDateEnd,
    kontrolDate,
    planDateReglament,
    planDate,
    timeToInformReglament,
    timeToArriveReglament,
    timeToCheckReglament,
    timeToInform,
    timeToArrive,
    timeToCheck,
    oznakId,
    modifyDt,
    uniqueid,
    appealWorkCmt,
    forOtherJeoMaxDate,
    forOtherJeoEnabledCnt,
  }) {
    id_aux_opened = 96;
    appurtenanceState = 26;
    if (!this.pool) {
      await this.connect();
    }
    try {
      const result = await this.pool
        .request()
        .input("AppealId", sql.Int, appealId)
        .input("AppealCd", sql.Int, appealCd)
        .input("AppealDate", sql.DateTime, appealDate)
        .input("id_aux_opened", sql.Int, id_aux_opened)
        .input("CallerPhoneNumber", sql.VarChar(20), callerPhoneNumber)
        .input("CallerFullName", sql.VarChar(120), callerFullName)
        .input("FK_REGION_ETALONE", sql.Int, fK_REGION_ETALONE)
        .input("FK_STREET_ETALONE", sql.Int, fK_STREET_ETALONE)
        .input("HOUSE", sql.VarChar(20), hOUSE)
        .input("APPARTMENT", sql.VarChar(100), aPPARTMENT)
        .input("NumberFloor", sql.VarChar(71), numberFloor)
        .input("Podesd", sql.VarChar(10), podesd)
        .input("AppealWorkId", sql.Int, appealWorkId)
        .input("AppealCmt", sql.VarChar(3000), appealCmt)
        .input("AppealWorkStatusName", sql.VarChar(130), appealWorkStatusName)
        .input("AppealTypeId", sql.Int, appealTypeId)
        .input("IsEmergency", sql.SmallInt, isEmergency)
        .input("id_sided_dispetcher", sql.Int, id_sided_dispetcher)
        .input("AppurtenanceState", sql.Int, appurtenanceState)
        .input("AppealStatusId", sql.Int, appealStatusId)
        .input("AppealWorkStatusId", sql.Int, appealWorkStatusId)
        .input("AppealCategoryId", sql.Int, appealCategoryId)
        .input("AppealCategoryCd", sql.VarChar(8), appealCategoryCd)
        .input("AppealCategoryName", sql.VarChar(40), appealCategoryName)
        .input("CategoryParentCd", sql.VarChar(4), categoryParentCd)
        .input("CustomerKindId", sql.Int, customerKindId)
        .input("IsPublic", sql.SmallInt, isPublic)
        .input("oznakId", sql.Int, oznakId)
        .input("KontrolName", sql.VarChar(40), kontrolName)
        .input("WorkDateBegin", sql.SmallDateTime, workDateBegin)
        .input("WorkDateEnd", sql.SmallDateTime, workDateEnd)
        .input("KontrolDate", sql.SmallDateTime, kontrolDate)
        .input("PlanDateReglament", sql.SmallDateTime, planDateReglament)
        .input("PlanDate", sql.SmallDateTime, planDate)
        .input(
          "TimeToInformReglament",
          sql.SmallDateTime,
          timeToInformReglament
        )
        .input(
          "TimeToArriveReglament",
          sql.SmallDateTime,
          timeToArriveReglament
        )
        .input(
          "TimeToCheckReglament",

          sql.SmallDateTime,
          timeToCheckReglament
        )
        .input("TimeToInform", sql.SmallDateTime, timeToInform)
        .input("TimeToArrive", sql.SmallDateTime, timeToArrive)
        .input("TimeToCheck", sql.SmallDateTime, timeToCheck)

        .input("modifyDt", sql.SmallDateTime, modifyDt)
        .input("uniqueid", sql.VarChar(30), uniqueid)
        .input("AppealWorkCmt", sql.VarChar(500), appealWorkCmt)
        .input("ForOtherJeoMaxDate", sql.SmallDateTime, forOtherJeoMaxDate)
        .input("ForOtherJeoEnabledCnt", sql.Int, forOtherJeoEnabledCnt)
        .output("error_number", sql.Int)
        .output("error_message", sql.VarChar(2048))
        .execute("sp_API_Import1562NewToRequest");
      return result.output;
    } catch (e) {
      console.log(e);
      this.logger.error(
        `${insertRequest}({
    ${appealId},
    ${appealCd},
    ${appealDate},` + e
      );
      return null;
    }
  }
  /**
   * updateAddress
   * MsSQlProcName = sp_API_Update1562AddressToRequest
   * @param {sp_API_Import1562NewToRequest} param0
   * @returns
   */
  async updateAddress({
    appealId,
    appealWorkId,
    appealDate /*DateReceivedRequest*/,

    callerPhoneNumber /*@phone*/,
    callerFullName /*@abonent*/,
    fK_REGION_ETALONE /*DistributionPointName*/,
    fK_STREET_ETALONE /*StreetCd*/,
    hOUSE /*""Building"+BuildingPart*/,
    aPPARTMENT /*Apartment*/,
    numberFloor /*FloorNumber*/,
    podesd /*Entrance*/,
    customerKindId /*Назва виду звернення (1- від фізичної особи, 2- від юридичної особи, 3- будинкове)*/,
    appealCmt /*@ABOUT*/,
    id_sided_dispetcher /*UserFIO*/,
    isPublic,
    oznakId,
    appealTypeId,
    isEmergency /* @AVAR                  char(2),*/,
    kontrolName,

    uniqueid,
    modifyDt,
  }) {
    try {
      if (!this.pool) {
        await this.connect();
      }
      const result = await this.pool
        .request()
        .input("AppealId", sql.Int, appealId)
        .input("AppealWorkId", sql.Int, appealWorkId)
        .input("AppealDate", sql.DateTime, appealDate)
        .input("CallerPhoneNumber", sql.VarChar(20), callerPhoneNumber)
        .input("CallerFullName", sql.VarChar(120), callerFullName)
        .input("FK_REGION_ETALONE", sql.Int, fK_REGION_ETALONE)
        .input("FK_STREET_ETALONE", sql.Int, fK_STREET_ETALONE)
        .input("HOUSE", sql.VarChar(20), hOUSE)
        .input("APPARTMENT", sql.VarChar(100), aPPARTMENT)
        .input("NumberFloor", sql.VarChar(17), numberFloor)
        .input("Podesd", sql.VarChar(10), podesd)

        .input("CustomerKindId", sql.Int, customerKindId)
        .input("AppealCmt", sql.VarChar(3000), appealCmt) /*@ABOUT*/
        .input("id_sided_dispetcher", sql.Int, id_sided_dispetcher)
        .input("IsPublic", sql.SmallInt, isPublic)
        .input("OznakId", sql.SmallInt, oznakId)
        .input("AppealTypeId", sql.SmallInt, appealTypeId)
        .input("IsEmergency", sql.SmallInt, isEmergency)
        .input("KontrolName", sql.VarChar(40), kontrolName)
        .input("uniqueid", sql.VarChar(30), uniqueid)
        .input("ModifyDt", sql.DateTime, modifyDt)
        .output("error_number", sql.Int)
        .output("error_message", sql.VarChar(2048))
        .execute("sp_API_Update1562AddressToRequest");
      return result.output;
    } catch (e) {
      console.log(e);
      this.logger.error(`updateAddress(${AppealId})` + e);
      return null;
    }
  }

  /**
   * MSSQLProc = sp_API_Update1562StatusesToRequest
   * @param {*} param0
   * @returns
   */
  async updateStatuses({
    appealId,
    appealWorkId,

    appealStatusId,
    appealWorkStatusId,

    isEmergency,

    workDateBegin,
    workDateEnd,
    kontrolDate,
    planDateReglament,
    planDate,

    timeToInformReglament,
    timeToArriveReglament,
    timeToCheckReglament,
    timeToInform,
    timeToArrive,
    timeToCheck,
    modifyDt,
    appealCmt,
    appealWorkCmt,
    forOtherJeoMaxDate,
    forOtherJeoEnabledCnt,
  }) {
    try {
      if (!this.pool) {
        await this.connect();
      }
      const result = await this.pool
        .request()
        .input("AppealId", sql.Int, appealId)
        .input("AppealWorkId", sql.Int, appealWorkId)
        .input("AppealStatusId", sql.Int, appealStatusId)
        .input("AppealWorkStatusId", sql.Int, appealWorkStatusId)
        .input("IsEmergency", sql.SmallInt, isEmergency)
        .input("WorkDateBegin", sql.DateTime, workDateBegin)
        .input("WorkDateEnd", sql.SmallDateTime, workDateEnd)
        .input("KontrolDate", sql.DateTime, kontrolDate)
        .input("PlanDateReglament", sql.DateTime, planDateReglament)
        .input("PlanDate", sql.DateTime, planDate)
        .input("TimeToInformReglament", sql.DateTime, timeToInformReglament)
        .input("TimeToArriveReglament", sql.DateTime, timeToArriveReglament)
        .input("TimeToCheckReglament", sql.DateTime, timeToCheckReglament)
        .input("TimeToInform", sql.DateTime, timeToInform)
        .input("TimeToArrive", sql.DateTime, timeToArrive)
        .input("TimeToCheck", sql.DateTime, timeToCheck)
        .input("ModifyDt", sql.DateTime, modifyDt)
        .input("AppealCmt", sql.VarChar(3000), appealCmt) /*@ABOUT*/
        .input("AppealWorkCmt", sql.VarChar(500), appealWorkCmt)
        .input("ForOtherJeoMaxDate", sql.DateTime, forOtherJeoMaxDate)
        .input("ForOtherJeoEnabledCnt", sql.Int, forOtherJeoEnabledCnt)
        .output("error_number", sql.Int)
        .output("error_message", sql.VarChar(2048))
        .execute("sp_API_Update1562StatusesToRequest");
      return result.output;
    } catch (e) {
      console.log(e);
      this.logger.error(`updateStatuses(${appealId})` + e);
      return { error_number: 100, error_message: e };
    }
  }
  /**updateRetake    *  MSSQLProcName = sp_API_Update1562In_AsNew
   *
   * @param {*} param0
   * @returns
   */
  async updateRetake({
    appealId,
    appealCd,
    appealDate,
    id_aux_opened,
    callerPhoneNumber,
    callerFullName,
    fK_REGION_ETALONE,
    fK_STREET_ETALONE,
    hOUSE,
    aPPARTMENT,
    numberFloor,
    podesd,
    appealWorkId,
    appealCmt,
    appealWorkStatusName,
    appealTypeId,
    isEmergency,
    appurtenanceState,
    id_sided_dispetcher,
    appealStatusId,
    appealWorkStatusId,
    appealCategoryId,
    appealCategoryCd,
    appealCategoryName,
    categoryParentCd,
    customerKindId,
    isPublic,
    kontrolName,
    workDateBegin,
    workDateEnd,
    kontrolDate,
    planDateReglament,
    planDate,
    timeToInformReglament,
    timeToArriveReglament,
    timeToCheckReglament,
    timeToInform,
    timeToArrive,
    timeToCheck,
    oznakId,
    modifyDt,
    uniqueid,
    forOtherJeoMaxDate,
    forOtherJeoEnabledCnt,
  }) {
    id_aux_opened = 96;
    appurtenanceState = 26;

    try {
      if (!this.pool) {
        await this.connect();
      }
      const result = await this.pool
        .request()
        .input("AppealId", sql.Int, appealId)
        .input("AppealCd", sql.Int, appealCd)
        .input("AppealDate", sql.DateTime, appealDate)
        .input("id_aux_opened", sql.Int, id_aux_opened)
        .input("CallerPhoneNumber", sql.VarChar(20), callerPhoneNumber)
        .input("CallerFullName", sql.VarChar(120), callerFullName)
        .input("FK_REGION_ETALONE", sql.Int, fK_REGION_ETALONE)
        .input("FK_STREET_ETALONE", sql.Int, fK_STREET_ETALONE)
        .input("HOUSE", sql.VarChar(20), hOUSE)
        .input("APPARTMENT", sql.VarChar(20), aPPARTMENT)
        .input("NumberFloor", sql.VarChar(71), numberFloor)
        .input("Podesd", sql.VarChar(10), podesd)
        .input("AppealWorkId", sql.Int, appealWorkId)
        .input("AppealCmt", sql.VarChar(3000), appealCmt)
        .input("AppealWorkStatusName", sql.VarChar(130), appealWorkStatusName)
        .input("AppealTypeId", sql.Int, appealTypeId)
        .input("IsEmergency", sql.SmallInt, isEmergency)
        .input("id_sided_dispetcher", sql.Int, id_sided_dispetcher)
        .input("AppurtenanceState", sql.Int, appurtenanceState)
        .input("AppealStatusId", sql.Int, appealStatusId)
        .input("AppealWorkStatusId", sql.Int, appealWorkStatusId)
        .input("AppealCategoryId", sql.Int, appealCategoryId)
        .input("AppealCategoryCd", sql.VarChar(8), appealCategoryCd)
        .input("AppealCategoryName", sql.VarChar(40), appealCategoryName)
        .input("CategoryParentCd", sql.VarChar(4), categoryParentCd)
        .input("CustomerKindId", sql.Int, customerKindId)
        .input("IsPublic", sql.SmallInt, isPublic)
        .input("oznakId", sql.Int, oznakId)
        .input("KontrolName", sql.VarChar(40), kontrolName)
        .input("WorkDateBegin", sql.SmallDateTime, workDateBegin)
        .input("WorkDateEnd", sql.SmallDateTime, workDateEnd)
        .input("KontrolDate", sql.SmallDateTime, kontrolDate)
        .input("PlanDateReglament", sql.SmallDateTime, planDateReglament)
        .input("PlanDate", sql.SmallDateTime, planDate)
        .input(
          "TimeToInformReglament",
          sql.SmallDateTime,
          timeToInformReglament
        )
        .input(
          "TimeToArriveReglament",
          sql.SmallDateTime,
          timeToArriveReglament
        )
        .input(
          "TimeToCheckReglament",

          sql.SmallDateTime,
          timeToCheckReglament
        )
        .input("TimeToInform", sql.SmallDateTime, timeToInform)
        .input("TimeToArrive", sql.SmallDateTime, timeToArrive)
        .input("TimeToCheck", sql.SmallDateTime, timeToCheck)

        .input("modifyDt", sql.SmallDateTime, modifyDt)
        .input("uniqueid", sql.VarChar(30), uniqueid)
        .output("error_number", sql.Int)
        .output("error_message", sql.VarChar(2048))
        .execute("sp_API_Update1562In_AsNew");
      return result.output;
    } catch (e) {
      console.log(e);
      this.logger.error(`updateRetake ${appealId}` + e);
      return null;
    }
  }

  // MsSqlProcName = sp_API_Removed1562
  async setRequestRemoved({ appealWorkId, remove /* 0,1*/ }) {
    try {
      if (!this.pool) {
        await this.connect();
      }
      const result = await this.pool
        .request()
        .input("appealWorkID", sql.Int, appealWorkId)
        .input("remov", sql.Int, remove)
        .output("error_number", sql.Int)
        .output("error_message", sql.VarChar(2048))
        .execute("sp_API_Removed1562");
      return result.output;
    } catch (e) {
      console.log(e);
      this.logger.error(`setRequestRemoved(${appealId})` + e);
      return null;
    }
  }
}
