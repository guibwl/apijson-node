# Node 版本 APIJSON

- 前端(客户端) 定制返回 JSON 的数据和结构
- 远高于传统 RESTful 方式的开发效率
- 中国版的 GraphQl，由腾讯开源
- JSON 协议 与 ORM 库

官方介绍：
<img style="margin: 0; padding: 0; width: 100%; height: 100%;" src="http://apijson.org/images/WhyChooseAPIJSON.jpg" alt="官方介绍">

### 使用场景
1. 连接数据库，前端可以存储持久化数据。
2. 前端根据入参语法，可以自定义出参，不在为格式问题而苦恼。
3. 当需要对数据进行重聚编排时，我们可以将这部分数据放到 APIJSON 中，以减少网络开销。

交互：
![BFF.png](https://i.loli.net/2021/04/08/uHM75zYBTp8rE3N.png)


关于权限，有两个方案：

1，透传前端鉴权 token 给 Service 层，由 Service 层返回该用户的权限配置，APIJSON 根据配置从数据库中读取数据并 Response。
2，将鉴权逻辑直接做到 APIJSON 层。所有权限规则由 APIJSON 控制。


### 安装

1. 目前还未上线，以下以 DEMO 进行讲解：https://github.com/guibwl/apijson-node.git

2. 进入项目目录:

```sh
npm install
```

3. 配置

创建 `ormconfig.js` 配置文件(可以参考 `ormconfig.js.example`)；

```js

{

  "type": "mysql", // 数据库类型

  "host": "localhost", // 数据库地址

  "port": 3306, // 端口号，默认 3306

  "username": "", // 数据库访问账号

  "password": "", // 数据库访问密码

  "database": "", // 数据库库名称

  "entities": [`${SOURCE_PATH}/**/**.entity{.ts,.js}`], // 项目中实体文件的地址

  "synchronize": false // 是否同步

}

```

> 具体数据库地址，请联系管理员获取；

4. 开发环境启动

```sh
npm run dev
```

> 在 vscode 的配置中开启 `Debug › JavaScript: Auto Attach Filter`，可以在 vscode 的中直接打断点调试。


### 添加实例

APIJSON 在对数据库某张表进行 CRUD 之前，需要为该表添加对应的 entity:

在 `src/entities`目录中创建 `user.entity.ts` 文件；

```ts

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

 // 这里表示操作的为数据库中的 "user" 表；
@Entity('user')
// 定义 UserEntity
export class UserEntity {
    // 以下定义实体的 column，该 column 字段必须为 "user" 表中真实存在的。
    // 定义主 column，这个字段会作为数据的唯一 Id 并用于默认排序
    @PrimaryGeneratedColumn()
    id: number
    // 定义其余 column
    @Column()
    user: string
    ...
}
// 定义 User 实例的描述
export const User = {
    column: [{
        key: 'id',
        desc: 'ID'
        }, {
        key: 'user',
        desc: '用户名'
    }],
    primary: ['id'],
    desc: '用户表'
}
```
然后把 `user.entity.ts` 文件注册到  `src/entities/index.ts` 文件中；
```ts
import { UserEntity, User } from './user.entity'

const config = {
  User,
  ...
}

export {
  UserEntity,
  config
}
```
以上我们便完成实例添加，接下来我们可以对 "user" 表进行 CRUD 了；


### 基本接口
目前 APIJSON 提供的 CRUD 接口；


- 通用查询接口 `POST /apijson/get`
- 通用新增接口 `POST /apijson/add`
- 通用修改接口 `POST /apijson/update`
- 查询 column 信息接口 `GET /table`


### 已实现的操作符

假设我们有两张表：
1. User：

|id|user|nickname|role|
|--|----|--------|----|
|1|kevin|coldplay|boss|
|2|tony|tiger|employee|
|3|iris|cruise|employee|

2. Comment

|id|comment|userId|
|--|-------|------|
|1|first|2|
|2|hello|3|
|3|world|3|
|4|last|3|




- 单条记录查询
```json
{
    "User": {
        "id": "1"
    }
}
```
output
```json
{
    "code": 0,
    "data": {
        "User": {
            "id": 1,
            "user": "kevin",
            "nickname": "coldplay",
            "role": "boss"
        }
    },
    "msg": "success"
}
```


- []
操作符名称： 列表查询

```json
// 这里[]前的字符串将作为response的字段名
{
    "myList[]": {
        "User": {}
    }
}
```
output
```json
{
    "code": 0,
    "data": {
        "myList": [
            {
                "id": 1,
                "user": "kevin",
                "nickname": "coldplay",
                "role": "boss"
            },
            {
                "id": 2,
                "user": "tony",
                "nickname": "tiger",
                "role": "employee"
            },
            {
                "id": 3,
                "user": "iris",
                "nickname": "cruise",
                "role": "employee"
            }
        ]
    },
    "msg": "success"
}
```
- \#
操作符名称： 别名

```json
{
    "myBoss#": {
        "User": {"role": "boss"}
    }
}
```
output
```json
{
    "code": 0,
    "data": {
        "employeeUser": {
            "User": {
                "id": 1,
                "user": "kevin",
                "nickname": "coldplay",
                "role": "boss"
            }
        }
    },
    "msg": "success"
}
```

- @column
操作符名称： 字段筛选
```json
{
    "User": {
        "role": "boss",
        "@column": "role,nickname"
    }
}
```
output
```json
{
    "code": 0,
    "data": {
        "User": {
            "nickname": "coldplay",
            "role": "boss"
        }
    },
    "msg": "success"
}
```

- 联表查询

查询叫tony的User；
查询一条userId为User中id的Comment；

```json
{
    "User": {
        "user": "iris"
    },
    "Comment": {
        "userId@": "User/id"
    }
}
```

output

```json
{
    "code": 0,
    "data": {
        "User": {
            "id": 3,
            "user": "iris",
            "nickname": "cruise",
            "role": "employee"
        },
        "Comment": {
            "id": 2,
            "comment": "hello",
            "userId": 3
        }
    },
    "msg": "success"
}
```

查询所有符合条件的comment 显示 第1页 每页2条 (因为默认page = 1 count = 10 所以默认最多为10条)
```json
{
    "User": {
        "user": "iris"
    },
    "msgList[]": {
        "Comment": {
            "userId@": "User/id"
        },
        "count": 2,
        "page": 1
    }
}
```

output

```json
{
    "code": 0,
    "data": {
        "User": {
            "id": 3,
            "user": "iris",
            "nickname": "cruise",
            "role": "employee"
        },
        "msgList": {
            "Comment": [
                {
                    "id": 2,
                    "comment": "hello",
                    "userId": 3
                },
                {
                    "id": 3,
                    "comment": "world",
                    "userId": 3
                }
            ],
            "count": 2,
            "page": 1
        }
    },
    "msg": "success"
}
```

- 综合例子
```json
{
    "userInfo#": {
          "User": {
              "user": "iris"
          }
    },
    "testAlias#": {
        "msgList[]": {
            "Comment": {
                "userId@": "userInfo#/User/id",
                "@column": "comment"
            },
            "count": 2,
            "page": 1
        }
    }
}
```

output

```json
{
    "code": 0,
    "data": {
        "userInfo": {
            "User": {
                "id": 3,
                "user": "iris",
                "nickname": "cruise",
                "role": "employee"
            }
        },
        "testAlias": {
            "msgList": {
                "Comment": [
                    {
                        "comment": "hello"
                    },
                    {
                        "comment": "world"
                    }
                ],
                "count": 2,
                "page": 1
            }
        }
    },
    "msg": "success"
}
```


## 如何创建一个接口

在 Nest 里，有三个比较基本的概念 "Controllers"、"Providers"、"Modules"，一个独立的好的接口通常由这三样组成。在本应用中这些都被存放在 ``src/http/`` 目录。

### Modules
模块和所有 Js 项目是一样的概念，一切独立的功能、逻辑、抽象层都可以被封装成模块，这取决于开发者如何定义。
我们看下本应用中的根模块 `src/http/app.module.ts`：

```ts
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { JsonModule } from './json/json.module'
import { CatsModule } from './cats/cats.module'

// 我们在这里使用 Module 装饰器定义模块的配置
@Module({
  // imports 这里引用我们要添加到根的子模块，
  // 子模块的结构和根模块大致相同
  imports: [
    TypeOrmModule.forRoot(),
    JsonModule,
    CatsModule,
  ],
  // controllers 里引入的 controller 通常是一个 Class，
  // 它主要用途是定义接口
  controllers: [
    AppController
  ],
  // 这里我们定义需要 `依赖注入` 的实例
  providers: []
})
// 根模块 Class
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}


```
Modules 的配置说明：
|属性|描述|
|:-----:|:-----:|
|providers| 由 Nest 注入器实例化的提供者，并且可以至少在整个模块中共享|
|controllers|必须创建的一组控制器|
|imports|导入模块的列表，这些模块导出了此模块中所需提供者|
|exports|由本模块提供并应在其他模块中可用的提供者的子集。|


### Controller

再看下它的 Controller，我们通常在这里定义接口：

```ts
import { Get, Controller } from '@nestjs/common'
import { config } from '../entities'

// Controller 装饰器
@Controller()
export class AppController {
  /**
   * 健康检查接口
   */
  @Get('/test')
  root(): string {
    return 'ok'
  }

  @Get('/table')
  getTable(): any {
    return config
  }
}
```

从上面我们看到，它定义了两个 get 请求接口，如第一个的请求地址是 `http://localhost:port/test`，它返回 'ok'；在 Controller 中，接口方法 return 什么接口就返回什么；

完整的类型接口如下：

```ts
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';

@Controller('prefix')
export class MyController {
  @Post()
  create(@Body() createDataDto: CreateDataDto) {
    return 'This action adds a new data';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all data (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} data`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDataDto: UpdateDataDto) {
    return `This action updates a #${id} data`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} data`;
  }
}
```
`@Controller` 方法内传入的值，将称为 Class 内所有路由的统一前缀。
这里我们使用 `@Body`、`@Param` 等对参数进行解析，它的参照表如下：

