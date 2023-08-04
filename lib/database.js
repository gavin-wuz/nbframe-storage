Object.defineProperty(exports, "__esModule", { value: true });
const define_1 = require("../define");
const utils_1 = require("./utils");
const mysql_1 = require("./adapters/mysql");
// import Postgres from "./adapters/postgres";
const mongodb_1 = require("./adapters/mongodb");
const redis_1 = require("./adapters/redis");
const clickhouse_1 = require("./adapters/clickhouse");
/**
 * database manager
 */
class Database {
    /**
     * init database.
     * @param storage storage
     * @param databaseId databaseId
     * @param settings settings
     */
    constructor(storage, databaseId, settings) {
        this.clusterKeys = [];
        this.masterKeys = [];
        this.tenantMap = {};
        this.storage = storage;
        this.databaseId = databaseId;
        this.clusters = new Map();
        this.addCluster(settings);
    }
    getSettingsHashId(settings) {
        return utils_1.default.hashCode(`${settings.driver}${settings.host}${settings.port}`);
    }
    /**
     * add database cluster settings.
     */
    addCluster(settings) {
        let adapter;
        let driver = (settings.driver || '').toLowerCase();
        let hashId = this.getSettingsHashId(settings);
        if (this.clusters.has(hashId))
            return;
        switch (driver) {
            case define_1.DbType[define_1.DbType.mysql]:
                let mysqlDrive = this.storage.driveModule.mysql;
                adapter = new mysql_1.default(mysqlDrive, this.storage.schema, settings, this.storage.connectError).initialize();
                break;
            // case DbType[DbType.postgres]:
            //     adapter = new Postgres();
            //     break;
            case define_1.DbType[define_1.DbType.clickhouse]:
                let clickhouseDrive = this.storage.driveModule.clickhouse;
                adapter = new clickhouse_1.default(clickhouseDrive, this.storage.schema, settings, this.storage.connectError).initialize();
                break;
            case define_1.DbType[define_1.DbType.mongodb]:
                let mongodbDrive = this.storage.driveModule.mongodb;
                adapter = new mongodb_1.default(mongodbDrive, this.storage.schema, settings, this.storage.connectError).initialize();
                break;
            case define_1.DbType[define_1.DbType.redis]:
                let redislDrive = this.storage.driveModule.redis;
                adapter = new redis_1.default(redislDrive, this.storage.schema, settings, this.storage.connectError).initialize();
                break;
            default:
                /* istanbul ignore next */
                throw new Error(`Not support database drive:"${driver}".`);
        }
        this.clusters.set(hashId, adapter);
        if (settings.tenantMode && settings.tenantId && settings.tenantMode == define_1.TenantMode.Database) {
            // use owner database of tenant
            if (!this.tenantMap[settings.tenantId]) {
                this.tenantMap[settings.tenantId] = {
                    masterKeys: [],
                    clusterKeys: []
                };
            }
            let tenant = this.tenantMap[settings.tenantId];
            settings.master && tenant.masterKeys.push(hashId) ||
                tenant.clusterKeys.push(hashId);
            return;
        }
        if (settings.master) {
            this.masterKeys.push(hashId);
        }
        else {
            this.clusterKeys.push(hashId);
        }
    }
    /**
     * dispatch an database adapter object.
     */
    dispatchMaster(flag) {
        let hashId = flag && flag.hashId || 0;
        if (flag && flag.tenantId && this.tenantMap[flag.tenantId]) {
            let tenant = this.tenantMap[flag.tenantId];
            let index = hashId ? hashId % tenant.masterKeys.length : 0;
            return this.clusters.get(tenant.masterKeys[index]);
        }
        if (this.masterKeys.length == 0)
            return undefined;
        let index = hashId ? hashId % this.masterKeys.length : 0;
        return this.clusters.get(this.masterKeys[index]);
    }
    /**
     * dispatch an database adapter object.
     */
    dispatch(flag) {
        let hashId = flag && flag.hashId || 0;
        if (flag && flag.tenantId && this.tenantMap[flag.tenantId]) {
            let tenant = this.tenantMap[flag.tenantId];
            let index = hashId ? hashId % tenant.clusterKeys.length : 0;
            return this.clusters.get(tenant.clusterKeys[index]);
        }
        if (this.clusterKeys.length == 0)
            return undefined;
        let index = hashId ? hashId % this.clusterKeys.length : 0;
        return this.clusters.get(this.clusterKeys[index]);
    }
    /**
     * check and try connect database, use `storage.connectError` when connect has error.
     */
    checkConnect(fail, success) {
        let self = this;
        process.nextTick(() => {
            //延迟检查，防止初始化还未完成
            self.clusters.forEach(adapter => {
                adapter.connect()
                    .then(() => {
                    typeof success == 'function' && success(adapter);
                })
                    .catch((err) => {
                    let msg = `check driver:${adapter.settings.driver || ''} connect '${adapter.settings.host || ''}:${adapter.settings.port || -1}' at '${adapter.settings.database || ''} database'`;
                    if (fail) {
                        fail && fail(err, msg);
                    }
                    else {
                        /* istanbul ignore next */
                        self.storage.connectError && self.storage.connectError(err, msg);
                    }
                });
            });
        });
    }
    /**
     * disconnect
     */
    disconnect() {
        this.clusters.forEach(adapter => {
            adapter.disconnect();
        });
    }
    /**
     * query an command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {QueryArgs} args cmd command format params.
     * @param {QueryFlag} flag cmd command flag vars.
     * @param {QueryCallback} callback command result callback function, allow null then use 'async/await' mode result.
     * @returns return promise<record[]>
     * @example
     * let storage = new NbframeStorage();
     * storage.driveModule.mysql = mysql;
     * storage.driveModule.mongodb = mongodb;
     * storage.driveModule.redis = redis;
     * storage.driveModule.clickhouse = clickhouse;
     *
     * storage.configure("databaseId1", config.mysql.cluster);
     * storage.configure("databaseId2", config.mongodb.cluster);
     * storage.configure("databaseId3", config.redis.cluster);
     * storage.configure("databaseId3", config.clickhouse.cluster);
     * // mysql
     * let database = storage.connect("databaseId1");
     * database.query("select 1",undefined, undefined, (err, res) => {
     *   if(err) return console.error(err);
     *   console.debug(res);
     * });
     * //async query
     * let res = await database.query("select 1");
     * console.debug(res);
     *
     * // mongodb
     * database = storage.connect("databaseId2");
     * database.query('account', {
     *           filter: {
     *               where: { nickname: 'hello',age:{$gt:10} }
     *           }
     *        }, undefined, (err, res) => {
     *
     *        });
     * let res = await database.query('account', {
     *           multi:true,
     *           filter: {
     *               where: { nickname: 'hello' },
     *               order:{score:-1},
     *               limit:20,
     *               skip:0,
     *               offset:10
     *           });
     * let data = (res as any[]);
     *
     * // redis
     * database = storage.connect("databaseId3");
     * databae.queryOne('mykey', { mode:CommandMode.String })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.query(['mykey1','mykey2'], { mode:CommandMode.String })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.query(['hashkey1','hashkey2'], { mode:CommandMode.Hash })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.query('mylist', { mode:CommandMode.List, filter:{offset:0, limit:10} })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.query('myhash', { mode:CommandMode.Hash, filter:{id:'second key'} })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.query('myset', { mode:CommandMode.Set, filter:{random:true, limit:10} })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * // return val and score when score = [10-100] and top 10
     * databae.query('myzset', { mode:CommandMode.SortSet, filter:{ where:{ withscores:true, min:10, max:100}, offset:0,limit:10 })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * //return val when use rank =[0-10]
     * databae.query('myzset', { mode:CommandMode.SortSet, filter:{ where:{ withscores:true, min:10, max:100}, offset:0,limit:10 })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * // return score when use val
     * databae.query('myzset', { mode:CommandMode.SortSet, filter:{ id:"myval",where:{ withscores:true}})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * // return rank when use val
     * databae.query('myzset', { mode:CommandMode.SortSet, filter:{ id:"myval"})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * // return rank with score when use rank [0-10]
     * databae.query('myzset', { mode:CommandMode.SortSet, score:1, filter:{ offset:0, limit:10})
     *   .then(res=>{})
     *   .catch(err=>{});
     */
    query(cmd, args, flag, callback) {
        let adapter = this.dispatch(flag) || this.dispatchMaster(flag);
        if (!callback)
            return adapter && adapter.queryAsync(cmd, args) || define_1.UndefinedPromiseError('database.query()');
        adapter && adapter.query(cmd, args, callback);
        return define_1.IdlePromiseResult();
    }
    /**
     * query an command, it not support mysql.
     * @param {CommandString} cmd cmd syntax string.
     * @param {QueryArgs} args cmd command format params.
     * @param {QueryFlag} flag cmd command flag vars.
     * @param {QueryCallback} callback command result callback function, allow null then use 'async/await' mode result.
     * @returns return promise<record[]>
     */
    queryOne(cmd, args, flag, callback) {
        let adapter = this.dispatch(flag) || this.dispatchMaster(flag);
        if (args) {
            args.multi = false;
        }
        if (!callback)
            return adapter && adapter.queryAsync(cmd, args) || define_1.UndefinedPromiseError('database.queryOne()');
        adapter && adapter.query(cmd, args, callback);
        return define_1.IdlePromiseResult();
    }
    /**
     * query an command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Object} flag cmd command flag vars.
     * @returns return promise<record[]>
     */
    queryAsync(cmd, args, flag) {
        let adapter = this.dispatch(flag) || this.dispatchMaster(flag);
        return adapter && adapter.queryAsync(cmd, args) || define_1.UndefinedPromiseError('database.queryAsync()');
    }
    /**
     * get count
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @param callback command result callback function, allow null then use 'async/await' mode result.
     * @returns return promise<number>
     */
    count(cmd, args, flag, callback) {
        let adapter = this.dispatch(flag) || this.dispatchMaster(flag);
        if (!callback)
            return adapter && adapter.countAsync(cmd, args) || define_1.UndefinedPromiseError('database.count()');
        adapter && adapter.count(cmd, args, callback);
        return define_1.IdlePromiseResult();
    }
    /**
     * get count
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @returns return promise<number>
     */
    countAsync(cmd, args, flag) {
        let adapter = this.dispatch(flag) || this.dispatchMaster(flag);
        return adapter && adapter.countAsync(cmd, args) || define_1.UndefinedPromiseError('database.countAsnyc()');
    }
    /**
     * add
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @param callback command result callback function, allow null then use 'async/await' mode result.
     * @returns promise<QueryResult>
     * @example
     * // mysql
     * let database = storage.connect("databaseId1");
     * let sql = 'INSERT INTO `account`(`nickname`,`create_time`) VALUES(?, FROM_UNIXTIME(?))'
     * database.add(sql, ['hello', (Date.now() / 1000)], undefined, (err, res) => {
     *   if(err) return console.error(err);
     *   console.debug(res.insertId);
     * });
     * //async
     * let res = await database.add(sql, ['hello', (Date.now() / 1000)]);
     * console.debug(res.changedRows);
     *
     * // mongodb
     * database = storage.connect("databaseId2");
     * database.add('account', {
     *           entity: {
     *             nickname: 'hello',
     *             age: 10
     *           }
     *        }, undefined, (err, res) => {
     *
     *        });
     * let res = await database.add('account', {
     *           entity: [{
     *             nickname: 'hello',
     *             age: 10
     *           },{
     *             nickname: 'mairy',
     *             age: 20
     *           }]
     *           });
     * console.debug(res.changedRows);
     *
     * // redis
     * database = storage.connect("databaseId3");
     * databae.add('mykey', { mode:CommandMode.String, entity:'hello', expired:123456 })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.add('mylist', { mode:CommandMode.List, entity:['hello1','hello2'] })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.add('hashkey', { mode:CommandMode.Hash, fields:['sub1','sub2'] entity:['hello1','hello2']})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.add('myzset', { mode:CommandMode.SortSet, entity:['hello1','hello2'],score:[10,20] })
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     */
    add(cmd, args, flag, callback) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        if (!callback)
            return adapter && adapter.addAsync(cmd, args) || define_1.UndefinedPromiseError('database.add()');
        adapter && adapter.add(cmd, args, callback);
        return define_1.IdlePromiseResult();
    }
    /**
     * add
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @returns QueryResult
     */
    addAsync(cmd, args, flag) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        return adapter && adapter.addAsync(cmd, args) || define_1.UndefinedPromiseError('database.addAsync()');
    }
    /**
     * set data when it not exist add
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @param callback command result callback function, allow null then use 'async/await' mode result.
     * @returns promise<QueryResult>
     * @example
     * // mysql
     * let database = storage.connect("databaseId1");
     * let sql = 'INSERT INTO `account`(`nickname`,`create_time`) VALUES(?, FROM_UNIXTIME(?)) ON DUPLICATE KEY UPDATE `create_time`=VALUES(`create_time`)'
     * database.setOrAdd(sql, ['hello', (Date.now() / 1000)], undefined, (err, res) => {
     *   if(err) return console.error(err);
     *   console.debug(res.insertId);
     * });
     * //async
     * let res = await database.setOrAdd(sql, ['hello', (Date.now() / 1000)]);
     * console.debug(res.changedRows);
     *
     * // mongodb
     * database = storage.connect("databaseId2");
     * // only upset one record.
     * database.setOrAdd('account', {
     *           upsert: {
     *             nickname: 'hello',
     *             age: 10
     *           },
     *           filter:{ id:10001},
     *           multi:false
     *        }, undefined, (err, res) => {
     *
     *        });
     * // default upset mutil record.
     * let res = await database.setOrAdd('account', {
     *           upsert: {
     *             nickname: 'hello',
     *             age: 10
     *           },
     *           filter:{ where:{ age:{'$gt':10}}}
     *           });
     * console.debug(res.changedRows);
     *
     * // redis
     * database = storage.connect("databaseId3");
     * databae.setOrAdd(['mykey1','mykey2'], { mode:CommandMode.String, upsert:['hello1','hello2']})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.setOrAdd('mykey', { mode:CommandMode.String, upsert:'newkey',expired:123456})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * //rename key
     * databae.setOrAdd(['mykey1'], { mode:CommandMode.Key, upsert:'newkey'})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.setOrAdd('hashkey', { mode:CommandMode.Hash,fields:['subkey1','subkey2'], upsert:['hello1','hello2']})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * //upset index=1 item value
     * databae.setOrAdd('listkey', { mode:CommandMode.List, upsert:'hello',filter:{offset:1}})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.setOrAdd(['setkey'], { mode:CommandMode.Set, upsert:['hello1','hello2']})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.setOrAdd(['zsetkey'], { mode:CommandMode.SortSet, upsert:['hello1','hello2'],score:[10,20]})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     */
    setOrAdd(cmd, args, flag, callback) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        if (!callback)
            return adapter && adapter.setOrAddAsync(cmd, args) || define_1.UndefinedPromiseError('database.setOrAdd()');
        adapter && adapter.setOrAdd(cmd, args, callback);
        return define_1.IdlePromiseResult();
    }
    /**
     * set data when it not exist add
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @returns QueryResult
     */
    setOrAddAsync(cmd, args, flag) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        return adapter && adapter.setOrAddAsync(cmd, args) || define_1.UndefinedPromiseError('database.setOrAddAsync()');
    }
    /**
     * remove
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @param callback command result callback function, allow null then use 'async/await' mode result.
     * @returns promise<QueryResult>
     * @example
     * // mysql
     * let database = storage.connect("databaseId1");
     * let sql = 'DELETE FROM `account` WHERE `nickname`=?'
     * database.remove(sql, ['hello'], undefined, (err, res) => {
     *   if(err) return console.error(err);
     *   console.debug(res.insertId);
     * });
     * //async
     * let res = await database.remove(sql, ['hello']);
     * console.debug(res.changedRows);
     *
     * // mongodb
     * database = storage.connect("databaseId2");
     * // only upset one record.
     * database.remove('account', {
     *           filter:{ id:10001},
     *           multi:false
     *        }, undefined, (err, res) => {
     *
     *        });
     * // default upset mutil record.
     * let res = await database.remove('account', {
     *           filter:{ where:{ age:{'$gt':10}}}
     *           });
     * console.debug(res.changedRows);
     *
     * // redis
     * database = storage.connect("databaseId3");
     * databae.remove(['mykey1','mykey2'], { mode:CommandMode.String})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * //remove after at expired
     * databae.remove('mykey', { mode:CommandMode.String, expired:123456})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * //delete keys
     * databae.remove(['mykey1'], { mode:CommandMode.Key})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.remove('hashkey', { mode:CommandMode.Hash,fields:['subkey1','subkey2']})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * //upset index=1 item value
     * databae.remove('listkey', { mode:CommandMode.List,entity:'hello', filter:{limit:1}})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.remove(['setkey'], { mode:CommandMode.Set, entity:['hello1','hello2']})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * databae.remove(['zsetkey'], { mode:CommandMode.SortSet, entity:['hello1','hello2']})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * // remove with score
     * databae.remove(['zsetkey'], { mode:CommandMode.SortSet, filter:{where:{ withscores:true, min:10, max:100}}})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     * // remove with rankno
     * databae.remove(['zsetkey'], { mode:CommandMode.SortSet, filter:{where:{ min:1, max:2}}})
     *   .then(res=>{})
     *   .catch(err=>{});
     *
     */
    remove(cmd, args, flag, callback) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        if (!callback)
            return adapter && adapter.removeAsync(cmd, args) || define_1.UndefinedPromiseError('database.remove()');
        adapter && adapter.remove(cmd, args, callback);
        return define_1.IdlePromiseResult();
    }
    /**
      * remove
      * @param cmd cmd syntax string.
      * @param args cmd command format params.
      * @param flag cmd command flag vars.
      * @param callback command result callback function, allow null then use 'async/await' mode result.
      */
    removeOne(cmd, args, flag, callback) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        if (args) {
            args.multi = false;
        }
        if (!callback)
            return adapter && adapter.removeAsync(cmd, args) || define_1.UndefinedPromiseError('database.removeOne()');
        adapter && adapter.remove(cmd, args, callback);
        return define_1.IdlePromiseResult();
    }
    /**
     * remove
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @returns QueryResult
     */
    removeAsync(cmd, args, flag) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        return adapter && adapter.removeAsync(cmd, args) || define_1.UndefinedPromiseError('database.removeAsync()');
    }
    /**
     * excute an command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Object} flag cmd command flag vars.
     * @param {Function} callback command result callback function, allow null then use 'async/await' mode result.
     */
    command(cmd, args, flag, callback) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        if (!callback)
            return adapter && adapter.commandAsync(cmd, args) || define_1.UndefinedPromiseError('database.command()');
        adapter && adapter.command(cmd, args, callback);
        return define_1.IdlePromiseResult();
    }
    /**
     * excute an command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd sql syntax or collection or key.
     * @param {Array} args cmd command format params.
     * @param {Object} flag cmd command flag vars.
     */
    commandAsync(cmd, args, flag) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        return adapter && adapter.commandAsync(cmd, args) || define_1.UndefinedPromiseError('database.commandAsync()');
    }
    /**
     * create an 36 length uuid code
     */
    newAutoUUID(flag) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        return adapter && adapter.newAutoUUID();
    }
    /**
     * create an 24 length object id, it is need mongodb drive.
     */
    newAutoObjectID() {
        let mongodb = this.storage.driveModule.mongodb;
        if (!mongodb)
            throw "Not found mongodb drive.";
        return mongodb.ObjectID().toString();
    }
    /**
     * create an inc number id, it is need redis drive.
     * @example
     * database.newAutoRedisInc("mykey",{}, 2).then(res=>{
     *  console.log(res);
     * })
     */
    newAutoRedisInc(key, flag, incr) {
        incr = incr || 1;
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        if (!adapter)
            throw "Not found redis drive.";
        return adapter && adapter.newAutoRedisInc(key, incr);
    }
    /**
     * parseEntityId
     * @param id id
     * @param flag flag
     */
    parseEntityId(id, flag) {
        let adapter = this.dispatchMaster(flag) || this.dispatch(flag);
        return adapter && adapter.parseEntityId(id);
    }
}
exports.Database = Database;
