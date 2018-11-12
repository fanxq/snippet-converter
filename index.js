'use strict'
const fs = require('fs');
const path = require('path');
const builder = require('xmlbuilder');
var args = [];
if(process.argv){
    args = process.argv.splice(2);
}
if(!args || args.length < 2){
    console.log("参数个数不能少于2");
}
let jsonFileName = args? args[0] : null;
let desPath = args? args[1]:null;
fs.readFile(jsonFileName,function(err,data){
    if(err){
        console.log(err.message);
        return;
    }
    
    var snippetsObj = JSON.parse(data.toString());
    for(var i in snippetsObj){
        //console.log(i);
        creactSnippetFile(snippetsObj[i]);
    }
});

function creactSnippetFile(snippetItem){
    var root = builder.create('CodeSnippet');
    root.att('Format','1.1.0');
    root.att('xmlns','http://schemas.microsoft.com/VisualStudio/2005/CodeSnippet');
    var header = root.ele('Header');
    var title = header.ele('Title');
    title.text(snippetItem.prefix);
    var author = header.ele('Author');
    author.text('Goldpac Corporation');
    var shortcut = header.ele('Shortcut');
    shortcut.text(snippetItem.prefix);
    var description = header.ele('Description');
    description.text(snippetItem.description);
    var snippetTypes = header.ele('SnippetTypes');
    snippetTypes.ele('SnippetType',null,'Expansion');
    snippetTypes.ele('SnippetType',null,'SurroundsWith');
    var snippet = root.ele('Snippet');
    var declarations = snippet.ele('Declarations');
    //var reg = /(\$\d+)|(\$\{\d+:\w*\})/g;
    var reg = /(\$\d+)|(\$\{[\d\w:]{1,}\})/g;
    var strcode = snippetItem.body.toString();
    var matchs = strcode.match(reg);
    var baseId = 'content';
    if(matchs){
        for(let i = 0; i < matchs.length; i++){
            var lId = baseId+i;
            var literal = declarations.ele('Literal');
            literal.ele('ID').text(lId);
            var tempstr = matchs[i];
            var literalArray = /\$\{([\d\w:]{1,})\}/g.exec(tempstr);
            if(literalArray && literalArray.length > 1){
                literal.ele('ToolTip').text(literalArray[1]);
                literal.ele('Default').text(literalArray[1]);
            }
            var rStr = '$'+lId+'$';
            strcode = strcode.replace(matchs[i],rStr);
        }
    }
    
    var code = snippet.ele('Code').att('Language',"JavaScript");//for javascript
    //var code = snippet.ele('Code').att('Language',"html");
    //var snippetTpl = `<![CDATA[${strcode}$end$]]>`;
    code.cdata(strcode+'$end$');
    //code.text(snippetTpl);
    root.end({ pretty: true});
    var tFileName = snippetItem.prefix.toString()+".snippet";
    if(!fs.existsSync(desPath)){
        fs.mkdirSync(desPath);
    }
    fs.writeFile(path.join(desPath,tFileName),root,function(err){
        if(err){
            console.log(err.message);
        }
    });
}