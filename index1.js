const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const builder = require('xmlbuilder');
const progressBar = require('progress');
let bar;
let index = 0;
let questions = [{
        type: 'input',
        name: 'snippet_file',
        message: 'path to the snippet file of vscode extensions',
        validate: function (val) {
            if (!fs.existsSync(val)) {
                return 'Please enter a valid path';
            }
            if (!fs.statSync(val).isFile() || path.extname(val).toLowerCase() !== '.json') {
                return 'Please enter a valid snippet file path(warning:snippet file must be end with \'.json\')';
            }
            return true;
        }
    },
    {
        type: 'input',
        name: 'des_folder',
        message: 'folder to store the converted snippet files(for vs)',
        default: './',
        validate: function (val) {
            if (!fs.existsSync(val)) {
                return 'Please enter a valid path'
            }
            return true;
        }
    },
    {
        type: 'list',
        name: 'lang',
        message: 'Which language is your snippet?',
        choices: [
            'html',
            'JavaScript'
        ]
    }
];

function creactSnippetFile(snippetItem, desPath, lang) {
    var root = builder.create('CodeSnippet');
    root.att('Format', '1.1.0');
    root.att('xmlns', 'http://schemas.microsoft.com/VisualStudio/2005/CodeSnippet');
    var header = root.ele('Header');
    var title = header.ele('Title');
    title.text(snippetItem.prefix);
    var author = header.ele('Author');
    author.text('fanxq');
    var shortcut = header.ele('Shortcut');
    shortcut.text(snippetItem.prefix);
    var description = header.ele('Description');
    description.text(snippetItem.description);
    var snippetTypes = header.ele('SnippetTypes');
    snippetTypes.ele('SnippetType', null, 'Expansion');
    snippetTypes.ele('SnippetType', null, 'SurroundsWith');
    var snippet = root.ele('Snippet');
    var declarations = snippet.ele('Declarations');
    var reg = /(\$\d+)|(\$\{[\d\w:]{1,}\})/g;
    var strcode = snippetItem.body.toString();
    var matchs = strcode.match(reg);
    var baseId = 'content';
    if (matchs) {
        for (let i = 0; i < matchs.length; i++) {
            var lId = baseId + i;
            var literal = declarations.ele('Literal');
            literal.ele('ID').text(lId);
            var tempstr = matchs[i];
            var literalArray = /\$\{([\d\w:]{1,})\}/g.exec(tempstr);
            if (literalArray && literalArray.length > 1) {
                literal.ele('ToolTip').text(literalArray[1]);
                literal.ele('Default').text(literalArray[1]);
            }
            var rStr = '$' + lId + '$';
            strcode = strcode.replace(matchs[i], rStr);
        }
    }

    var code = snippet.ele('Code').att('Language', lang); 
    code.cdata(strcode + '$end$');
    root.end({
        pretty: true
    });
    var tFileName = snippetItem.prefix.toString() + ".snippet";
    if (!fs.existsSync(desPath)) {
        fs.mkdirSync(desPath);
    }
    // fs.writeFile(path.join(desPath, tFileName), root, function (err) {
    //     if (err) {
    //         console.log(err.message);
    //     }
    // });
    fs.writeFileSync(path.join(desPath, tFileName),root,{encoding:'utf8'});
    bar.tick(index);
    index++;
}

inquirer.prompt(questions).then(function (answers) {
    //console.log(answers);
    var outputPath = path.join(answers.des_folder, answers.lang === 'html' ? 'html.snippets' : 'javascript.snippets');
    fs.mkdirSync(outputPath);
    fs.readFile(answers.snippet_file, function (err, data) {
        if (err) {
            console.log(err.message);
            return;
        }

        var snippetItems = JSON.parse(data.toString());
        bar = new progressBar('  downloading [:bar] :percent ', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: Object.keys(snippetItems).length
          });

        for (var i in snippetItems) {
            //console.log(i);
            creactSnippetFile(snippetItems[i], outputPath, answers.lang);
        }
    });

})