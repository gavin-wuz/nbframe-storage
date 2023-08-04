var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const dbadapter_1 = require("../dbadapter");
/**
 * mongodb drive adapter.
 */
class Mongodb extends dbadapter_1.DbAdapter {
    constructor(mongodb, schema, settings, connectError) {
        super(schema, settings);
        this.mongodb = mongodb;
        this.connectError = connectError;
        this.collections = new Map();
    }
    checkInitialized() {
        if (!this.client) {
            throw `connected to mongodb server fail, at host:${this.config.host || ''}, port:${this.config.port || '27017'}.`;
        }
    }
    onConnectError(err) {
        this.connected = false;
        return this.connectError && this.connectError(err);
    }
    initialize() {
        if (!this.mongodb) {
            throw "no-init mongodb adapter, use 'npm install mongodb' and set 'storage.driveModule.mongodb' property.";
            // return this;
        }
        let s = this.settings, adapter = this;
        let config = {
            host: s.host || /* istanbul ignore next */ 'localhost',
            port: s.port,
            database: String(s.database),
            username: s.username || /* istanbul ignore next */ '',
            password: s.password || /* istanbul ignore next */ '',
            replSet: s.replset || /* istanbul ignore next */ '',
            safe: s.ssl ? true : /* istanbul ignore next */ false
        };
        let hosts = [];
        let ports = [];
        if (s.replset) {
            config.replSet = s.replset;
            if (s.url) {
                let murl = url.parse(s.url);
                let proto = murl.protocol;
                let uris = s.url.split(',');
                uris.forEach(function (uri) {
                    let durl = url.parse(uri.startsWith(proto) ? uri : (proto + '//' + uri));
                    hosts.push(durl.hostname || 'localhost');
                    ports.push(Number(durl.port || '27017'));
                    if (!config.database) {
                        config.database = durl.pathname.replace(/^\//, '');
                    }
                    if (!config.username) {
                        config.username = durl.auth && durl.auth.split(':')[0];
                    }
                    if (!config.password) {
                        config.password = durl.auth && durl.auth.split(':')[1];
                    }
                });
                config.host = hosts;
                config.port = ports;
            }
        }
        else if (s.url) {
            let durl = url.parse(s.url);
            config.host = durl.hostname;
            config.port = Number(durl.port || /* istanbul ignore next */ '27017');
            config.database = durl.pathname.replace(/^\//, '');
            config.username = durl.auth && durl.auth.split(':')[0];
            config.password = durl.auth && durl.auth.split(':')[1];
        }
        config.database = config.database || /* istanbul ignore next */ process.env.USER || /* istanbul ignore next */ 'test';
        this.config = config;
        let server;
        if (config.replSet) {
            let sets = [];
            for (let i = 0; i < hosts.length; i++) {
                sets.push(new adapter.mongodb.Server(hosts[i], ports[i], { auto_reconnect: true }));
            }
            server = new adapter.mongodb.ReplSet(sets, { rs_name: config.replSet });
        }
        /* istanbul ignore else */
        else {
            server = new adapter.mongodb.Server(config.host, config.port, {});
        }
        let db = new adapter.mongodb.Db(config.database, server, { safe: config.safe });
        db.open((err, client) => {
            /* istanbul ignore if */
            if (err) {
                adapter.onConnectError(err);
                return;
            }
            adapter.client = client;
            adapter.auth(config.username, config.password).then(() => {
                adapter.connected = true;
            }).catch((err) => {
                adapter.onConnectError(err);
            });
        });
        return this;
    }
    auth(username, password) {
        let t = this;
        return new Promise((resolve, reject) => {
            if (username && password) {
                t.client.authenticate(username, password, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            }
            else {
                setImmediate(resolve);
            }
        });
    }
    collection(cmd) {
        this.checkInitialized();
        let table = Array.isArray(cmd) ? cmd[0] : cmd;
        if (this.client.collection) {
            return this.client.collection(table);
        }
        if (!this.collections.has(table)) {
            this.collections.set(table, new this.mongodb.Collection(this.client, table));
        }
        return this.collections.get(table);
    }
    /** */
    newAutoObjectID() {
        return this.mongodb.ObjectID().toString();
    }
    toEntityId(id) {
        if (!id)
            return undefined;
        /* istanbul ignore if */
        if (typeof (id) == "string")
            return id;
        return this.mongodb.ObjectID(id).toString();
    }
    /**
     * parse entity id
     */
    parseEntityId(id) {
        if (typeof id === 'string') {
            return new this.mongodb.ObjectID(id);
        }
        return id;
    }
    connect() {
        //TODO: not need check, because it use promise call.
        return new Promise((resolve, _reject) => {
            setImmediate(resolve);
        });
    }
    disconnect() {
        this.checkInitialized();
        this.client.close();
    }
    parseWhere(options) {
        let filter = options.filter || {};
        return filter.id ? { _id: this.parseEntityId(filter.id) } : filter.where || {};
    }
    find(cmd, options) {
        let filter = options.filter || {};
        let where = this.parseWhere(options);
        let cursor = this.collection(cmd).find(where);
        if (filter.order) {
            cursor.sort(filter.order);
        }
        if (filter.limit) {
            cursor.limit(filter.limit);
        }
        if (filter.skip || filter.offset) {
            cursor.skip(filter.skip || filter.offset);
        }
        return cursor;
    }
    query(cmd, args, callback) {
        let multi = args && args.multi !== undefined ? args.multi : true;
        if (!multi) {
            let where = this.parseWhere(args);
            this.collection(cmd).findOne(where, callback);
            return;
        }
        let cursor = this.find(cmd, args);
        cursor.toArray(callback);
    }
    queryAsync(cmd, args) {
        let multi = args && args.multi !== undefined ? args.multi : true;
        if (!multi) {
            let where = this.parseWhere(args);
            // return Promise<T>
            return this.collection(cmd).findOne(where);
        }
        let cursor = this.find(cmd, args);
        // return Promise<T[]>
        return cursor.toArray();
    }
    count(cmd, args, callback) {
        let where = this.parseWhere(args);
        this.collection(cmd).count(where, callback);
    }
    countAsync(cmd, args) {
        let where = this.parseWhere(args);
        // return Promise<T>
        return this.collection(cmd).count(where);
    }
    add(cmd, args, callback) {
        let multi = args && args.multi !== undefined ? args.multi : true;
        let self = this;
        if (!args || !args.entity) {
            throw "Not args.entity param at add().";
        }
        if (!multi || !Array.isArray(args.entity)) {
            this.collection(cmd).insertOne(args.entity, (err, res) => {
                /* istanbul ignore if */
                if (err) {
                    return callback && callback(err);
                }
                callback && callback(undefined, {
                    insertId: self.toEntityId(res.insertedId),
                    changedRows: 0,
                    affectedRows: res.insertedCount || 0
                });
            });
            return;
        }
        this.collection(cmd).insertMany(args.entity, (err, res) => {
            /* istanbul ignore if */
            if (err) {
                return callback && callback(err);
            }
            let ids = [];
            res.insertedIds.forEach((el) => {
                ids.push(self.toEntityId(el));
            });
            callback && callback(undefined, {
                insertId: ids,
                changedRows: 0,
                affectedRows: res.insertedCount || 0
            });
        });
    }
    addAsync(cmd, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let multi = args && args.multi !== undefined ? args.multi : true;
            let self = this;
            let res;
            if (!args || !args.entity) {
                throw "Not args.entity param at addAsync().";
            }
            if (!multi || !Array.isArray(args.entity)) {
                res = yield this.collection(cmd).insertOne(args.entity);
                return {
                    insertId: self.toEntityId(res.insertedId),
                    changedRows: 0,
                    affectedRows: res.insertedCount || 0
                };
            }
            res = yield this.collection(cmd).insertMany(args.entity);
            let ids = [];
            res.insertedIds.forEach((el) => {
                ids.push(self.toEntityId(el));
            });
            return {
                insertId: ids,
                changedRows: 0,
                affectedRows: res.insertedCount || 0
            };
        });
    }
    /**
     * exceute update command befor when result is false exculte insert command.
     * only update command when multi is true.
     */
    setOrAdd(cmd, args, callback) {
        let multi = args && args.multi !== undefined ? args.multi : true;
        let self = this;
        if (!args || !args.upsert) {
            throw "Not args.upsert param at setOrAdd().";
        }
        let where = this.parseWhere(args);
        if (!multi) {
            this.collection(cmd).updateOne(where, { '$set': args.upsert }, { upsert: true }, (err, res) => {
                /* istanbul ignore if */
                if (err) {
                    callback && callback(err);
                    return;
                }
                callback && callback(undefined, {
                    insertId: self.toEntityId(res.upsertedId),
                    changedRows: res.matchedCount || 0,
                    affectedRows: res.matchedCount || 0
                });
            });
            return;
        }
        this.collection(cmd).updateMany(where, { '$set': args.upsert }, { w: 1, multi: true }, (err, res) => {
            /* istanbul ignore if */
            if (err) {
                callback(err);
                return;
            }
            callback(undefined, {
                insertId: undefined,
                changedRows: res.result.nModified || 0,
                affectedRows: res.result.nModified || 0
            });
        });
    }
    setOrAddAsync(cmd, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let multi = args && args.multi !== undefined ? args.multi : true;
            let self = this;
            if (!args || !args.upsert) {
                throw "Not args.upsert param at setOrAddAsync().";
            }
            let res;
            let where = this.parseWhere(args);
            if (!multi) {
                res = yield this.collection(cmd).updateOne(where, { '$set': args.upsert }, { upsert: true });
                return {
                    insertId: self.toEntityId(res.upsertedId),
                    changedRows: res.matchedCount || 0,
                    affectedRows: res.matchedCount || 0
                };
            }
            res = yield this.collection(cmd).updateMany(where, { '$set': args.upsert }, { w: 1, multi: true });
            return {
                insertId: undefined,
                changedRows: res.result.nModified || 0,
                affectedRows: res.result.nModified || 0
            };
        });
    }
    remove(cmd, args, callback) {
        let multi = args && args.multi !== undefined ? args.multi : true;
        let where = this.parseWhere(args);
        if (!multi) {
            this.collection(cmd).deleteOne(where, (err, res) => {
                /* istanbul ignore if */
                if (err) {
                    callback && callback(err);
                    return;
                }
                callback && callback(undefined, {
                    insertId: undefined,
                    changedRows: 0,
                    affectedRows: res.deletedCount || 0
                });
            });
            return;
        }
        this.collection(cmd).deleteMany(where, (err, res) => {
            /* istanbul ignore if */
            if (err) {
                callback(err);
                return;
            }
            callback(undefined, {
                insertId: undefined,
                changedRows: 0,
                affectedRows: res.deletedCount || 0
            });
        });
    }
    removeAsync(cmd, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let multi = args && args.multi !== undefined ? args.multi : true;
            let where = this.parseWhere(args);
            let res;
            if (!multi) {
                res = yield this.collection(cmd).deleteOne(where);
                return {
                    insertId: undefined,
                    changedRows: 0,
                    affectedRows: res.deletedCount || 0
                };
            }
            res = yield this.collection(cmd).deleteMany(where);
            return {
                insertId: undefined,
                changedRows: 0,
                affectedRows: res.deletedCount || 0
            };
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
}
exports.default = Mongodb;
