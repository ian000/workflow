## koa-jade-workflow

Render jade views with preCompile

## Installation

```
$ npm install koa-jade-workflow （不会把这个提交到npm，忽略这个命令吧）

后续会托管提交到内部的gitlab上，现在想安装，跟我要代码 ：）
```
## 与webOS有啥不同？
  1. 实现真正的大前端
    1. 打开网页，访客实际访问的是前端组提供的nodejs服务
    2. 后端只做数据接口
  2. 前端团队自由可控的jade在线报错,支持jade官方标准语法
  3. 开发阶段基于测试机的liveRelaod
  4. 与后端基于fakeData 的同步开发，当后端api接口按约定开发完毕，自动用改api数据渲染jade。
  5. 前端可能比以前更累了（承担了服务端的部分工作）。但跨团队沟通应该更高效（反正出发点之一就是这个）
  6. 提高开发质量
      1. onsave 的 jsHint(定制)
      2. svn preCommit check 【TODO】
      3. 强制型的 code review 【todo】
      4. ucss 【TODO】://github.com/operasoftware/ucss
      5. BDD + TDD 【TODO】
  7. 将前端团队技术领域拓展到服务端（也许你不在乎这个）

## How to start with workflow and 内部框架 ?
### 工具准备
  1. ssh 登陆器
  2. sftp 工具（推荐sublime + swftp plugin）（神器webstrom，自带swft功能，机器性能好的，推荐使用）;

### 部署(TODO:一键部署)
（其实理想化一点，应该有个内部的云开发平台，不需要每个人都依赖自己的开发机，但是有开发成本. 现在我来帮各位安装）
  1. 部署project
  2. 部署 workflow, npm install
  3. 前端代理（haproxy）

### 如何与原来的项目结合
  0. 登入联调开发机
  1. 在原有项目目录下 新增文件夹 views(里面装载jade文件)
  2. 将此目录软连到  /data0/koa-jade-workflow/views
  3. 确保通过 http://js.t.xxxxjs.cn/ 可以访问到项目目录
  4. 切到 /data0/koa-jade-workflow/ 下启workflow动服务
  6. 确保 livereload默认端口 35729不被占用
  7. 执行  grunt dev
  8. 确保通过 http://w.xxxxx.com 可以访问到workflow

### 项目开始阶段
  （与后端约定好接口的数据结构与测试的api地址，就可以并行开发了）
  1. 与后端的接口约定的假数据是通过 /data0/koa-jade-workflow/data 文件夹的 *.json文件配置的
  2. 后端的实际api接口保存在 /data0/koa-jade-workflow/lib/dataMap.json中。


### 进入开发阶段
  1. 用浏览器打开 http://w.xxxxx.com 可以看到首页，由来自 project/views/index.jade 渲染而成
  2. 用sublime sftp 链接到你的测试机下的project文件夹 ,为了方便 "upload_on_save": true
  3. 每次保存jade ,  http://w.xxxxx.com 下的对应网页会自动刷新。


### 关于调试与报错

  1. 编译错误
      1. 如果当前你正在浏览的页面编译错误，则页面不会正常显示，会直接显示报错信息，与函数
      2. 如果是项目里的其他页面编译错误，则页面会正常显示，在console.log里面显示报错信息 hasCompileError ，你会看到具体哪个页面报错，你可以去调试它，当然也可以选择不理会。
  2. 数据渲染错误： 与编译错误同，在console.log里面显示报错信息 hasDataError
  3. 远程api错误 ：
      1. 数据选择策略：
          1. 按路由取得相应的api数据，如果不存在，写 console.log:isApiDta:false
          2. 取得api以后，比较api与假数据的key如果不一致，写 console.log: isApiDta:false ，dataKeys是一个keys异同的数组
          3. 都通真假数据对比通过校验，用api渲染页面，写console.log: isApiDta:true

### 关于模板渲染性能
  e.g :
  console.log: renderTime: 1ms
### 关于页面请求时间
  e.g :
  console.log: requestTime: 2ms
### 关于请求api接口的耗时
  e.g :
  console.log: requestApiSpan: 2001ms

## 日志位置

   1.  /log 文件夹下
   2. 标准输出
        workflow-xxxxx-out.log
   3. 错误输出
        workflow-xxxxx-err.log

## 进程守护
  1. 当改变 workflow 文件夹下文件，忽略 .foreverignore里面标注的文件or文件夹  服务会自动重启

## Debug
  1. 服务器启动
    grunt dev
  2. 停止服务
    forever stopall
  3. 单进程模式启动
    node ./lib/router -p 8001

  4.查看服务是否启动成功
    netstat -lnput 看指定端口是否启动成功

## bash
  1. 启动服务:    cd /data0/koa-jade-workflow
                 sh init.d/bootDev.sh start
  2. 停止服务:    stop
  3. 重启服务:    restart

## test

  1. npm test  【TODO】

## TODO
  1. 全局编译时候应该忽略配置项里的文件or文件夹
  3. 服务端性能监控
  4. 省略。。。

##Contributors
  1. kongbo
  2. zhaoxin
  3. 求加入。。。

## Licence

MIT
