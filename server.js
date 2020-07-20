const fs = require("fs");
const path = require("path");
const Koa = require("koa");
const compilerSfc = require("@vue/compiler-sfc");
const compileDom = require("@vue/compiler-dom");

const app = new Koa();

app.use(async (ctx) => {
  const { url } = ctx;
  if (url === "/") {
    ctx.type = "text/html";
    const content = fs.readFileSync("./index.html", "utf-8");
    ctx.body = rewriteImports(content);
  } else if (url.endsWith(".js")) {
    ctx.type = "application/javascript";
    const content = fs.readFileSync(
      path.resolve(__dirname, url.slice(1)),
      "utf-8"
    );
    ctx.body = rewriteImports(content);
  } else if (url.startsWith("/@modules/")) {
    const modulePath = url.replace(
      /\/@modules\//,
      __dirname + "/node_modules/"
    );
    const packageJsonPath = path.join(modulePath, "package.json");
    const { module } = require(packageJsonPath);
    const content = fs.readFileSync(path.join(modulePath, module), "utf-8");
    ctx.body = rewriteImports(content);
    ctx.type = "application/javascript";
  } else if (url.indexOf(".vue") > -1) {
    const { query } = ctx;
    // 解析单文件组件 cmpiler sfc single file compiler
    console.log(url);
    const p = path.resolve(__dirname, url.split("?")[0].slice(1));
    const { descriptor } = compilerSfc.parse(fs.readFileSync(p, "utf-8"));
    if (!query.type) {
      // script
      ctx.body = `${rewriteImports(descriptor.script.content).replace(
        "export default",
        "const __script ="
      )}
      import { render as __render } from '${url}?type=template'
      __script.render = __render
      export default __script
      `;
    } else if (query.type === "template") {
      // template
      const { template } = descriptor;
      const render = compileDom.compile(template.content, { mode: "module" })
        .code;
      ctx.body = rewriteImports(render);
    }

    ctx.type = "application/javascript";
  } else if (url.indexOf(".css") > -1) {
    const p = path.join(__dirname, url.split("?")[0].slice(1));
    const file = fs.readFileSync(p, "utf-8");
    const content = `
    const css = '${file.replace(/\n/g, "")}';
    let link = document.createElement('style');
    link.setAttribute('type', 'text/css');
    document.head.appendChild(link);
    link.innerHTML = css;
    export default css;
    `;
    ctx.type = "application/javascript";
    ctx.body = content;
  } else {
    ctx.body = "hello there!";
    ctx.type = "text/html";
  }
});

app.listen(3001, () => {
  console.log("Server is listening at port 3001");
});

function rewriteImports(content) {
  return content.replace(/from\s["']([^'"]+)["']/g, function (s0, s1) {
    if (s1[0] !== "." && s1[0] !== "/") {
      return `from '/@modules/${s1}'`;
    }
    return s0;
  });
}
