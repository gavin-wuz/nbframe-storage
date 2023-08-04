import { CachePolicy, CacheNode, CachePolicyResult } from "../../define";
export declare class LFU implements CachePolicy {
    private linkQueue;
    private max;
    /**
     * new an CachePolicy type object
     */
    constructor(max: number);
    /**
     * keys
     */
    keys(): string[];
    /**
     * insert key bind node
     * @param key
     */
    insert(key: string): CachePolicyResult;
    /**
     * update node bind
     * @param node
     */
    update(node: CacheNode): void;
    /**
     * remove node bind
     * @param node
     */
    remove(node: CacheNode): void;
}
