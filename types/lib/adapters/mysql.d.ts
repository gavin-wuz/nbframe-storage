import { DbAdapter } from "../dbadapter";
import { QueryResult, QueryCallback, QueryArgs, ConnectCallback, DbSettings, EntityId, CommandString } from "../../define";
import { Schema } from "../schema";
/**
 * mysql drive adapter.
 */
declare class MySQL extends DbAdapter {
    private connectError;
    private readonly mysql;
    private config;
    private errorCount;
    /**
     * init
     * @param mysql mysql client
     * @param schema schema
     * @param settings settings
     * @param connectError connect error callback
     */
    constructor(mysql: any, schema: Schema, settings: DbSettings, connectError?: ConnectCallback);
    private onConnectError(err, res?);
    private checkInitialized();
    /**
     * initialize mysql drive adapter.
     */
    initialize(): MySQL;
    private reconnect(adapter, conf);
    private startAdapter();
    private buildConfig(opt);
    private checkReCreateClient(_err);
    private createClient(usePool);
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
     * @param args args
     * @param callback callback
     */
    query(cmd: CommandString, args: QueryArgs, callback: QueryCallback): void;
    /**
     * queryAsync
     * @param sql sql
     * @param args args
     */
    queryAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
    count(cmd: CommandString, args: QueryArgs, callback: QueryCallback): void;
    countAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
    add(cmd: CommandString, args: QueryArgs, callback: QueryCallback): void;
    addAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
    setOrAdd(cmd: CommandString, args: QueryArgs, callback: QueryCallback): void;
    setOrAddAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
    remove(cmd: CommandString, args: QueryArgs, callback: QueryCallback): void;
    removeAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
    command(cmd: CommandString, args?: QueryArgs, callback?: QueryCallback): void;
    commandAsync(cmd: CommandString, args?: QueryArgs): Promise<QueryResult>;
}
export default MySQL;
