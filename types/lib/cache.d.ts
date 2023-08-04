import { CachePolicyMode } from "../define";
/**
 * LocalCache
 */
export declare class Cache {
    private dataMap;
    /** value allow null */
    private policy;
    constructor(max: number, mode: CachePolicyMode, inveral: number);
    /**
     * init
     */
    private init(inveral);
    private check(cache);
    /**
     * count
     */
    count(): number;
    /**
     * keys
     */
    keys(): string[];
    /**
     *  get
     */
    get(key: string): any;
    /**
     * set key-value to cache
     * @param key key
     * @param value val
     * @param expire expier
     */
    set(key: string, value: any, expire?: number): void;
    /**
     * clear
     */
    clear(): void;
}
