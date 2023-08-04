Object.defineProperty(exports, "__esModule", { value: true });
const define_1 = require("./define");
const database_1 = require("./lib/database");
const schema_1 = require("./lib/schema");
const cache_1 = require("./lib/cache");
/**
 * nbframe-storage manager database
 */
class Storage {
    constructor() {
        this.databaseMap = new Map();
        this.schema = new schema_1.Schema();
        this.driveModule = {};
        this.localCache = [];
    }
    /**
     * use an new cache object
     * @param max set cache limit max count, default max(100,000).
     * @param mode set cache policy mode.
     * @param timerInveral set cache timer check interval second, default 1s.
     * @returns return an single Cache object.
     * @example
     * import NbframeStorage, { Cache } from 'nbframe-storage'
     * let storage = new NbframeStorage();
     * let configCache = storage.cache(100);
     * configCache.set('app.title','hello');
     * let configCache2 = storage.cache(100, CachePolicyMode.None);
     */
    cache(max = 100000, mode = define_1.CachePolicyMode.LRU, timerInveral = 1000) {
        if (max < 1) {
            throw `max:${max} param range out.`;
        }
        let obj = new cache_1.Cache(max, mode, timerInveral);
        this.localCache.push(obj);
        return obj;
    }
    /**
     * clear all Cache object of only this storage.
     */
    clearCache() {
        this.localCache.forEach(cache => {
            cache && cache.clear();
        });
    }
    /**
     * configure an database settings.
     * @param databaseId databaseId
     * @param settings settings
     * @example
     * import mysql = require('mysql');
     * import redis = require('redis');
     * import NbframeStorage, { Cache } from 'nbframe-storage'
     * let storage = new NbframeStorage();
     * storage.driveModule.mysql = mysql;
     * storage.driveModule.redis = redis;
     * let configRedis = [{drive:"redis", host:"localhost"}];
     * let db = storage.configure("redis-1", configRedis);
     * db.checkConnect((err)=>{}, ()=>{});
     *
     * # 使用原生驱动
     * let client = db.dispatch().adapter;
     * client.ZINCRBY("mainKey", 1234, '{userid:"1001"}', (res)=>{
     *    let new_scoe = res;
     * });
     */
    configure(databaseId, settings) {
        let database;
        if (!databaseId) {
            throw new Error('no "databaseId" param.');
        }
        if (!settings || settings.length == 0) {
            throw new Error('no "settings" param.');
        }
        database = this.databaseMap.get(databaseId);
        if (!database) {
            let first = settings[0];
            database = new database_1.Database(this, databaseId, first);
            this.databaseMap.set(databaseId, database);
        }
        settings.forEach(s => {
            database.addCluster(s);
        });
        return database;
    }
    /**
     * get database
     * @param databaseId
     * @returns
     */
    getDatabase(databaseId) {
        if (!databaseId) {
            throw new Error('no "databaseId" param.');
        }
        return this.databaseMap.get(databaseId);
    }
    /**
     * connect and add an database settings.
     * @param databaseId
     * @param settings
     * @example
     * import mysql = require('mysql');
     * import redis = require('redis');
     * const { ClickHouse } = require('clickhouse');
     * import NbframeStorage, { Cache } from 'nbframe-storage'
     * let storage = new NbframeStorage();
     * storage.driveModule.mysql = mysql;
     * storage.driveModule.redis = redis;
     * storage.driveModule.clickhouse = ClickHouse;
     * let configRedis = [{drive:"redis", host:"localhost"}];
     * storage.configure("redis-1", configRedis);
     *
     * let db = storage.connect("redis-1");
     * let res = db && db.newAutoUUID();
     */
    connect(databaseId, fail) {
        if (!databaseId) {
            throw new Error('no "databaseId" param.');
        }
        let database = this.databaseMap.get(databaseId);
        if (!database)
            throw new Error("Not found database instance id:\"" + databaseId + "\", please call init function first.");
        database.checkConnect(fail);
        return database;
    }
}
exports.Storage = Storage;
exports.default = Storage;
