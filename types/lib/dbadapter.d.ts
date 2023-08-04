import { Schema } from "./schema";
import { QueryArgs, QueryCallback, QueryResult, DbSettings, EntityId, CommandOptions, CommandString } from "../define";
/**
 * SQL command interface.
 */
export declare abstract class DbAdapter {
    /** readonly schema */
    protected readonly schema: Schema;
    /** drive client adapter */
    protected client: any;
    /**
     * check database is connected.
     */
    connected: boolean;
    /** conect is callback reply */
    protected connectReply: any;
    /** database config settings */
    readonly settings: DbSettings;
    constructor(schema: Schema, settings: DbSettings);
    /**
     * get drive adapter
     * @example
     * db.adapter.add();
     */
    readonly adapter: any;
    /**
     * newAutoUUID
     */
    newAutoUUID(): EntityId;
    /**
     * newAutoObjectID
     */
    newAutoObjectID(): EntityId;
    /**
     * newAutoId
     */
    newAutoRedisInc(key: string, incr: number): Promise<EntityId>;
    /**
     * parse entity id
     */
    abstract parseEntityId(id: EntityId): any;
    /**
     * try connect to database.
     * @param callback command result callback function, allow null then use 'async/await' mode result.
     */
    abstract connect(): Promise<QueryResult>;
    /**
     * disconnect a client connection.
     */
    abstract disconnect(): void;
    /**
     * query an cmd command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Function} callback command result callback function, allow null then use 'async/await' mode result.
     */
    abstract query(cmd: CommandString, args: QueryArgs | CommandOptions, callback: QueryCallback): void;
    /**
     * query an cmd command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     */
    abstract queryAsync(cmd: CommandString, args?: QueryArgs | CommandOptions): Promise<QueryResult>;
    /**
     * count
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Function} callback command result callback function, allow null then use 'async/await' mode result.
     */
    abstract count(cmd: CommandString, args: QueryArgs | CommandOptions, callback: QueryCallback): void;
    /**
     * count
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @returns QueryResult
     */
    abstract countAsync(cmd: CommandString, args?: QueryArgs | CommandOptions): Promise<QueryResult>;
    /**
     * add
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Function} callback command result callback function, allow null then use 'async/await' mode result.
     */
    abstract add(cmd: CommandString, args: QueryArgs | CommandOptions, callback: QueryCallback): void;
    /**
     * add
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @returns QueryResult
     */
    abstract addAsync(cmd: CommandString, args?: QueryArgs | CommandOptions): Promise<QueryResult>;
    /**
     * set data when it not exist add
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Function} callback command result callback function, allow null then use 'async/await' mode result.
     */
    abstract setOrAdd(cmd: CommandString, args: QueryArgs | CommandOptions, callback: QueryCallback): void;
    /**
     * set data when it not exist add
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @returns QueryResult
     */
    abstract setOrAddAsync(cmd: CommandString, args?: QueryArgs | CommandOptions): Promise<QueryResult>;
    /**
     * remove
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Function} callback command result callback function, allow null then use 'async/await' mode result.
     */
    abstract remove(cmd: CommandString, args: QueryArgs | CommandOptions, callback: QueryCallback): void;
    /**
     * remove
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @returns QueryResult
     */
    abstract removeAsync(cmd: CommandString, args?: QueryArgs | CommandOptions): Promise<QueryResult>;
    /**
     * excute an cmd command, allow 'insert','update','delete','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     * @param {Function} callback command result callback function, allow null then use 'async/await' mode result.
     */
    abstract command(cmd: CommandString, args: QueryArgs | CommandOptions, callback: QueryCallback): void;
    /**
     * excute an cmd command, allow 'insert','update','deletei g ','select' or 'create table' etc command.
     * @param {CommandString} cmd cmd syntax string.
     * @param {Array} args cmd command format params.
     */
    abstract commandAsync(cmd: CommandString, args?: QueryArgs | CommandOptions): Promise<QueryResult>;
}
