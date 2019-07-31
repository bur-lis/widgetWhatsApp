const fs = require("fs");
const path = require("path");
const zip = new require("jszip")();
const git = require('simple-git/promise')();
const colors = require('colors');
const files = ['script.js', 'style.css', 'manifest.json'];
const folders = ['i18n','images'];

git.status().then(status => {
    const gitSuccess = checkGit(status);
    if (gitSuccess) {
        createZip();
    } else {
        console.log('Архив не создан'.red);
    }
});

function checkGit(status) {
    let result = false;
    const untrackedFiles = status.files.filter(item => item.index === '?');

    if (process.argv[2] === '--no-git') {
        result = true;
    }

    if (status.modified.length) {
        console.error('Есть не закомитченные изменения'.yellow);
    } else {
        result = true;
    }
 
    if (untrackedFiles.length) {
        console.log('Есть файлы не отслеживаемые в git, либо добавь их, либо убери из gitignore'.yellow);
    }

    return result;
}

function createZip() {
    files.forEach(file => {
        zip.file(file, fs.readFileSync(file));
    })
    
    folders.forEach(folder => {
        zip.folder(folder);
        fs.readdirSync(folder).forEach(file => {
            const filePath = path.join(folder, file);
            zip.file(filePath, fs.readFileSync(filePath));
        });
    })
    
    zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream('widget.zip'))
    .on('finish', function () {
        console.log("widget.zip создан".green);
    })   
}