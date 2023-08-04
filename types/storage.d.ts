import { ConnectCallback, DbSettings, DriveModule, CachePolicyMode } from "./define";
import { Database } from "./lib/database";
import { Schema } from "./lib/schema";
import { Cache } from "./lib/cache";
/**
 * nbframe-storage manager database
 */
export declare class Storage {
    private databaseMap;
    private localCache;
    readonly schema: Schema;
    connectError: ConnectCallback;
    /**
     * database drive module.
     */
    driveModule: DriveModule;
    constructor();
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
    cache(max?: number, mode?: CachePolicyMode, timerInveral?: number): Cache;
    /**
     * clear all Cache object of only this storage.
     */
    clearCache(): void;
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
    configure(databaseId: string, settings: DbSettings[]): Database;
    /**
     * get database
     * @param databaseId
     * @returns
     */
    getDatabase(databaseId: string): Database;
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
    connect(databaseId: string, fail?: (err: any, msg?: string) => void): Database;
}
export default Storage;
