Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
/**
 * SQL command interface.
 */
class DbAdapter {
    constructor(schema, settings) {
        /**
         * check database is connected.
         */
        this.connected = false;
        /** conect is callback reply */
        this.connectReply = undefined;
        this.schema = schema;
        this.settings = settings;
    }
    /**
     * get drive adapter
     * @example
     * db.adapter.add();
     */
    get adapter() {
        return this.client;
    }
    /**
     * newAutoUUID
     */
    newAutoUUID() {
        return uuid.v1();
    }
    /**
     * newAutoObjectID
     */
    newAutoObjectID() {
        throw new Error("Not found mongodb driver.");
    }
    /**
     * newAutoId
     */
    newAutoRedisInc(key, incr) {
        throw new Error("Not found redis driver, key:" + key + ', incr=' + incr);
    }
}
exports.DbAdapter = DbAdapter;
