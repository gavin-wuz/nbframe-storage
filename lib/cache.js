Object.defineProperty(exports, "__esModule", { value: true });
const define_1 = require("../define");
const lfu_1 = require("./policy/lfu");
const lru_1 = require("./policy/lru");
/**
 * LocalCache
 */
class Cache {
    constructor(max, mode, inveral) {
        this.dataMap = new Map();
        switch (mode) {
            case define_1.CachePolicyMode.LRU:
                this.policy = new lru_1.LRU(max);
                break;
            case define_1.CachePolicyMode.LFU:
                this.policy = new lfu_1.LFU(max);
                break;
            default:
                break;
        }
        this.init(inveral);
    }
    /**
     * init
     */
    init(inveral) {
        setInterval(this.check, inveral, this);
    }
    check(cache) {
        try {
            let dataMap = cache.dataMap, policy = cache.policy, remKeys = [];
            dataMap.forEach((cacheItem, key) => {
                let insertTime = cacheItem.time, expire = cacheItem.expire, curTime = +new Date(), node = cacheItem.node;
                if (expire && expire != -1 && curTime - insertTime > expire) {
                    policy && policy.remove(node);
                    remKeys.push(key);
                }
            });
            remKeys.forEach(key => {
                dataMap.delete(key);
            });
        }
        catch (err) {
            console.error(`cache timer check error:%j`, err);
        }
    }
    /**
     * count
     */
    count() {
        return this.dataMap.size;
    }
    /**
     * keys
     */
    keys() {
        return this.policy.keys();
    }
    /**
     *  get
     */
    get(key) {
        let dataMap = this.dataMap, policy = this.policy, cacheItem = dataMap.get(key);
        if (cacheItem) {
            let insertTime = cacheItem.time, expire = cacheItem.expire, node = cacheItem.node, curTime = +new Date();
            if (!expire || expire == -1 || (expire && curTime - insertTime < expire)) {
                policy && policy.update(node);
                return cacheItem.value;
            }
            if (expire && expire != -1 && curTime - insertTime > expire) {
                policy.remove(node);
            }
        }
        return undefined;
    }
    /**
     * set key-value to cache
     * @param key key
     * @param value val
     * @param expire expier
     */
    set(key, value, expire = -1) {
        let dataMap = this.dataMap, policy = this.policy, cacheItem = dataMap.get(key);
        if (cacheItem) {
            cacheItem.value = value;
            cacheItem.expire = expire;
            policy && policy.update(cacheItem.node);
        }
        else {
            var returnNode = policy && policy.insert(key) || undefined;
            dataMap.set(key, {
                value: value,
                expire: expire,
                time: +new Date(),
                node: returnNode && returnNode.node || undefined
            });
            returnNode && returnNode.keys.forEach(function (key) {
                dataMap.delete(key);
            });
            //todo:
            // console.warn('cache count:%d, node:%j, rem keys:%j', this.count(), returnNode, returnNode.keys);
        }
    }
    /**
     * clear
     */
    clear() {
        this.dataMap.clear();
        this.policy = undefined;
    }
}
exports.Cache = Cache;