|Origin|Target|
|----------|-----------|
|`@Request()`	|`req`|
|`@Response()`	|`res`|
|`@Next()`	|`next`|
|`@Session()`	|`req.session`|
|`@Param(key?: string)`	|`req.params` / `req.params[key]`       |
|`@Body(key?: string)`	|`req.body` / `req.body[key]`|
|`@Query(key?: string)`	|`req.query` / `req.query[key]`|
|`@Headers(name?: string)`	|`req.headers` / `req.headers[name]`|


### Providers

Providers 的作用是依赖注入，它有点类似 Class 里的继承，可以让 Controller 通过 this 获取注入的 Class 的属性。

假设我们有如下文件：

```sh
.
├── my.controller.ts
├── my.module.ts
└── my.service.ts
```


```ts
// my.service.ts
import { Injectable} from '@nestjs/common'

interface Data {
  [key: string]: any;
}

@Injectable()
export class MyService {
  private readonly data: Data[] = [];

  create(data: Data) {
    this.data.push(data);
    return "Successfully add."
  }
}
```
通过 Injectable 装饰器，我们将该 Class 标记为可依赖注入的；现在我们要在 Controller 中使用它：

```ts
// my.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MyService } from './my.service';

interface CreateMyDto {
  [key: string]: any;
}

@Controller('my')
export class MyController {
  constructor(private myService: MyService) {}

  @Post()
  async create(@Body() createMyDto: CreateMyDto) {
    return this.myService.create(createMyDto);
  }
}
```
上面 Controller 方法，this.myService.method 获取到 MyService 中的方法。接下来我们看看 Module：

