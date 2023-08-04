import { Schema } from "../schema";
import { DbSettings, ConnectCallback, EntityId, QueryResult, QueryCallback, CommandOptions, CommandString } from "../../define";
import { DbAdapter } from "../dbadapter";
/**
 * mongodb drive adapter.
 */
declare class Mongodb extends DbAdapter {
    private connectError;
    private readonly mongodb;
    private collections;
    private config;
    constructor(mongodb: any, schema: Schema, settings: DbSettings, connectError?: ConnectCallback);
    private checkInitialized();
    private onConnectError(err);
    initialize(): Mongodb;
    private auth(username, password);
    private collection(cmd);
    /** */
    newAutoObjectID(): EntityId;
    private toEntityId(id);
    /**
     * parse entity id
     */
    parseEntityId(id: EntityId): any;
    connect(): Promise<QueryResult>;
    disconnect(): void;
    private parseWhere(options);
    private find(cmd, options);
    query(cmd: CommandString, args: CommandOptions, callback: QueryCallback): void;
    queryAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    count(cmd: CommandString, args: CommandOptions, callback: QueryCallback): void;
    countAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    add(cmd: CommandString, args: CommandOptions, callback: QueryCallback): void;
    addAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    /**
     * exceute update command befor when result is false exculte insert command.
     * only update command when multi is true.
     */
    setOrAdd(cmd: CommandString, args: CommandOptions, callback: QueryCallback): void;
    setOrAddAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    remove(cmd: CommandString, args: CommandOptions, callback: QueryCallback): void;
    removeAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
    command(cmd: CommandString, args: CommandOptions, callback: QueryCallback): void;
    commandAsync(cmd: CommandString, args?: CommandOptions): Promise<QueryResult>;
}
export default Mongodb;
