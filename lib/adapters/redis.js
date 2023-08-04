Object.defineProperty(exports, "__esModule", { value: true });
const dbadapter_1 = require("../dbadapter");
const define_1 = require("../../define");
/**
 * Redis drive adapter.
 */
class Redis extends dbadapter_1.DbAdapter {
    /**
     * init
     * @param redis redis client
     * @param schema schema
     * @param settings settings
     * @param connectError connect error callback
     */
    constructor(redis, schema, settings, connectError) {
        super(schema, settings);
        this.connectHandles = [];
        this.redis = redis;
        this.connectError = connectError;
    }
    onConnectError(err) {
        this.connected = false;
        return this.connectError && this.connectError(err);
    }
    checkInitialized() {
        if (!this.client) {
            throw `connected to redis server fail, at host:${this.config.url || this.config.host + ':' + this.config.port}.`;
        }
    }
    /**
     * initialize drive adapter.
     */
    initialize() {
        if (!this.redis) {
            throw "no-init redis adapter, use 'npm install redis' and set 'storage.driveModule.redis' property.";
        }
        let s = this.settings, adapter = this;
        let config = {
            host: s.host,
            port: s.port,
            db: Number(s.database),
            password: s.password,
            url: s.url,
            prefix: s.prefix,
            connect_timeout: s.connectTimeout || 5 * 1000 //5s
        };
        /* istanbul ignore if */
        if (s.ssl) {
            config.tls = s.ssl;
        }
        this.config = config;
        adapter.client = adapter.redis.createClient(config);
        if (config.password) {
            adapter.client.auth(config.password);
        }
        adapter.client.on("connect", () => {
            adapter.connectReply = { success: true };
            adapter.connected = true;
            adapter.triggerConnected();
        });
        adapter.client.on("error", (err) => {
            adapter.connectReply = { err: err };
            adapter.onConnectError(err);
            adapter.triggerConnected(err);
        });
        return this;
    }
    triggerConnected(err) {
        this.connectHandles.forEach((handle) => {
            if (!handle)
                return;
            if (!err) {
                typeof (handle.resolve) === "function" && handle.resolve();
            }
            else {
                typeof (handle.reject) === "function" && handle.reject(err);
            }
        });
        this.connectHandles = [];
    }
    newAutoRedisInc(key, incr) {
        key = key ? "id:" + key : "id:__global";
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                self.checkInitialized();
            }
            catch (err) {
                /* istanbul ignore next */
                reject(err);
                return;
            }
            if (incr > 1) {
                self.client.INCRBY(key, incr, (err, res) => {
                    if (err)
                        return reject(err);
                    resolve(res);
                });
            }
            else {
                self.client.INCR(key, (err, res) => {
                    if (err)
                        return reject(err);
                    resolve(res);
                });
            }
        });
    }
    parseEntityId(id) {
        return String(id);
    }
    connect() {
        return new Promise((resolve, reject) => {
            if (this.connectReply) {
                if (this.connectReply.success) {
                    resolve();
                }
                else {
                    reject(this.connectReply.err);
                }
            }
            else {
                //未连接状态，需要等待连接回调
                this.connectHandles.push({ resolve, reject });
            }
        });
    }
    disconnect() {
        this.checkInitialized();
        this.connectReply = undefined;
        this.client.quit();
    }
    query(cmd, args, callback) {
        this.checkInitialized();
        this.processQuery(cmd, args, err => {
            callback && callback(err);
        }, res => {
            callback && callback(undefined, res);
        });
    }
    queryAsync(cmd, args) {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                self.checkInitialized();
            }
            catch (err) {
                /* istanbul ignore next */
                reject(err);
                return;
            }
            self.processQuery(cmd, args, err => {
                reject(err);
            }, res => {
                resolve(res);
            });
        });
    }
    count(cmd, args, callback) {
        this.checkInitialized();
        this.processCount(cmd, args, err => {
            callback && callback(err);
        }, res => {
            callback && callback(undefined, res);
        });
    }
    countAsync(cmd, args) {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                self.checkInitialized();
            }
            catch (err) {
                /* istanbul ignore next */
                reject(err);
                return;
            }
            self.processCount(cmd, args, err => {
                reject(err);
            }, res => {
                resolve(res);
            });
        });
    }
    add(cmd, args, callback) {
        this.checkInitialized();
        this.processAdd(cmd, args, err => {
            callback && callback(err);
        }, res => {
            callback && callback(undefined, res);
        });
    }
    addAsync(cmd, args) {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                self.checkInitialized();
            }
            catch (err) {
                /* istanbul ignore next */
                reject(err);
                return;
            }
            self.processAdd(cmd, args, err => {
                reject(err);
            }, res => {
                resolve(res);
            });
        });
    }
    setOrAdd(cmd, args, callback) {
        this.checkInitialized();
        this.processSetOrAdd(cmd, args, err => {
            callback && callback(err);
        }, res => {
            callback && callback(undefined, res);
        });
    }
    setOrAddAsync(cmd, args) {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                self.checkInitialized();
            }
            catch (err) {
                /* istanbul ignore next */
                reject(err);
                return;
            }
            self.processSetOrAdd(cmd, args, err => {
                reject(err);
            }, res => {
                resolve(res);
            });
        });
    }
    remove(cmd, args, callback) {
        this.checkInitialized();
        this.processRemove(cmd, args, err => {
            callback && callback(err);
        }, res => {
            callback && callback(undefined, res);
        });
    }
    removeAsync(cmd, args) {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                self.checkInitialized();
            }
            catch (err) {
                /* istanbul ignore next */
                reject(err);
                return;
            }
            self.processRemove(cmd, args, err => {
                reject(err);
            }, res => {
                resolve(res);
            });
        });
    }
    command(cmd, args, callback) {
        if (!args) {
            throw "Not args params.";
        }
        if (args.entity) {
            // insert
            this.add(cmd, args, callback);
        }
        else if (args.upsert) {
            // update
            this.setOrAdd(cmd, args, callback);
        }
        else if (args.filter) {
            // remove
            this.remove(cmd, args, callback);
        }
    }
    commandAsync(cmd, args) {
        if (!args) {
            throw "Not args params.";
        }
        if (args.entity) {
            // insert
            return this.addAsync(cmd, args);
        }
        if (args.upsert) {
            // update
            return this.setOrAddAsync(cmd, args);
        }
        if (args.filter) {
            // remove
            return this.removeAsync(cmd, args);
        }
        return undefined;
    }
    processQuery(cmd, args, fail, success) {
        function callback(err, res) {
            /* istanbul ignore if */
            if (err) {
                fail(err);
                return;
            }
            success(res);
        }
        let multi = args && args.multi !== undefined ? args.multi : /* istanbul ignore next */ false;
        let mode = args && args.mode || /* istanbul ignore next */ define_1.CommandMode.None;
        let filter = args && args.filter || /* istanbul ignore next */ {};
        let skip = filter.skip || /* istanbul ignore next */ 0;
        let offset = filter.offset || /* istanbul ignore next */ 0;
        let limit = filter.limit || /* istanbul ignore next */ 10;
        let hasRange = filter.offset || filter.limit;
        let startIndex = skip + offset;
        let endIndex = startIndex + limit;
        if (multi || Array.isArray(cmd)) {
            let keys = Array.isArray(cmd) ? cmd : [cmd];
            switch (mode) {
                case define_1.CommandMode.String:
                    this.client.MGET(keys, callback);
                    break;
                case define_1.CommandMode.Hash:
                    this.client.HMGET(keys, callback);
                    break;
                case define_1.CommandMode.List:
                case define_1.CommandMode.Queue:
                case define_1.CommandMode.Stack:
                    fail("Not supperted mutil key get values from redis List.");
                    break;
                case define_1.CommandMode.Set:
                    fail("Not supperted mutil key get values from redis Set.");
                    break;
                case define_1.CommandMode.SortSet:
                    fail("Not supperted mutil key get values from redis SortSet.");
                    break;
                default:
                    fail("Not supperted redis mode:" + String(mode));
                    break;
            }
            return;
        }
        let key = Array.isArray(cmd) ? cmd[0] : cmd;
        switch (mode) {
            case define_1.CommandMode.Key:
                this.client.KEYS(key, callback);
                break;
            case define_1.CommandMode.String:
                if (hasRange) {
                    this.client.GETRANGE(key, startIndex, endIndex, callback);
                }
                else {
                    this.client.GET(key, callback);
                }
                break;
            case define_1.CommandMode.Hash:
                if (!hasRange && filter.id) {
                    this.client.HGET(key, this.parseEntityId(filter.id), callback);
                }
                else {
                    this.client.HGETALL(key, callback);
                }
                break;
            case define_1.CommandMode.List:
            case define_1.CommandMode.Queue:
            case define_1.CommandMode.Stack:
                if (hasRange) {
                    this.client.LRANGE(key, startIndex, endIndex, callback);
                }
                else {
                    this.client.LINDEX(key, startIndex, callback);
                }
                break;
            case define_1.CommandMode.Set:
                if (hasRange && filter.random) {
                    this.client.SRANDMEMBER(key, limit, callback);
                }
                else if (filter.id) {
                    /** 根据内容key判断是否存在*/
                    this.client.SISMEMBER(key, filter.id, callback);
                }
                else {
                    this.client.SMEMBERS(key, callback);
                }
                break;
            case define_1.CommandMode.SortSet:
                let sortWhere = filter.where || {};
                let withscores = sortWhere.withscores || false;
                const score = "WITHSCORES";
                let returnScore = args.score && args.score == 1 ? score : undefined;
                if (withscores && filter.id) {
                    this.client.ZSCORE(key, filter.id, callback);
                }
                else if (withscores) {
                    returnScore ? this.client.ZRANGEBYSCORE(key, sortWhere.min || "-inf", sortWhere.max || "+inf", returnScore, "LIMIT", offset, limit, callback)
                        : this.client.ZRANGEBYSCORE(key, sortWhere.min || "-inf", sortWhere.max || "+inf", "LIMIT", offset, limit, callback);
                }
                else if (filter.id) {
                    this.client.ZRANK(key, filter.id, callback);
                }
                else {
                    returnScore ? this.client.ZRANGE(key, startIndex, endIndex, returnScore, callback)
                        : this.client.ZRANGE(key, startIndex, endIndex, callback);
                }
                break;
            default:
                fail("Not supperted redis mode:" + String(mode));
                break;
        }
    }
    processCount(cmd, args, fail, success) {
        function callback(err, res) {
            /* istanbul ignore if */
            if (err) {
                fail(err);
                return;
            }
            success(res);
        }
        let key = Array.isArray(cmd) ? cmd[0] : cmd;
        let mode = args && args.mode || /* istanbul ignore next */ define_1.CommandMode.None;
        switch (mode) {
            case define_1.CommandMode.Key:
                this.client.EXISTS(key, callback);
                break;
            case define_1.CommandMode.String:
                this.client.STRLEN(key, callback);
                break;
            case define_1.CommandMode.Hash:
                this.client.HLEN(key, callback);
                break;
            case define_1.CommandMode.List:
            case define_1.CommandMode.Queue:
            case define_1.CommandMode.Stack:
                this.client.LLEN(key, callback);
                break;
            case define_1.CommandMode.Set:
                this.client.SCARD(key, callback);
                break;
            case define_1.CommandMode.SortSet:
                this.client.ZCARD(key, callback);
                break;
            default:
                fail("Not supperted redis mode:" + String(mode));
                break;
        }
    }
    processAdd(cmd, args, fail, success) {
        let multi = args && args.multi !== undefined ? args.multi : /* istanbul ignore next */ false;
        let mode = args && args.mode || /* istanbul ignore next */ define_1.CommandMode.None;
        /* istanbul ignore if */
        if (!args || !args.entity) {
            fail("Not found args.entity param of redis add().");
            return;
        }
        if (multi || Array.isArray(cmd)) {
            let keys = Array.isArray(cmd) ? cmd : [cmd];
            switch (mode) {
                case define_1.CommandMode.String:
                    let vals = Array.isArray(args.entity) ? args.entity : [args.entity];
                    let kvParis = [];
                    for (let i = 0; i < keys.length && i < vals.length; i++) {
                        kvParis.push(keys[i]);
                        kvParis.push(vals[i]);
                    }
                    this.client.MSETNX(kvParis, (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: Number(res)
                        });
                    });
                    break;
                case define_1.CommandMode.Hash:
                    fail("Not supperted mutil key add values from redis Hash.");
                    break;
                case define_1.CommandMode.Queue:
                case define_1.CommandMode.Stack:
                case define_1.CommandMode.List:
                    fail("Not supperted mutil key add values from redis List.");
                    break;
                case define_1.CommandMode.Set:
                    fail("Not supperted mutil key add values from redis Set.");
                    break;
                case define_1.CommandMode.SortSet:
                    fail("Not supperted mutil key add values from redis SortSet.");
                    break;
                default:
                    fail("Not supperted redis mode:" + String(mode));
                    break;
            }
            return;
        }
        let key = Array.isArray(cmd) ? cmd[0] : cmd;
        let vals = Array.isArray(args.entity) ? args.entity : [args.entity];
        let kvParis = [];
        switch (mode) {
            case define_1.CommandMode.String:
                if (args.expired) {
                    // NX: only key is not exist
                    this.client.SET(key, vals[0], "EX", Number(args.expired), "NX", (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: res == Redis.RESULT_OK ? 1 : 0
                        });
                    });
                }
                else {
                    this.client.SET(key, vals[0], "NX", (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: res == Redis.RESULT_OK ? 1 : 0
                        });
                    });
                }
                break;
            case define_1.CommandMode.Hash:
                let fields = Array.isArray(args.fields) ? args.fields : [args.fields];
                for (let i = 0; i < fields.length && i < vals.length; i++) {
                    kvParis.push(fields[i]);
                    kvParis.push(vals[i]);
                }
                this.client.HMSET(key, kvParis, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: res == Redis.RESULT_OK ? 1 : 0
                    });
                });
                break;
            case define_1.CommandMode.List:
                this.client.RPUSH(key, vals, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res)
                    });
                });
                break;
            case define_1.CommandMode.Queue:
                this.client.RPUSH(key, vals, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res)
                    });
                });
                break;
            case define_1.CommandMode.Stack:
                this.client.LPUSH(key, vals, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res)
                    });
                });
                break;
            case define_1.CommandMode.Set:
                this.client.SADD(key, vals, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res)
                    });
                });
                break;
            case define_1.CommandMode.SortSet:
                let scores = Array.isArray(args.score) ? args.score : [(args.score || 0)];
                for (let i = 0; i < vals.length && i < scores.length; i++) {
                    kvParis.push(scores[i]);
                    kvParis.push(vals[i]);
                }
                this.client.ZADD(key, kvParis, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res)
                    });
                });
                break;
            default:
                fail("Not supperted redis mode:" + String(mode));
                break;
        }
    }
    processSetOrAdd(cmd, args, fail, success) {
        let multi = args && args.multi !== undefined ? args.multi : /* istanbul ignore next */ false;
        let mode = args && args.mode || /* istanbul ignore next */ define_1.CommandMode.None;
        /* istanbul ignore if */
        if (!args || !args.upsert) {
            fail("Not found args.upsert param of redis setOrAdd().");
            return;
        }
        if (multi || Array.isArray(cmd)) {
            let keys = Array.isArray(cmd) ? cmd : [cmd];
            switch (mode) {
                case define_1.CommandMode.String:
                    let vals = Array.isArray(args.upsert) ? args.upsert : [args.upsert];
                    let kvParis = [];
                    for (let i = 0; i < keys.length && i < vals.length; i++) {
                        kvParis.push(keys[i]);
                        kvParis.push(vals[i]);
                    }
                    this.client.MSET(kvParis, (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: res == Redis.RESULT_OK ? 1 : 0,
                            affectedRows: res == Redis.RESULT_OK ? 1 : 0
                        });
                    });
                    break;
                case define_1.CommandMode.Hash:
                    fail("Not supperted mutil key setOrAdd values from redis Hash.");
                    break;
                case define_1.CommandMode.Queue:
                case define_1.CommandMode.Stack:
                case define_1.CommandMode.List:
                    fail("Not supperted mutil key setOrAdd values from redis List.");
                    break;
                case define_1.CommandMode.Set:
                    fail("Not supperted mutil key setOrAdd values from redis Set.");
                    break;
                case define_1.CommandMode.SortSet:
                    fail("Not supperted mutil key setOrAdd values from redis SortSet.");
                    break;
                default:
                    fail("Not supperted redis mode:" + String(mode));
                    break;
            }
            return;
        }
        let key = Array.isArray(cmd) ? cmd[0] : cmd;
        let vals = Array.isArray(args.upsert) ? args.upsert : [args.upsert];
        let kvParis = [];
        let filter = args && args.filter || /* istanbul ignore next */ {};
        let offset = filter.offset || /* istanbul ignore next */ 0;
        switch (mode) {
            case define_1.CommandMode.Key:
                this.client.RENAMENX(key, vals[0], (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: Number(res),
                        affectedRows: Number(res)
                    });
                });
                break;
            case define_1.CommandMode.String:
                if (args.expired) {
                    // NX: only key is not exist
                    this.client.SET(key, vals[0], "EX", Number(args.expired), (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: res == Redis.RESULT_OK ? 1 : 0,
                            affectedRows: res == Redis.RESULT_OK ? 1 : 0
                        });
                    });
                }
                else {
                    this.client.SET(key, vals[0], (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: res == Redis.RESULT_OK ? 1 : 0,
                            affectedRows: res == Redis.RESULT_OK ? 1 : 0
                        });
                    });
                }
                break;
            case define_1.CommandMode.Hash:
                let fields = Array.isArray(args.fields) ? args.fields : [args.fields];
                for (let i = 0; i < fields.length && i < vals.length; i++) {
                    kvParis.push(fields[i]);
                    kvParis.push(vals[i]);
                }
                this.client.HMSET(key, kvParis, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: res == Redis.RESULT_OK ? 1 : 0,
                        affectedRows: res == Redis.RESULT_OK ? 1 : 0
                    });
                });
                break;
            case define_1.CommandMode.List:
                if (filter.offset == undefined) {
                    fail("This need 'filter.offset' param when run lset command.");
                    return;
                }
                this.client.LSET(key, offset, vals[0], (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        //LIST为空表时，返回'no such key', 调用增加
                        this.client.RPUSH(key, vals[0], (err2, res2) => {
                            if (err2) {
                                fail(err2);
                                return;
                            }
                            success({
                                insertId: 0,
                                changedRows: 0,
                                affectedRows: Number(res2)
                            });
                        });
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: res == Redis.RESULT_OK ? 1 : 0,
                        affectedRows: res == Redis.RESULT_OK ? 1 : 0
                    });
                });
                break;
            case define_1.CommandMode.Queue:
            case define_1.CommandMode.Stack:
                fail("Not supperted queue or stack does set from redis list");
                break;
            case define_1.CommandMode.Set:
                this.client.SADD(key, vals, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res) || 0
                    });
                });
                break;
            case define_1.CommandMode.SortSet:
                let scores = Array.isArray(args.score) ? args.score : [(args.score || 0)];
                for (let i = 0; i < vals.length && i < scores.length; i++) {
                    kvParis.push(scores[i]);
                    kvParis.push(vals[i]);
                }
                this.client.ZADD(key, kvParis, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res) || 0
                    });
                });
                break;
            default:
                fail("Not supperted redis mode:" + String(mode));
                break;
        }
    }
    processRemove(cmd, args, fail, success) {
        let multi = args && args.multi !== undefined ? args.multi : /* istanbul ignore next */ false;
        let mode = args && args.mode || /* istanbul ignore next */ define_1.CommandMode.None;
        if (multi || Array.isArray(cmd)) {
            let keys = Array.isArray(cmd) ? cmd : [cmd];
            switch (mode) {
                case define_1.CommandMode.Key:
                case define_1.CommandMode.String:
                    this.client.DEL(keys, (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: Number(res)
                        });
                    });
                    break;
                case define_1.CommandMode.Hash:
                    fail("Not supperted mutil key remove from redis Hash.");
                    break;
                case define_1.CommandMode.Queue:
                case define_1.CommandMode.Stack:
                case define_1.CommandMode.List:
                    fail("Not supperted mutil key remove from redis List.");
                    break;
                case define_1.CommandMode.Set:
                    fail("Not supperted mutil key remove from redis Set.");
                    break;
                case define_1.CommandMode.SortSet:
                    fail("Not supperted mutil key remove from redis SortSet.");
                    break;
                default:
                    fail("Not supperted redis mode:" + String(mode));
                    break;
            }
            return;
        }
        let key = Array.isArray(cmd) ? cmd[0] : cmd;
        let vals = Array.isArray(args.entity) ? args.entity : [args.entity];
        let filter = args && args.filter || /* istanbul ignore next */ {};
        let where = filter.where || {};
        switch (mode) {
            case define_1.CommandMode.Key:
            case define_1.CommandMode.String:
                if (args.expired) {
                    // NX: only key is not exist
                    this.client.EXPIREAT(key, args.expired, (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: Number(res)
                        });
                    });
                }
                else {
                    this.client.DEL(key, (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: Number(res)
                        });
                    });
                }
                break;
            case define_1.CommandMode.Hash:
                let fields = Array.isArray(args.fields) ? args.fields : [args.fields];
                this.client.HDEL(key, fields, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res)
                    });
                });
                break;
            case define_1.CommandMode.List:
                this.client.LREM(key, filter.limit || 0, vals[0], (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res)
                    });
                });
                break;
            case define_1.CommandMode.Queue: // rigth in left out
            case define_1.CommandMode.Stack:
                this.client.LPOP(key, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: res ? 1 : 0,
                        item: res
                    });
                });
                break;
            case define_1.CommandMode.Set:
                this.client.SREM(key, vals, (err, res) => {
                    /* istanbul ignore if */
                    if (err) {
                        fail(err);
                        return;
                    }
                    success({
                        insertId: 0,
                        changedRows: 0,
                        affectedRows: Number(res)
                    });
                });
                break;
            case define_1.CommandMode.SortSet:
                if (where.withscores && (where.min || where.max)) {
                    this.client.ZREMRANGEBYSCORE(key, (where.min || '-inf'), (where.max || '+inf'), (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: Number(res)
                        });
                    });
                }
                else if (where.min && where.max) {
                    // when rankno
                    this.client.ZREMRANGEBYRANK(key, where.min, where.max, (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: Number(res)
                        });
                    });
                }
                else {
                    this.client.ZREM(key, vals, (err, res) => {
                        /* istanbul ignore if */
                        if (err) {
                            fail(err);
                            return;
                        }
                        success({
                            insertId: 0,
                            changedRows: 0,
                            affectedRows: Number(res)
                        });
                    });
                }
                break;
            default:
                fail("Not supperted redis mode:" + String(mode));
                break;
        }
    }
}
Redis.RESULT_OK = "OK";
exports.default = Redis;
