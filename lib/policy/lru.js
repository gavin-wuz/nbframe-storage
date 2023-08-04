Object.defineProperty(exports, "__esModule", { value: true });
const cachelink_1 = require("../cachelink");
class LRU {
    /**
     * new an CachePolicy type object
     */
    constructor(max) {
        this.max = max;
        this.linkQueue = new cachelink_1.CacheLink();
    }
    /**
     * keys
     */
    keys() {
        return this.linkQueue.keys();
    }
    /**
     * insert key bind node
     * @param key
     */
    insert(key) {
        let node = cachelink_1.CreateNode(key);
        var removeKeys = [];
        while (this.linkQueue.length >= this.max) {
            removeKeys.push(this.linkQueue.pop().key);
        }
        this.linkQueue.push(node);
        return {
            node: node,
            keys: removeKeys
        };
    }
    /**
     * update node bind
     * @param node
     */
    update(node) {
        this.linkQueue.moveHead(node);
    }
    /**
     * remove node bind
     * @param node
     */
    remove(node) {
        this.linkQueue.remove(node);
    }
}
exports.LRU = LRU;