```ts
// my.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { MyController } from './my.controller'
import { MyService } from './my.service'

@Module({
  controllers: [MyController],
  providers: [MyService],
  exports: [MyService]
})
export class MyModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {}
}
```

上面的 Module 装饰器中，controllers 负责添加 MyController，providers 则负责添加 MyService 实现依赖注入，exports 则可以导出 MyService，这样其他 imports 属性 import 了 MyModule 的 Module 将可以共享 MyService 实例。

## 调用第三方接口

我们有时会有调用第三方接口，并处理接口数据后返回的需求，在 Nest 里，这也是轻易可以做到的，在任意Controller中添加方法，然后使用 axios 调用第三方接口，并返回获取的数据；

```ts

function dataFactory(data) {
  let newData = data;
  // ...对 newData 进行任意加工修改
  return newData;
}

@Controller('prefix')
export class ProxyController {
  @Post('proxy')
  async proxy() {
    return await axios.post('http://apijson.cn:8080/get', {"User":{"id": 82001}})
      .then(function (response) {
        return dataFactory(response.data);
      })
      .catch(function (error) {
        return error;
      });
  }
}
```


## 使用 node.js  `mysql` 模块

> 数据库连接地址请联系管理员提供测试账号及地址，你也可以安装本地 `mysql` 数据库进行调试。[原文](https://www.w3schools.com/nodejs/nodejs_mysql.asp)

这里使用 npm 开源库 `mysql` 进行示例，首先在你的项目中要先安装：

```sh
npm install mysql
```

然后就可以引用 `mysql` 模块进行数据库操作了。

接下来的例子我们创建 ```demo.js```进行示例，每一个例子都使用 ```node demo.js``` 命令来执行代码；

连接数据库示例：

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  port: 3306, // Default port，mostly you don't need to define it, but diffrent port;
  user: "yourusername",
  password: "yourpassword"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

```



查询数据库基本使用如下方法进行，sql 一般是原生 sql 语句：



```js

const sql = 'SOME SQL';

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
  });
});

