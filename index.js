const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const builder = require("xmlbuilder");
const progressBar = require("progress");
let bar;
let index = 0;
let questions = [{
        type: "input",
        name: "snippet_file",
        message: "path to the snippet file of vscode extensions",
        validate: function (val) {
            if (!fs.existsSync(val)) {
                return "Please enter a valid path";
            }
            if (
                !fs.statSync(val).isFile() ||
                path.extname(val).toLowerCase() !== ".json"
            ) {
                return "Please enter a valid snippet file path(warning:snippet file must be end with '.json')";
            }
            return true;
        }
    },
    {
        type: "input",
        name: "des_folder",
        message: "folder to store the converted snippet files(for vs)",
        default: "./snippets",
        validate: function (val) {
            if(val === './snippets'){
                return true;
            }
            if (!fs.existsSync(val)) {
                return "Please enter a valid path";
            }
            return true;
        }
    },
    {
        type: "list",
        name: "lang",
        message: "Which language is your snippet?",
        choices: ["html", "JavaScript"]
    }
];

function creactSnippetFile(snippetItem, desPath, lang) {
    var root = builder.create("CodeSnippet");
    root.att("Format", "1.1.0");
    root.att(
        "xmlns",
        "http://schemas.microsoft.com/VisualStudio/2005/CodeSnippet"
    );
    var header = root.ele("Header");
    var title = header.ele("Title");
    title.text(snippetItem.prefix);
    var author = header.ele("Author");
    author.text("fanxq");
    var shortcut = header.ele("Shortcut");
    shortcut.text(snippetItem.prefix);
    var description = header.ele("Description");
    description.text(snippetItem.description);
    var snippetTypes = header.ele("SnippetTypes");
    snippetTypes.ele("SnippetType", null, "Expansion");
    snippetTypes.ele("SnippetType", null, "SurroundsWith");
    var snippet = root.ele("Snippet");
    var declarations = snippet.ele("Declarations");
    var snippetBody = snippetItem.body.toString();
    var matchs = snippetBody.match(/(\$\d+)|(\$\{[^\{\}]*\})/gim);
    if (matchs) {
        for (let i = 0; i < matchs.length; i++) {
            var literalId = "Literal" + i;
            var literal = declarations.ele("Literal");
            var literalTooltip = "none";
            var literalDefault = "-";
            var result = /\$((\d+)|\{(.*)\})/gi.exec(matchs[i]);
            if (result && result.length > 0) {
                var text = result[2] || result[3];
                if (text) {
                    if (~text.indexOf(":")) {
                        var texts = text.split(":");
                        literalId = texts[0];
                        literalTooltip = literalDefault = texts[1];
                    } else if (!Number.isNaN(Number(text))) {
                        literalId = text;
                    } else {
                        literalTooltip = literalDefault = text;
                    }
                }
            }
            literal.ele("ID").text(literalId);
            literal.ele("ToolTip").text(literalTooltip);
            literal.ele("Default").text(literalDefault);
            snippetBody = snippetBody.replace(matchs[i], "$" + literalId + "$");
        }
    }

    var code = snippet.ele("Code").att("Language", lang);
    code.cdata(snippetBody + "$end$");
    root.end({
        pretty: true
    });
    var tFileName = snippetItem.prefix.toString() + ".snippet";
    if (!fs.existsSync(desPath)) {
        fs.mkdirSync(desPath);
    }
    fs.writeFileSync(path.join(desPath, tFileName), root, {
        encoding: "utf8"
    });
    bar.tick(index);
    index++;
}

inquirer.prompt(questions).then(function (answers) {
    answers.des_folder === "./snippets" && fs.mkdirSync(answers.des_folder);
    fs.readFile(answers.snippet_file, function (err, data) {
        if (err) {
            console.log(err.message);
            return;
        }

        var snippetItems = JSON.parse(data.toString());
        bar = new progressBar("  converting [:bar] :percent ", {
            complete: "=",
            incomplete: " ",
            width: 50,
            total: Object.keys(snippetItems).length
        });

        for (var i in snippetItems) {
            //console.log(i);
            creactSnippetFile(snippetItems[i], answers.des_folder, answers.lang);
        }
    });
});