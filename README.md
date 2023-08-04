# nbframe-storage

suport `mysql`, `mongodb`, `redis`, `clickhouse` drive.

## Milestones

### 0.5.0

- [x] 增加`clickhouse`数据库支持;

### 0.3.20

- [x] 优化MySql空闲断开连接池重连问题;

### 0.3.2

- [x] 查询参数增加string[],number[];

### 0.3.0

- [x] 修复redis获取自增的BUG;
- [x] 修复redis SortSet模式带分值返回的BUG;

### 0.1.0 - Dev

![Progress](http://progressed.io/bar/5)

- [x] build project schema.
- [x] support mysql drive access.
- [x] support mongodb drive access.
- [x] support redis drive access.


## Usage Example

- configure()方法
    ```ts
    /** frameStorage.ts */
    import mysql = require('mysql');
    import redis = require('redis');
    import mongodb = require('mongodb');
    const { ClickHouse } = require('clickhouse');
    import NbframeStorage from "nbframe-storage"
    const storage = new NbframeStorage();
    // 设置多个数据库驱动
    storage.driveModule.mysql = mysql;
    storage.driveModule.mongodb = mongodb;
    storage.driveModule.redis = redis;
    storage.driveModule.clickhouse = ClickHouse;

    let configMysql = [{
        drive: "mysql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "",
        database: "testdb",
        pool: true
    }];
    let db = storage.configure("mysql-1", configMysql);
    db.checkConnect((err)=>{}, ()=>{});
    ```

- connect()方法
    ```ts
    let db = storage.connect("mysql-1");

    ```

- 使用原驱动方法
    ```ts
    let db = storage.connect("redis-1");
    let client = db.dispatch();
    client.ZINCRBY("mainKey", 1234, '{userid:"1001"}', (res)=>{
        let new_scoe = res;
    });

    # 强制连接主库连接
    let client = db.dispatchMaster();
    ```
    [redis原生方法指令参考](https://github.com/types/npm-redis/blob/master/index.d.ts)