```



### 创建 "数据库"

创建一个名为 'mydb' 的数据库，使用 `CREATE DATABASE` 语句：



```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE mydb", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});

```



### 创建"表"

创建名为 `customers` 的表，使用 `CREATE TABLE` 语句。

> 在具体操作前，请确保配置了对应的数据库名称，否则将会报错；



```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb" // 指定数据库
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});

```



上面我们创建了一张名为 customers 的表，同时设置了两列名为 name、address 的 column；

我们在创建表后，应该为每条数据都设置一个唯一的 'key'，以此用于检索数据或默认排序等。

可以使用 "INT AUTO_INCREMENT PRIMARY KEY" 为每条数据插入唯一的从1开始递增的数字；



```js
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), address VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});
```


如果“表”已经存在，则使用 ALTER TABLE 关键字：

`ALTER TABLE customers ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY`


### 为表插入数据

使用 "INSERT INTO" 语句插入数据：


```js
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
});
```


插入多条数据：

使用 `INSERT INTO customers (name, address) VALUES ?` 语句，需要插入的数据使用数组包裹：



```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO customers (name, address) VALUES ?";
  var values = [
    ['John', 'Highway 71'],
    ['Peter', 'Lowstreet 4'],
    ['Amy', 'Apple st 652'],
    ['Hannah', 'Mountain 21'],
    ['Michael', 'Valley 345'],
    ['Sandy', 'Ocean blvd 2'],
    ['Betty', 'Green Grass 1'],
    ['Richard', 'Sky st 331'],
    ['Susan', 'One way 98'],
    ['Vicky', 'Yellow Garden 2'],
    ['Ben', 'Park Lane 38'],
    ['William', 'Central st 954'],
    ['Chuck', 'Main Road 989'],
    ['Viola', 'Sideway 1633']
  ];
  con.query(sql, [values], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
  });
});

```



上面函数中 `result` 参数反馈插入数据后对该表的影响：



```js

{
  fieldCount: 0,
  affectedRows: 14,
  insertId: 0,
  serverStatus: 2,
  warningCount: 0,
  message: '\'Records:14  Duplicated: 0  Warnings: 0',
  protocol41: true,
  changedRows: 0
}

```



### 从表中查询数据



使用 "SELECT" 语句来进行相关操作，SELECT *  会返回该表所有 columns：



```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM customers", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

```

result 对象：

```js

