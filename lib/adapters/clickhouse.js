Object.defineProperty(exports, "__esModule", { value: true });
const dbadapter_1 = require("../dbadapter");
// import { SqlKeys } from "../syntax";
// import utils from "../utils";
// const uuidv4 = require('uuid/v4');
const fs = require('fs');
/**
 * Clickhouse drive adapter.
 */
class Clickhouse extends dbadapter_1.DbAdapter {
    /**
     * init
     * @param clickhouse clickhouse client
     * @param schema schema
     * @param settings settings
     * @param connectError connect error callback
     */
    constructor(clickhouse, schema, settings, connectError) {
        super(schema, settings);
        this.clickhouse = clickhouse;
        this.connectError = connectError;
    }
    onConnectError(err, res) {
        this.connected = false;
        return this.connectError && this.connectError(err, res);
    }
    checkInitialized() {
        /* istanbul ignore if */
        if (!this.client) {
            throw `connected to clickhouse server fail, at host:${this.config.host}, port:${this.config.port}.`;
        }
    }
    /**
     * initialize clickhouse drive adapter.
     */
    initialize() {
        /* istanbul ignore if */
        if (!this.clickhouse) {
            throw "no-init clickhouse adapter, use 'npm install clickhouse' and set 'storage.driveModule.clickhouse' property.";
        }
        let opt = this.settings, adapter = this;
        //默认打开连接检查
        opt.autoReconnect = opt.autoReconnect == undefined ? true : opt.autoReconnect;
        let conf = adapter.buildConfig(opt);
        this.config = conf;
        this.client = adapter.createClient(false);
        /* istanbul ignore if */
        // if (opt.autoReconnect) {
        //     this.reconnect(adapter, conf);
        // }
        adapter.startAdapter();
        return this;
    }
    // private reconnect(adapter: Clickhouse, conf: any) {
    //     setInterval(function () {
    //         adapter.connect().then(() => {
    //             if (adapter.errorCount > 0) {
    //                 //重新连接成功
    //                 console.info(`re-connect clickhouse '${conf.host}:${conf.port}' at '${conf.database}' successfully.`);
    //             }
    //             adapter.errorCount = 0;
    //         }).catch(err => {
    //             let msg = `pool re-connect '${conf.host}:${conf.port}' at '${conf.database}' database`;
    //             console.error('%s err:%s-%s', msg, err.code || 'unknown', err.message || err.stack || '');
    //             adapter.checkReCreateClient(err);
    //             adapter.onConnectError(err, msg);
    //         });
    //     }, conf.acquireTimeout || 10 * 1000);
    // }
    startAdapter() {
    }
    buildConfig(opt) {
        let custom = opt.option || {};
        let auth = !opt.username ? undefined : {
            username: opt.username || 'default',
            password: opt.password || '',
        };
        let agentOptions = !custom.ssl ? undefined : {
            ca: fs.readFileSync(custom.ssl.cert),
            cert: fs.readFileSync(custom.ssl.cert),
            key: fs.readFileSync(custom.ssl.key),
        };
        let reqParams = agentOptions ? {
            agentOptions: agentOptions
        } : undefined;
        return {
            url: (opt.host.indexOf('http') == -1 ? `http://${opt.host}` : opt.host) || 'http://localhost',
            port: opt.port || 8123,
            debug: false,
            basicAuth: auth,
            isUseGzip: custom.use_gzip || false,
            format: custom.format || "json",
            raw: custom.raw || false,
            isSessionPerQuery: custom.isSessionPerQuery || false,
            config: {
                session_id: custom.session_id,
                session_timeout: custom.session_timeout || 60,
                output_format_json_quote_64bit_integers: 0,
                enable_http_compression: 0,
                database: opt.database,
            },
            reqParams: reqParams
        };
        // let defQuery = opt.option || {}
        // if (!defQuery.database) {
        //     defQuery.database = opt.database || '';
        // }
        // return {
        //     host: opt.host || /* istanbul ignore next */ 'localhost',
        //     port: opt.port || /* istanbul ignore next */ 8123,
        //     user: opt.username,
        //     password: opt.password,
        //     path: opt.path || '/',
        //     protocol: opt.ssl ? 'https:' : 'http:',
        //     readonly: opt.readonly || false,
        //     dataObjects: opt.dataObjects || true,
        //     timeout: opt.connectionLimit || 0,
        //     queryOptions: defQuery
        // };
    }
    checkReCreateClient(_err) {
        // if (err && (err.code == 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
        //     err.code == 'PROTOCOL_CONNECTION_LOST')) {
        //     //特定出错时重建连接
        //     this.client = this.createClient(this.settings.pool);
        //     this.errorCount = 0;
        //     return;
        // }
        // 超出3次连接出错，重新创建新的连接尝试连接
        let max = this.settings.maxConnectErrorCount || 3;
        if (this.errorCount < max) {
            this.errorCount += 1;
            return;
        }
        this.client = this.createClient(this.settings.pool);
        this.errorCount = 0;
    }
    createClient(_usePool) {
        let ClickHouse = this.clickhouse;
        if (ClickHouse == undefined) {
            throw new Error(`Not import clickhouse drive.`);
        }
        let conf = this.config;
        let database = conf.config && conf.config.database || '';
        let conn = new ClickHouse(conf);
        // let adapter = this;
        // conn.query(`SELECT 1+1`).toPromise().then((_data: any) => {
        //     console.info(`connect clickhouse '${conf.url}:${conf.port}' successfully!`)
        // }).catch(function (err: any) {
        //     let msg = `Clickhouse re-connect '${conf.url}:${conf.port}' at '${database}' database`;
        //     console.error('Clickhouse connection error:', err);
        //     adapter.onConnectError(err, msg);
        //     setInterval(() => {
        //         adapter.checkReCreateClient(err);
        //     }, 5000);//5s
        // });
        console.info(`start connect clickhouse '${conf.url}:${conf.port}' at '${database}'.`);
        return conn;
    }
    /**
     * parse entity id
     */
    parseEntityId(id) {
        return id;
    }
    /**
     * connect
     * @param callback callback
     */
    connect() {
        //utils.generateNonce() 
        // return this.queryAsync(`${SqlKeys.SELECT} 1+1`, { sessionId: uuidv4() });
        // 不处理连接检查，它是Http的
        return new Promise((resolve, _reject) => {
            setImmediate(resolve);
        });
    }
    /**
     * disconnect a client connection.
     */
    disconnect() {
        this.checkInitialized();
        // this.client.end();
    }
    /**
     * query
     * @param sql sql
     * @param args args {format, sessionId}
     * @param callback callback is undefine use stream
     * @return stream,  see https://github.com/apla/node-clickhouse
     */
    query(cmd, _args, callback) {
        try {
            this.checkInitialized();
        }
        catch (err) {
            callback(err);
            return;
        }
        let self = this;
        //若外部有传sessionId
        // if (self.client && !(_args || {}).sessionId) {
        //     self.client.sessionId = Date.now();
        // }
        let sql = Array.isArray(cmd) ? /* istanbul ignore next */ cmd[0] : cmd;
        if (typeof (callback) == "function") {
            return self.client && self.client.query(sql, {}, _args || {}).exec((err, res) => {
                if (!err)
                    self.connected = true;
                callback(err, res);
            });
        }
        return self.client && self.client.query(sql, {}, _args || {}).toPromise();
    }
    /**
     * queryAsync
     * @param sql sql
     * @param args args {format, sessionId}
     */
    queryAsync(cmd, _args) {
        let self = this;
        let sql = Array.isArray(cmd) ? /* istanbul ignore next */ cmd[0] : cmd;
        return new Promise((resolve, reject) => {
            try {
                this.checkInitialized();
            }
            catch (err) {
                reject(err);
                return;
            }
            //TODO: 交给上层业务决定是否使用sessionId
            // if (self.client && !(_args || {}).sessionId) {
            //     self.client.sessionId = utils.generateNonce();
            // }
            self.client && self.client.query(sql, {}, _args || {}).toPromise().then((data) => {
                self.connected = true;
                resolve(data);
            }).catch((err) => {
                console.error('execute sql:%s err:', sql, err);
                reject(err);
            });
        });
    }
    count(cmd, args, callback) {
        return this.query(cmd, args, callback);
    }
    countAsync(cmd, args) {
        return this.queryAsync(cmd, args);
    }
    add(cmd, args, callback) {
        return this.command(cmd, args, callback);
    }
    addAsync(cmd, args) {
        return this.commandAsync(cmd, args);
    }
    setOrAdd(cmd, args, callback) {
        return this.command(cmd, args, callback);
    }
    setOrAddAsync(cmd, args) {
        return this.commandAsync(cmd, args);
    }
    remove(_cmd, _args, _callback) {
        throw new Error(`not support "remove" method`);
        // return this.command(cmd, args, callback);
    }
    removeAsync(_cmd, _args) {
        // return this.commandAsync(cmd, args);
        throw new Error(`not support "remove" method`);
    }
    /**
     * 插入
     * @param callback 返回stream对象
     */
    command(cmd, args, callback) {
        try {
            this.checkInitialized();
        }
        catch (err) {
            callback(err);
            return;
        }
        let self = this;
        //若外部有传sessionId
        // if (self.client && !(args || {}).sessionId) {
        //     self.client.sessionId = Date.now();
        // }
        let sql = Array.isArray(cmd) ? /* istanbul ignore next */ cmd[0] : cmd;
        if (typeof (callback) == "function") {
            if (!!args.stream) {
                let stream = self.client && self.client.insert(sql).stream();
                self.connected = true;
                callback(undefined, stream);
            }
            else {
                self.connected = true;
                self.client && self.client.insert(sql, args || []).exec(callback);
            }
            return;
        }
        return self.client && self.client.insert(sql, args || []).toPromise();
    }
    commandAsync(cmd, args) {
        let self = this;
        let sql = Array.isArray(cmd) ? /* istanbul ignore next */ cmd[0] : cmd;
        return new Promise((resolve, reject) => {
            try {
                this.checkInitialized();
            }
            catch (err) {
                reject(err);
                return;
            }
            //若外部有传sessionId
            // if (self.client && !(args || {}).sessionId) {
            //     self.client.sessionId = Date.now();
            // }
            self.client && self.client.insert(sql, args || []).toPromise().then((data) => {
                self.connected = true;
                resolve(data);
            }).catch((err) => {
                console.error('execute sql:%s err:%s-%s', sql, err.code || 'unknown', err.message || err.stack || '');
                reject(err);
            });
        });
    }
}
exports.default = Clickhouse;
