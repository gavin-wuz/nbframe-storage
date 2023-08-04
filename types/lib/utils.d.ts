export declare class Utils {
    constructor();
    /**
     * hashCode
     * @param src source string
     */
    hashCode(src: string): string;
    /**
     * 生成唯一随机字串
     */
    generateNonce(): string;
    /**
     * 随机字符串
     */
    randomString(len: number): string;
}
declare const _default: Utils;
export default _default;