[
  { id: 1, name: 'John', address: 'Highway 71'},
  { id: 2, name: 'Peter', address: 'Lowstreet 4'},
  { id: 3, name: 'Amy', address: 'Apple st 652'},
  { id: 4, name: 'Hannah', address: 'Mountain 21'},
  { id: 5, name: 'Michael', address: 'Valley 345'},
  { id: 6, name: 'Sandy', address: 'Ocean blvd 2'},
  { id: 7, name: 'Betty', address: 'Green Grass 1'},
  { id: 8, name: 'Richard', address: 'Sky st 331'},
  { id: 9, name: 'Susan', address: 'One way 98'},
  { id: 10, name: 'Vicky', address: 'Yellow Garden 2'},
  { id: 11, name: 'Ben', address: 'Park Lane 38'},
  { id: 12, name: 'William', address: 'Central st 954'},
  { id: 13, name: 'Chuck', address: 'Main Road 989'},
  { id: 14, name: 'Viola', address: 'Sideway 1633'}
]

```



选择对应的 columns 数据，这里检索语句直接使用对应 column 名称替换 *：



```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT name, address FROM customers", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

```

result 对象：

```js

[
  { name: 'John', address: 'Highway 71'},
  { name: 'Peter', address: 'Lowstreet 4'},
  { name: 'Amy', address: 'Apple st 652'},
  { name: 'Hannah', address: 'Mountain 21'},
  { name: 'Michael', address: 'Valley 345'},
  { name: 'Sandy', address: 'Ocean blvd 2'},
  { name: 'Betty', address: 'Green Grass 1'},
  { name: 'Richard', address: 'Sky st 331'},
  { name: 'Susan', address: 'One way 98'},
  { name: 'Vicky', address: 'Yellow Garden 2'},
  { name: 'Ben', address: 'Park Lane 38'},
  { name: 'William', address: 'Central st 954'},
  { name: 'Chuck', address: 'Main Road 989'},
  { name: 'Viola', address: 'Sideway 1633'}
]

```



### 过滤查询

使用 "WHERE" 语句进行过滤查询，查询 address 值为 "Park Lane 38" 的数据：

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM customers WHERE address = 'Park Lane 38'", function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});

```

result:

```js
[
  { id: 11, name: 'Ben', address: 'Park Lane 38'}
]
```

通配符 '%'：

你也可以查询起始、包含、结尾为某一个关键字的数据，使用 '%' 表示零、一或多个字符；

如：查询 address 字段中值为 'S' 开头的数据：

```js
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM customers WHERE address LIKE 'S%'", function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});
```

result：

```js
[
  { id: 8, name: 'Richard', address: 'Sky st 331'},
  { id: 14, name: 'Viola', address: 'Sideway 1633'}
]
```

[更多](https://www.w3schools.com/nodejs/nodejs_mysql_where.asp)



### 查询并排序

使用 "ORDER BY" 语句进行升降排序，默认使用的是升序排列，使用 "DESC" 进行降序排列；

根据 name 字段进行字母排序：

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM customers ORDER BY name", function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});

```



降序排列：

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM customers ORDER BY name DESC", function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});

```



### 查询数据量限制

使用 "LIMIT" 语句限制查询量：

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  var sql = "SELECT * FROM customers LIMIT 5";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});

```

result:

```js

[
  { id: 1, name: 'John', address: 'Highway 71'},
  { id: 2, name: 'Peter', address: 'Lowstreet 4'},
  { id: 3, name: 'Amy', address: 'Apple st 652'},
  { id: 4, name: 'Hannah', address: 'Mountain 21'},
  { id: 5, name: 'Michael', address: 'Valley 345'}
]

```

查询起始位置：

如果你想要查询 5 条数据，从第 3 条开始，可以使用 "OFFSET" 关键字;

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  var sql = "SELECT * FROM customers LIMIT 5 OFFSET 2";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});

```

result:

```js

[
  { id: 3, name: 'Amy', address: 'Apple st 652'},
  { id: 4, name: 'Hannah', address: 'Mountain 21'},
  { id: 5, name: 'Michael', address: 'Valley 345'},
  { id: 6, name: 'Sandy', address: 'Ocean blvd 2'},
  { id: 7, name: 'Betty', address: 'Green Grass 1'}
]

```



> 以上简写："LIMIT 2, 5"，等同于  "LIMIT 5 OFFSET 2;









