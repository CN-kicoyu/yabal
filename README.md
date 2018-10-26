# yabal

Generate files and configurability of project

### 安装

``` bash
$ npm install -g yabal
```

### 如何使用？

#### 新增本地模版

``` bash
$ yabal down <owner/name>
```

样例:

``` bash
$ yus down CN-kicoyu/yus-cli-template-miniapp
```

> 支持下载:<br/>
> GitHub - github:owner/name or simply owner/name<br/>
> GitLab - gitlab:owner/name<br/>
> Bitbucket - bitbucket:owner/name

#### 查看本地模版

``` bash
$ yabal list
```

#### 删除本地模版

``` bash
$ yabal delete
```

#### 导入本地模版

``` bash
$ yabal init
```


### 模板编写说明

模版文件目录结构：

```
.
├── template
|   └── **/*
├── **/*
└── yabal.config.js
```

**注意：**如果需要用户定制化模版的话，模版文件的根目录必须配置`yabal.config.js`，template文件夹支持使用ejs模版

#### `yabal.config.js`说明

- prompts  和用户交互的命令行语句

- output   返回所有和用户交互的变量，用来指定具体模版文件的具体渲染位置，不指明的话默认按template文件夹中的位置进行渲染

- completed 渲染完成后的其他操作

样例:

```js
module.exports = {
  prompts: {
    // ejs模版变量
    tplName: {
      type: 'string',
      required: true,
      message: 'please input tplname'
    }
  },
  // 指定对应模版在项目中的输出位置
  output (data) {
    const {project, tplName} = data
    const tplPath = `page/${project}`
    const widgetPath = `src/widget/${tplName}`

    return [
      {
        template: 'audit.tpl',
        position: `${tplPath}/${tplName}.tpl`
      },
      {
        template: 'audit.jsx',
        position: `${widgetPath}/${project}.jsx`
      },
      {
        template: 'App.js',
        position: `${widgetPath}/App.js`
      },
      {
        template: 'index.js',
        position: `${widgetPath}/Pages/index.js`
      }
    ]
  },
  // 渲染完成后的其他操作，譬如修改项目webpack的配置
  completed (data) {
    const entryConfPath = `${process.cwd()}/build/webpack.entry.js`
    const entryConf = require(entryConfPath)
    let entryStr = ''
    const insertion = [
      {
        key: `widget.${data.tplName}`,
        value: `./src/widget/${data.tplName}/${data.project}.jsx`
      }
    ]
    insertObject(entryConf, insertion)
    entryStr = `module.exports = ${util.inspect(entryConf)}`
    fs.writeFileSync(entryConfPath, entryStr, err => {
      err && console.log(chalk.red(err))
    })
}
```

