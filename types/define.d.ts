/// <reference types="node" />
/**
 * database type.
 */
export declare enum DbType {
    unknow = 0,
    mysql = 1,
    postgres = 2,
    /** nosql */
    clickhouse = 7,
    /** nosql-mongodb */
    mongodb = 8,
    /** nosql-redis */
    redis = 9,
}
/** database drive module */
export interface DriveModule {
    /** mysql module third drive */
    mysql?: any;
    /** postgres module third drive */
    postgres?: any;
    /** mongodb module third drive */
    mongodb?: any;
    /** redis module third drive */
    redis?: any;
    /** clickhouse module third drive */
    clickhouse?: any;
}
export interface MongodbConfig {
    host: string | string[];
    port: number | number[];
    database: string;
    username?: string;
    password?: string;
    replSet?: string;
    safe?: boolean;
}
export interface RedisConfig {
    host: string | string[];
    port: number | number[];
    db: number;
    password?: string;
    url?: string;
    /** e.g. ```namespace:test``` */
    prefix?: string;
    tls?: TlsConfig;
    /**connect timeout ms */
    connect_timeout?: number;
}
export interface TlsConfig {
    pfx?: string | string[] | Buffer | Buffer[] | Object[];
    key?: string | string[] | Buffer | Buffer[] | Object[];
    cert?: string | string[] | Buffer | Buffer[];
    ca?: string | string[] | Buffer | Buffer[];
    requestCert?: boolean;
}
/**
 * define database adapter connect settings.
 */
export interface DbSettings {
    driver: string;
    master?: boolean;
    url?: string;
    replset?: string;
    host: string;
    port?: number;
    database: string | number;
    username?: string;
    password?: string;
    pool?: boolean;
    auth?: string;
    prefix?: string;
    charset?: string;
    acquireTimeout?: number;
    connectTimeout?: number;
    connectionLimit?: number;
    queueLimit?: number;
    timezone?: string;
    maxConnectErrorCount?: number;
    dateStrings?: boolean;
    debug?: boolean;
    multipleStatements?: boolean;
    ssl?: TlsConfig;
    waitForConnections?: boolean;
    autoReconnect?: boolean;
    tenantMode?: TenantMode;
    tenantId?: string;
    /** clickhouse */
    path?: string;
    readonly?: boolean;
    dataObjects?: boolean;
    /** setting of ch or mysql drive */
    option?: any;
}
/**
 * SQL command result interface
 */
export interface QueryResult {
    /** insert return auto inc-id. */
    insertId?: EntityId | EntityId[];
    /** update command changed rows */
    changedRows?: number;
    /** select/update/delete match rows */
    affectedRows?: number;
    /** clickhouse insert result */
    r?: number;
}
export declare enum TenantMode {
    /** not mutil tenant */
    None = 0,
    /** one an tenant use one of schema */
    Schema = 1,
    /** one an tenant use one of database */
    Database = 2,
    /** mutil tenant use same of table */
    Shared = 3,
}
/** Quary flag vars */
export interface QueryFlag {
    /** multi tenant  */
    tenantId?: string;
    /** cluster dispatch var */
    hashId?: number;
}
/** set min or max for redis when use SortSet model */
export interface WhereRange {
    /** max:"-inf" */
    min?: number | string;
    /** max:"+inf" */
    max?: number | string;
    /** use scores match result of redis */
    withscores?: boolean;
}
/** */
export interface QueryFilter {
    /**
     * match primary key
     */
    id?: EntityId;
    /**
     * match filter condion, typeof(WhereRange) is redis usage
     * @example
     * //redis usage
     * zset ex: ZREMRANGEBYSCORE('key',{withscores:true,min:1,max:100})
     *
     * //mongodb usage
     * ex: {name:"tom",age:{$gt:10}}
    */
    where?: WhereRange | any;
    /**
     * only sort of mongodb
     * @example
     * score asc ex:{score:1}
     * score desc ex:{score:-1}
     */
    order?: any;
    /**
     * size of pager usage
     */
    limit?: number;
    /**
     * skip count of pager usage
     */
    skip?: number;
    /**
     * offset index of pager usage
     */
    offset?: number;
    /**
     * only set model of redis usage
     */
    random?: boolean;
}
/** command storage mode */
export declare enum CommandMode {
    None = 0,
    /** only does key, warn use query key has lock all keys for redis */
    Key = 1,
    String = 2,
    Hash = 3,
    List = 4,
    Queue = 5,
    Stack = 6,
    Set = 7,
    SortSet = 8,
    /** 自定义的结构 */
    Bloom = 9,
}
/** command options */
export interface CommandOptions {
    /** storage mode */
    mode?: CommandMode;
    /** filter */
    filter?: QueryFilter;
    /** upsert entity */
    upsert?: any[] | any;
    /** fields of redis hash */
    fields?: any[] | any;
    /** entity or newkey */
    entity?: any[] | any;
    /** allow affected multi rows. */
    multi?: boolean;
    /** key expired second use utc time */
    expired?: number;
    /** score field of redis when add */
    score?: number | number[];
}
/**
 * connect database result callback.
 */
export declare type ConnectCallback = (err: any, res?: any) => void;
/** Model entity identity */
export declare type EntityId = number | string;
/** sql syntax or collection name or key */
export declare type CommandString = string | string[];
export interface InsertStreamArgs {
    stream: boolean;
    rows: string[];
}
/** Sql query comand args, strig[] or number[] or {} use at where in sql */
export declare type QueryArgs = Array<string | number | boolean | string[] | number[]> | InsertStreamArgs | any;
/** Sql query command result callback function, allow null then use 'async/await' mode result. */
export declare type QueryCallback = (err: any, res?: QueryResult | any) => void;
export declare type QueryCountCallback = (err: any, count?: number) => void;
export declare type QueryExistsCallback = (err: any, exists?: boolean) => void;
export declare type QueryOneCallback = (err: any, data?: any) => void;
export declare function UndefinedPromiseError(method: string): Promise<QueryResult>;
export declare function IdlePromiseResult(): Promise<QueryResult>;
/**
 * cache expire policy mode
 */
export declare enum CachePolicyMode {
    None = "",
    /** Least Recently Used */
    LRU = "LRU",
    /** Least Frequently Used */
    LFU = "LFU",
}
/**
 * cache node model
 */
export interface CacheNode {
    /** key */
    key: string;
    /** LFU used */
    count?: number;
    /** */
    next?: CacheNode;
    /** */
    prev?: CacheNode;
}
export interface CachePolicyResult {
    node: CacheNode;
    /**
     * effect keys
     */
    keys: string[];
}
/**
 * cache policy interface
 */
export interface CachePolicy {
    /**
     * get all keys
     */
    keys(): string[];
    /**
     * insert key bind node
     * @param key
     */
    insert(key: string): CachePolicyResult;
    /**
     * update node bind
     * @param node
     */
    update(node: CacheNode): void;
    /**
     * remove node bind
     * @param node
     */
    remove(node: CacheNode): void;
}