### 删除数据

使用 "DELETE FROM" 语句删除表中的数据；

删除所有 address = 'Mountain 21' 的数据：

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  var sql = "DELETE FROM customers WHERE address = 'Mountain 21'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);

        // Number of records deleted: 1
  });
});

```

result：

```js

{
  fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  serverStatus: 34,
  warningCount: 0,
  message: '',
  protocol41: true,
  changedRows: 0
}

```

### 删除"表"

你可以使用 "DROP TABLE" 语句删除任何已存在的表；

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  var sql = "DROP TABLE customers";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table deleted");
  });
});

```



### 更新(修改)表数据

使用 "UPDATE" 语句更新表中已经存在的数据；

修改 address column 值 "Valley 345" 为 "Canyon 123":

```js

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  var sql = "UPDATE customers SET address = 'Canyon 123' WHERE address = 'Valley 345'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");

        // 1 record(s) updated
  });
});

```

result:

```js

{
  fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  serverStatus: 34,
  warningCount: 0,
  message: '(Rows matched: 1 Changed: 1 Warnings: 0',
  protocol41: true,
  changedRows: 1
}

```

### 联表查询

通过 "JOIN" 语句，你可以从两个或多张表中，通过自定义条件查询并过滤合并数据；假设你有两张表 "users" 和 "products"：

users：
```js
[
  { id: 1, name: 'John', favorite_product: 154},
  { id: 2, name: 'Peter', favorite_product: 154},
  { id: 3, name: 'Amy', favorite_product: 155},
  { id: 4, name: 'Hannah', favorite_product:},
  { id: 5, name: 'Michael', favorite_product:}
]
```
products:
```js
[
  { id: 154, name: 'Chocolate Heaven' },
  { id: 155, name: 'Tasty Lemons' },
  { id: 156, name: 'Vanilla Dreams' }
]
```

Example：
```js
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});

con.connect(function(err) {
  if (err) throw err;
  var sql = "SELECT users.name AS user, products.name AS favorite FROM users JOIN products ON users.favorite_product = products.id";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});
```
"SELECT users.name AS user, products.name AS favorite" 表示输出 "users" 表中的 "name" 并重命名为 "user"，"products" 表中的 "name" 并重命名为 "favorite"，"FROM users JOIN products ON users.favorite_product = products.id" 表示检索自 "users" 和 "products" 表，且过滤并输出符合 "users.favorite_product = products.id" 条件的数据。

result:

```js

[
  { user: 'John', favorite: 'Chocolate Heaven' },
  { user: 'Peter', favorite: 'Chocolate Heaven' },
  { user: 'Amy', favorite: 'Tasty Lemons' }
]

```



如果我们希望无论是否匹配，都把 "users" 表或者 "products" 中的数据输出，可以使用 "LEFT JOIN" 或  "RIGHT JOIN" 语句；

> Left 或 Right 是根据你 Sql 语句中查询表的顺序而定的；



LEFT JOIN:

```sql

SELECT users.name AS user,
products.name AS favorite
FROM users
LEFT JOIN products ON users.favorite_product = products.id

```

result:

```js

[
  { user: 'John', favorite: 'Chocolate Heaven' },
  { user: 'Peter', favorite: 'Chocolate Heaven' },
  { user: 'Amy', favorite: 'Tasty Lemons' },
  { user: 'Hannah', favorite: null },
  { user: 'Michael', favorite: null }
]

```

RIGHT JOIN:

```sql

SELECT users.name AS user,
products.name AS favorite
FROM users
RIGHT JOIN products ON users.favorite_product = products.id

```

result:

```js

[
  { user: 'John', favorite: 'Chocolate Heaven' },
  { user: 'Peter', favorite: 'Chocolate Heaven' },
  { user: 'Amy', favorite: 'Tasty Lemons' },
  { user: null, favorite: 'Vanilla Dreams' }
]

```

-----------------------

## 对比传统RESTful方式

### 开发流程
 开发流程 | 传统方式 | APIJSON
