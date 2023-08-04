import { DbAdapter } from "../dbadapter";
import { QueryResult, QueryCallback, QueryArgs, ConnectCallback, DbSettings, EntityId, CommandString } from "../../define";
import { Schema } from "../schema";
/**
 * Clickhouse drive adapter.
 */
declare class Clickhouse extends DbAdapter {
    private connectError;
    private readonly clickhouse;
    private config;
    private errorCount;
    /**
     * init
     * @param clickhouse clickhouse client
     * @param schema schema
     * @param settings settings
     * @param connectError connect error callback
     */
    constructor(clickhouse: any, schema: Schema, settings: DbSettings, connectError?: ConnectCallback);
    onConnectError(err: any, res?: any): void;
    private checkInitialized();
    /**
     * initialize clickhouse drive adapter.
     */
    initialize(): Clickhouse;
    private startAdapter();
    private buildConfig(opt);
    checkReCreateClient(_err: any): void;
    private createClient(_usePool);
    /**
     * parse entity id
     */
    parseEntityId(id: EntityId): any;
    /**
     * connect
     * @param callback callback
     */
    connect(): Promise<QueryResult>;
    /**
     * disconnect a client connection.
     */
    disconnect(): void;
    /**
     * query
     * @param sql sql
     * @param args args {format, sessionId}
     * @param callback callback is undefine use stream
     * @return stream,  see https://github.com/apla/node-clickhouse
     */
    query(cmd: CommandString, _args: QueryArgs, callback: QueryCallback): void;
    /**
     * queryAsync
     * @param sql sql
     * @param args args {format, sessionId}
     */
    queryAsync(cmd: CommandString, _args?: QueryArgs): Promise<QueryResult>;
    count(cmd: CommandString, args: QueryArgs, callback: QueryCallback): void;
    countAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
    add(cmd: CommandString, args: QueryArgs, callback: QueryCallback): void;
    addAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
    setOrAdd(cmd: CommandString, args: QueryArgs, callback: QueryCallback): void;
    setOrAddAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
    remove(_cmd: CommandString, _args: QueryArgs, _callback: QueryCallback): void;
    removeAsync(_cmd: CommandString, _args?: QueryArgs): Promise<QueryResult>;
    /**
     * 插入
     * @param callback 返回stream对象
     */
    command(cmd: CommandString, args?: QueryArgs, callback?: QueryCallback): void;
    commandAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
}
export default Clickhouse;
