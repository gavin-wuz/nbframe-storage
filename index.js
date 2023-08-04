function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 导出可模块外访问，包含文件中所有export 类及接口等
 */
__export(require("./define"));
/**
 * 仅当前内部使用
 */
const storage_1 = require("./storage");
__export(require("./lib/cache"));
__export(require("./lib/database"));
/**
 * 模块外可访问
 */
exports.default = storage_1.default;
