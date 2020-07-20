# mini 版 vite 实现

1. 搭建 Koa 简易服务器，文件不用经过编译而是直接 serve
2. support html 文件
3. support 普通的 .js 文件 （通过浏览器支持 es6 modules 的原理）
4. support .js files from node_modules (/@modules/ -> node_modules/xx/package.json -> module entrance)
5. support .vue file
6. support .vue file (template part)
7. support .css file
