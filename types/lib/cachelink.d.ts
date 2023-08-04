import { CacheNode } from "../define";
/**
 * create cache node object.
 */
export declare function CreateNode(key: string): CacheNode;
/**
 *
 */
export declare class CacheLink {
    length: number;
    private head;
    private tail;
    constructor();
    /**
     * unshift
     */
    unshift(node: CacheNode): CacheNode;
    /**
     * push
     */
    push(node: CacheNode): void;
    /**
     * pop
     */
    pop(): CacheNode;
    /**
     * remove
     */
    remove(node: CacheNode): void;
    /**
     * forward
     */
    forward(node: CacheNode): void;
    /**
     * backward
     */
    backward(node: CacheNode): void;
    /**
     * clear
     */
    clear(): void;
    /**
     * moveHead
     */
    moveHead(node: CacheNode): void;
    /**
     * keys
     */
    keys(): string[];
}
