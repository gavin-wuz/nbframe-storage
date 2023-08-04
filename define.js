Object.defineProperty(exports, "__esModule", { value: true });
/**
 * database type.
 */
var DbType;
(function (DbType) {
    DbType[DbType["unknow"] = 0] = "unknow";
    DbType[DbType["mysql"] = 1] = "mysql";
    DbType[DbType["postgres"] = 2] = "postgres";
    /** nosql */
    DbType[DbType["clickhouse"] = 7] = "clickhouse";
    /** nosql-mongodb */
    DbType[DbType["mongodb"] = 8] = "mongodb";
    /** nosql-redis */
    DbType[DbType["redis"] = 9] = "redis";
})(DbType = exports.DbType || (exports.DbType = {}));
var TenantMode;
(function (TenantMode) {
    /** not mutil tenant */
    TenantMode[TenantMode["None"] = 0] = "None";
    /** one an tenant use one of schema */
    TenantMode[TenantMode["Schema"] = 1] = "Schema";
    /** one an tenant use one of database */
    TenantMode[TenantMode["Database"] = 2] = "Database";
    /** mutil tenant use same of table */
    TenantMode[TenantMode["Shared"] = 3] = "Shared";
})(TenantMode = exports.TenantMode || (exports.TenantMode = {}));
/** command storage mode */
var CommandMode;
(function (CommandMode) {
    CommandMode[CommandMode["None"] = 0] = "None";
    /** only does key, warn use query key has lock all keys for redis */
    CommandMode[CommandMode["Key"] = 1] = "Key";
    CommandMode[CommandMode["String"] = 2] = "String";
    CommandMode[CommandMode["Hash"] = 3] = "Hash";
    CommandMode[CommandMode["List"] = 4] = "List";
    CommandMode[CommandMode["Queue"] = 5] = "Queue";
    CommandMode[CommandMode["Stack"] = 6] = "Stack";
    CommandMode[CommandMode["Set"] = 7] = "Set";
    CommandMode[CommandMode["SortSet"] = 8] = "SortSet";
    /** 自定义的结构 */
    CommandMode[CommandMode["Bloom"] = 9] = "Bloom";
})(CommandMode = exports.CommandMode || (exports.CommandMode = {}));
function UndefinedPromiseError(method) {
    return new Promise((_, reject) => setImmediate(() => reject(`throw an undefined exception at method:${method} at nbframe-storage.`)));
}
exports.UndefinedPromiseError = UndefinedPromiseError;
function IdlePromiseResult() {
    return new Promise((resolve) => setImmediate(resolve));
}
exports.IdlePromiseResult = IdlePromiseResult;
/**
 * cache expire policy mode
 */
var CachePolicyMode;
(function (CachePolicyMode) {
    CachePolicyMode["None"] = "";
    /** Least Recently Used */
    CachePolicyMode["LRU"] = "LRU";
    /** Least Frequently Used */
    CachePolicyMode["LFU"] = "LFU";
})(CachePolicyMode = exports.CachePolicyMode || (exports.CachePolicyMode = {}));
/** 扩展string方法 */
String.prototype.trimEnd = function () {
    return this;
};
