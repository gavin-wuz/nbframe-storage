import Storage from "../storage";
import { DbSettings, QueryArgs, QueryCallback, QueryResult, QueryFlag, EntityId, CommandString, CommandOptions } from "../define";
import { DbAdapter } from "./dbadapter";
/**
 * database manager
 */
export declare class Database {
    private readonly storage;
    private clusterKeys;
    private masterKeys;
    private tenantMap;
    private clusters;
    /** database Id */
    databaseId: string;
    /**
     * init database.
     * @param storage storage
     * @param databaseId databaseId
     * @param settings settings
     */
    constructor(storage: Storage, databaseId: string, settings: DbSettings);
    private getSettingsHashId(settings);
    /**
     * add database cluster settings.
     */
    addCluster(settings: DbSettings): void;
    /**
     * dispatch an database adapter object.
     */
    dispatchMaster(flag?: QueryFlag): DbAdapter;
    /**
     * dispatch an database adapter object.
     */
    dispatch(flag?: QueryFlag): DbAdapter;
    /**
     * check and try connect database, use `storage.connectError` when connect has error.
     */
    checkConnect(fail?: (err: any, msg: string) => void, success?: (adapter: DbAdapter) => void): void;
    /**
     * disconnect
     */
    disconnect(): void;
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
    query(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag, callback?: QueryCallback): Promise<QueryResult>;
    /**
     * query an command, it not support mysql.
     * @param {CommandString} cmd cmd syntax string.
     * @param {QueryArgs} args cmd command format params.
     * @param {QueryFlag} flag cmd command flag vars.
     * @param {QueryCallback} callback command result callback function, allow null then use 'async/await' mode result.
     * @returns return promise<record[]>
     */
    queryOne(cmd: CommandString, args?: CommandOptions, flag?: QueryFlag, callback?: QueryCallback): Promise<QueryResult>;
    /**
     * query an command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Object} flag cmd command flag vars.
     * @returns return promise<record[]>
     */
    queryAsync(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag): Promise<QueryResult>;
    /**
     * get count
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @param callback command result callback function, allow null then use 'async/await' mode result.
     * @returns return promise<number>
     */
    count(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag, callback?: QueryCallback): Promise<QueryResult>;
    /**
     * get count
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @returns return promise<number>
     */
    countAsync(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag): Promise<QueryResult>;
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
    add(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag, callback?: QueryCallback): Promise<QueryResult>;
    /**
     * add
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @returns QueryResult
     */
    addAsync(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag): Promise<QueryResult>;
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
    setOrAdd(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag, callback?: QueryCallback): Promise<QueryResult>;
    /**
     * set data when it not exist add
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @returns QueryResult
     */
    setOrAddAsync(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag): Promise<QueryResult>;
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
    remove(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag, callback?: QueryCallback): Promise<QueryResult>;
    /**
      * remove
      * @param cmd cmd syntax string.
      * @param args cmd command format params.
      * @param flag cmd command flag vars.
      * @param callback command result callback function, allow null then use 'async/await' mode result.
      */
    removeOne(cmd: CommandString, args?: CommandOptions, flag?: QueryFlag, callback?: QueryCallback): Promise<QueryResult>;
    /**
     * remove
     * @param cmd cmd syntax string.
     * @param args cmd command format params.
     * @param flag cmd command flag vars.
     * @returns QueryResult
     */
    removeAsync(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag): Promise<QueryResult>;
    /**
     * excute an command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Object} flag cmd command flag vars.
     * @param {Function} callback command result callback function, allow null then use 'async/await' mode result.
     */
    command(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag, callback?: QueryCallback): Promise<QueryResult>;
    /**
     * excute an command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd sql syntax or collection or key.
     * @param {Array} args cmd command format params.
     * @param {Object} flag cmd command flag vars.
     */
    commandAsync(cmd: CommandString, args?: QueryArgs | CommandOptions, flag?: QueryFlag): Promise<QueryResult>;
    /**
     * create an 36 length uuid code
     */
    newAutoUUID(flag?: QueryFlag): EntityId;
    /**
     * create an 24 length object id, it is need mongodb drive.
     */
    newAutoObjectID(): EntityId;
    /**
     * create an inc number id, it is need redis drive.
     * @example
     * database.newAutoRedisInc("mykey",{}, 2).then(res=>{
     *  console.log(res);
     * })
     */
    newAutoRedisInc(key: string, flag?: QueryFlag, incr?: number): Promise<EntityId>;
    /**
     * parseEntityId
     * @param id id
     * @param flag flag
     */
    parseEntityId(id: EntityId, flag?: QueryFlag): any;
}