-------- | ------------ | ------------
 接口传输 | 等后端编辑接口，然后更新文档，前端再按照文档编辑请求和解析代码 | 前端按照自己的需求编辑请求和解析代码。<br />没有接口，更不需要文档！前端再也不用和后端沟通接口或文档问题了！
 兼容旧版 | 后端增加新接口，用v2表示第2版接口，然后更新文档 | 什么都不用做！
 
 
### 前端请求
 前端请求 | 传统方式 | APIJSON
-------- | ------------ | ------------
 要求 | 前端按照文档在对应URL后面拼接键值对 | 前端按照自己的需求在固定URL后拼接JSON
 URL | 不同的请求对应不同的URL，基本上有多少个不同的请求就得有多少个接口URL | 相同的操作方法(增删改查)都用同一个URL，<br />大部分请求都用7个通用接口URL的其中一个
 键值对 | key=value | key:value
 结构 | 同一个URL内table_name只能有一个 <br /><br /> base_url/get/table_name?<br />key0=value0&key1=value1... | 同一个URL后TableName可传任意数量个 <br /><br /> base_url/get/<br />{<br > &nbsp;&nbsp; TableName0:{<br > &nbsp;&nbsp;&nbsp;&nbsp; key0:value0,<br > &nbsp;&nbsp;&nbsp;&nbsp; key1:value1,<br > &nbsp;&nbsp;&nbsp;&nbsp; ...<br > &nbsp;&nbsp; },<br > &nbsp;&nbsp; TableName1:{<br > &nbsp;&nbsp;&nbsp;&nbsp; ...<br > &nbsp;&nbsp; }<br > &nbsp;&nbsp; ...<br > }
 
 
### 前端对应不同需求的请求
 前端的请求 | 传统方式 | APIJSON
