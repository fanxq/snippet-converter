const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const builder = require('xmlbuilder');

let questions = [
    {
        type:'input',
        name:'snippet_file',
        message:'path to your snippet file of vscode extensions',
        validate:function(val){
            if(!fs.existsSync(val)){
                return 'Please enter a valid path'
            }
            return true;
        }
    },
    {
        type:'input',
        name:'des_folder',
        message:'folder to store the converted snippet files(for vs)',
        validate:function(val){
            if(!fs.existsSync(val)){
                return 'Please enter a valid path'
            }
            return true;
        }
    },
    {
        type: 'list',
        name: 'lang',
        message: 'Which language is your code snippet?',
        choices: [
          'html',
          'JavaScript'
        ]
    }
];
inquirer.prompt(questions).then(function(answers){
    console.log(answers);
})