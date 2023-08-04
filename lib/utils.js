Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
class Utils {
    constructor() {
    }
    /**
     * hashCode
     * @param src source string
     */
    hashCode(src) {
        return crypto.createHash("md5").update(src, "utf8").digest('hex');
    }
    /**
     * 生成唯一随机字串
     */
    generateNonce() {
        return Date.now() + this.randomString(12);
    }
    /**
     * 随机字符串
     */
    randomString(len) {
        len = len || 8;
        let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        let maxPos = chars.length;
        let res = '';
        for (let i = 0; i < len; i++) {
            res += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return res;
    }
}
exports.Utils = Utils;
exports.default = new Utils();