-------- | ------------ | ------------
 User | base_url/get/user?id=38710 | [base_url/get/<br >{<br > &nbsp;&nbsp; "User":{<br > &nbsp;&nbsp;&nbsp;&nbsp; "id":38710<br > &nbsp;&nbsp; }<br >}](http://apijson.cn:8080/get/{"User":{"id":38710}})
 Moment和对应的User | 分两次请求<br />Moment: <br /> base_url/get/moment?userId=38710<br /><br />User: <br /> base_url/get/user?id=38710 | [base_url/get/<br >{<br > &nbsp;&nbsp; "Moment":{<br > &nbsp;&nbsp;&nbsp;&nbsp; "userId":38710<br > &nbsp;&nbsp; }, <br > &nbsp;&nbsp; "User":{<br > &nbsp;&nbsp;&nbsp;&nbsp; "id":38710<br > &nbsp;&nbsp; }<br >}](http://apijson.cn:8080/get/{"Moment":{"userId":38710},"User":{"id":38710}})
 User列表 | base_url/get/user/list?<br />page=0&count=3&sex=0 | [base_url/get/<br >{<br > &nbsp;&nbsp; "User[]":{<br > &nbsp;&nbsp;&nbsp;&nbsp; "page":0,<br > &nbsp;&nbsp;&nbsp;&nbsp;  "count":3, <br > &nbsp;&nbsp;&nbsp;&nbsp; "User":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "sex":0<br > &nbsp;&nbsp;&nbsp;&nbsp; }<br > &nbsp;&nbsp; }<br >}](http://apijson.cn:8080/get/{"User[]":{"page":0,"count":3,"User":{"sex":0}}})
 Moment列表，<br />每个Moment包括<br />1.发布者User<br />2.前3条Comment | Moment里必须有<br />1.User对象<br >2.Comment数组<br /><br /> base_url/get/moment/list?<br />page=0&count=3&commentCount=3 | [base_url/get/<br >{<br > &nbsp;&nbsp; "[]":{<br > &nbsp;&nbsp;&nbsp;&nbsp; "page":0, <br > &nbsp;&nbsp;&nbsp;&nbsp; "count":3, <br > &nbsp;&nbsp;&nbsp;&nbsp; "Moment":{}, <br > &nbsp;&nbsp;&nbsp;&nbsp; "User":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "id@":"/Moment/userId"<br > &nbsp;&nbsp;&nbsp;&nbsp; },<br > &nbsp;&nbsp;&nbsp;&nbsp; "Comment[]":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "count":3,<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Comment":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "momentId@":"[]/Moment/id"<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br > &nbsp;&nbsp;&nbsp;&nbsp; }<br > &nbsp;&nbsp; }<br >}](http://apijson.cn:8080/get/{"[]":{"page":0,"count":3,"Moment":{},"User":{"id@":"%252FMoment%252FuserId"},"Comment[]":{"count":3,"Comment":{"momentId@":"[]%252FMoment%252Fid"}}}})
 User发布的Moment列表，<br /> 每个Moment包括<br /> 1.发布者User<br /> 2.前3条Comment | 1.Moment里必须有User对象和Comment数组<br > 2.字段名必须查接口文档，例如评论数量字段名可能是<br /> commentCount,comment_count或者简写cmt_count等各种奇葩写法... <br /><br /> base_url/get/moment/list?<br />page=0&count=3<br />&commentCount=3&userId=38710 | 有以下几种方式:<br /><br /> ① 把以上请求里的<br >"Moment":{}, "User":{"id@":"/Moment/userId"}<br >改为<br >["Moment":{"userId":38710}, "User":{"id":38710}](http://apijson.cn:8080/get/{"[]":{"page":0,"count":3,"Moment":{"userId":38710},"User":{"id":38710},"Comment[]":{"count":3,"Comment":{"momentId@":"[]%252FMoment%252Fid"}}}}) <br /><br /> ② 或把User放在上面的最外层省去重复的User<br />[base_url/get/<br >{<br > &nbsp;&nbsp; "User":{<br > &nbsp;&nbsp;&nbsp;&nbsp; "id":38710<br > &nbsp;&nbsp; },<br > &nbsp;&nbsp; "[]":{<br > &nbsp;&nbsp;&nbsp;&nbsp; "page":0,<br > &nbsp;&nbsp;&nbsp;&nbsp; "count":3, <br > &nbsp;&nbsp;&nbsp;&nbsp; "Moment":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "userId":38710<br > &nbsp;&nbsp;&nbsp;&nbsp; }, <br > &nbsp;&nbsp;&nbsp;&nbsp; "Comment[]":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "count":3,<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Comment":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "momentId@":"[]/Moment/id"<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br > &nbsp;&nbsp;&nbsp;&nbsp; }<br > &nbsp;&nbsp; }<br >}](http://apijson.cn:8080/get/{"User":{"id":38710},"[]":{"page":0,"count":3,"Moment":{"userId":38710},"Comment[]":{"count":3,"Comment":{"momentId@":"[]%252FMoment%252Fid"}}}})<br /><br /> ③ 如果User之前已经获取到了，还可以不传User来节省请求和返回数据的流量并提升速度<br />[base_url/get/<br >{<br > &nbsp;&nbsp; "[]":{<br > &nbsp;&nbsp;&nbsp;&nbsp; "page":0,<br > &nbsp;&nbsp;&nbsp;&nbsp; "count":3, <br > &nbsp;&nbsp;&nbsp;&nbsp; "Moment":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "userId":38710<br > &nbsp;&nbsp;&nbsp;&nbsp; },<br > &nbsp;&nbsp;&nbsp;&nbsp; "Comment[]":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "count":3,<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "Comment":{<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "momentId@":"[]/Moment/id"<br > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }<br > &nbsp;&nbsp;&nbsp;&nbsp; }<br > &nbsp;&nbsp; }<br >}](http://apijson.cn:8080/get/{"[]":{"page":0,"count":3,"Moment":{"userId":38710},"Comment[]":{"count":3,"Comment":{"momentId@":"[]%252FMoment%252Fid"}}}})
 

[更多官方说明](https://github.com/Tencent/APIJSON/blob/master/Document.md#2.1)

## 总结：

### 使用好处：
- 业务支持变多
- 沟通协作变少
- 解决问题变快
- 全栈可以更好的架构分层、分工
- 拓展技能领域
- 后端资源投入加少

### 坏处：
- 组织决定了架构的复杂度
- 前期学成本⾼，短期成资源瓶颈
- 前端资源投入增加