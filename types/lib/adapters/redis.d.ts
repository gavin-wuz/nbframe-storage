import { DbAdapter } from "../dbadapter";
import { Schema } from "../schema";
import { DbSettings, ConnectCallback, EntityId, QueryResult, QueryCallback, CommandOptions, CommandString } from "../../define";
/**
 * Redis drive adapter.
 */
declare class Redis extends DbAdapter {
    static RESULT_OK: string;
    private connectError;
    private readonly redis;
    private config;
    private connectHandles;
    /**
     * init
     * @param redis redis client
     * @param schema schema
     * @param settings settings
     * @param connectError connect error callback
     */
    constructor(redis: any, schema: Schema, settings: DbSettings, connectError?: ConnectCallback);
    private onConnectError(err);
    private checkInitialized();
    /**
     * initialize drive adapter.
     */
    initialize(): Redis;
    private triggerConnected(err?);
    newAutoRedisInc(key: string, incr: number): Promise<EntityId>;
    parseEntityId(id: EntityId): string;
    connect(): Promise<QueryResult>;
    disconnect(): void;
    query(cmd: CommandString, args: CommandOptions, callback: QueryCallback): void;
    queryAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    count(cmd: CommandString, args?: CommandOptions, callback?: QueryCallback): void;
    countAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    add(cmd: CommandString, args?: CommandOptions, callback?: QueryCallback): void;
    addAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    setOrAdd(cmd: CommandString, args?: CommandOptions, callback?: QueryCallback): void;
    setOrAddAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    remove(cmd: CommandString, args?: CommandOptions, callback?: QueryCallback): void;
    removeAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    command(cmd: CommandString, args?: CommandOptions, callback?: QueryCallback): void;
    commandAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    private processQuery(cmd, args, fail, success);
    private processCount(cmd, args, fail, success);
    private processAdd(cmd, args, fail, success);
    private processSetOrAdd(cmd, args, fail, success);
    private processRemove(cmd, args, fail, success);
}
export default Redis;
