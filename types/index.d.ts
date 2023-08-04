/**
 * 导出可模块外访问，包含文件中所有export 类及接口等
 */
export * from './define';
/**
 * 仅当前内部使用
 */
import NbframeStorage from './storage';
export * from './lib/cache';
export * from './lib/database';
export default NbframeStorage;
