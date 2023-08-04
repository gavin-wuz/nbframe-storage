Object.defineProperty(exports, "__esModule", { value: true });
const dbadapter_1 = require("../dbadapter");
const syntax_1 = require("../syntax");
/**
 * mysql drive adapter.
 */
class MySQL extends dbadapter_1.DbAdapter {
    /**
     * init
     * @param mysql mysql client
     * @param schema schema
     * @param settings settings
     * @param connectError connect error callback
     */
    constructor(mysql, schema, settings, connectError) {
        super(schema, settings);
        this.mysql = mysql;
        this.connectError = connectError;
    }
    onConnectError(err, res) {
        this.connected = false;
        return this.connectError && this.connectError(err, res);
    }
    checkInitialized() {
        /* istanbul ignore if */
        if (!this.client) {
            throw `connected to mysql server fail, at host:${this.config.host}, port:${this.config.port}.`;
        }
    }
    /**
     * initialize mysql drive adapter.
     */
    initialize() {
        /* istanbul ignore if */
        if (!this.mysql) {
            throw "no-init mysql adapter, use 'npm install mysql' and set 'storage.driveModule.mysql' property.";
        }
        let opt = this.settings, adapter = this;
        //默认打开连接检查
        opt.autoReconnect = opt.autoReconnect == undefined ? true : opt.autoReconnect;
        let conf = adapter.buildConfig(opt);
        this.config = conf;
        if (opt.pool) {
            this.config.connectionLimit = opt.connectionLimit || /* istanbul ignore next */ 10;
            this.config.queueLimit = opt.queueLimit || /* istanbul ignore next */ 0;
            let client = adapter.createClient(true);
            this.client = client;
            client.getConnection((err) => {
                err && /* istanbul ignore next */ adapter.onConnectError(err, `pool connect '${conf.host}:${conf.port}' at '${conf.database}' database`);
            });
            client.on('connection', () => {
                /* istanbul ignore if */
                if (opt.autoReconnect) {
                    this.reconnect(adapter, conf);
                }
                adapter.startAdapter();
            });
        }
        else {
            this.client = adapter.createClient(false);
            /* istanbul ignore if */
            if (opt.autoReconnect) {
                this.reconnect(adapter, conf);
            }
            adapter.startAdapter();
        }
        return this;
    }
    reconnect(adapter, conf) {
        setInterval(function () {
            adapter.connect().then(() => {
                if (adapter.errorCount > 0) {
                    //重新连接成功
                    console.info(`re-connect mysql '${conf.host}:${conf.port}' at '${conf.database}' successfully.`);
                }
                adapter.errorCount = 0;
            }).catch(err => {
                let msg = `pool re-connect '${conf.host}:${conf.port}' at '${conf.database}' database`;
                console.error('%s err:%s-%s', msg, err.code || 'unknown', err.message || err.stack || '');
                adapter.checkReCreateClient(err);
                adapter.onConnectError(err, msg);
            });
        }, conf.acquireTimeout || 10 * 1000);
    }
    startAdapter() {
    }
    buildConfig(opt) {
        return {
            host: opt.host || /* istanbul ignore next */ 'localhost',
            port: opt.port || /* istanbul ignore next */ 3306,
            user: opt.username,
            password: opt.password,
            debug: opt.debug,
            database: String(opt.database || /* istanbul ignore next */ ""),
            charset: opt.charset || 'utf8',
            acquireTimeout: opt.acquireTimeout || /* istanbul ignore next */ 10000,
            queueLimit: opt.queueLimit || 0,
            connectionLimit: opt.connectionLimit || 0,
            waitForConnections: opt.waitForConnections || true,
            ssl: opt.ssl || undefined
        };
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
    createClient(usePool) {
        let adapter = this;
        let conf = this.config;
        let conn = usePool ? this.mysql.createPool(conf)
            : this.mysql.createConnection(conf);
        // conn.connect(function (err: any) {
        //     if (err) {
        //         console.log("SQL CONNECT ERROR: %j", err);
        //     }
        // });
        console.info(`start connect mysql '${conf.host}:${conf.port}' at '${conf.database}'.`);
        conn.on("close", function (err) {
            console.error('SQL CONNECTION CLOSED err:%s-%s', err.code || 'unknown', err.message || err.stack || '');
        });
        conn.on("error", function (err) {
            console.error('SQL CONNECTION ERROR err:%s-%s', err.code || 'unknown', err.message || err.stack || '');
            adapter.checkReCreateClient(err);
        });
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
        return this.queryAsync(`${syntax_1.SqlKeys.SELECT} 1+1`);
    }
    /**
     * disconnect a client connection.
     */
    disconnect() {
        this.checkInitialized();
        this.client.end();
    }
    /**
     * query
     * @param sql sql
     * @param args args
     * @param callback callback
     */
    query(cmd, args, callback) {
        try {
            this.checkInitialized();
        }
        catch (err) {
            callback(err);
            return;
        }
        let self = this;
        let sql = Array.isArray(cmd) ? /* istanbul ignore next */ cmd[0] : cmd;
        self.client && self.client.query(sql, args || [], (err, res) => {
            if (!err)
                self.connected = true;
            callback(err, res);
        });
        return;
    }
    /**
     * queryAsync
     * @param sql sql
     * @param args args
     */
    queryAsync(cmd, args) {
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
            self.client && self.client.query(sql, args || [], (err, res) => {
                /* istanbul ignore if */
                if (err) {
                    console.error('execute sql:%s err:%s-%s', sql, err.code || 'unknown', err.message || err.stack || '');
                    reject(err);
                    return;
                }
                self.connected = true;
                resolve(res);
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
    remove(cmd, args, callback) {
        return this.command(cmd, args, callback);
    }
    removeAsync(cmd, args) {
        return this.commandAsync(cmd, args);
    }
    command(cmd, args, callback) {
        return this.query(cmd, args, callback);
    }
    commandAsync(cmd, args) {
        return this.queryAsync(cmd, args);
    }
}
exports.default = MySQL;
