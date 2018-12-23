## 为什么写这个工具？
因为平时工作时使用的开发工具为vscode和vs2015，在使用vscode时，装了一些代码片段插件，在敲代码时只需敲代码片段的前缀（prefix）就会自动带出整个代码片段，这样也就无须记忆太多语法或单词，提高开发效率。于是在使用vs2015时，我就想着是否能够把vscode的代码片段带到vs2015中使用。因为vs2015有自定义代码片段的功能，所以我只要把vscode的代码片段转换为vs2015可以使用的代码片段即可。
<br/>
vscode插件中的代码片段为json格式，至于如何定义vscode的代码片段，请查看vscode的文档：[Creating your own snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets)，文中介绍到snippet的语法基本遵循[TextMate snippet](https://macromates.com/manual/en/snippets)的语法。
如下所示：
<br/>
```json
{
    "v-text": {
        "prefix": "vText",
        "body": [
            "v-text=\"${1:msg}\""
        ],
        "description": "Expects: string"
    }
}
```
vs2015的代码片段则为xml格式，扩展名为.snippet的文件，如下所示
```xml
<CodeSnippet Format="1.1.0" xmlns="http://schemas.microsoft.com/VisualStudio/2005/CodeSnippet">
  <Header>
    <Title>vText</Title>
    <Author>fanxq</Author>
    <Shortcut>vText</Shortcut>
    <Description>Expects: string</Description>
    <SnippetTypes>
      <SnippetType>Expansion</SnippetType>
      <SnippetType>SurroundsWith</SnippetType>
    </SnippetTypes>
  </Header>
  <Snippet>
    <Declarations>
      <Literal>
        <ID>1</ID>
        <ToolTip>msg</ToolTip>
        <Default>msg</Default>
      </Literal>
    </Declarations>
    <Code Language="html">
      <![CDATA[v-text="$1$"$end$]]>
    </Code>
  </Snippet>
</CodeSnippet>
```

该项目使用node.js编写，依赖的库有
<br/>
- xmlbuilder
- inquirer
- progress
## license
 MIT