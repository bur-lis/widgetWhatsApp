const fs = require('fs');
const child_process = require('child_process');
const readline = require('readline');
const path = require('path');
const dir = './pasportprosto.amocrm.ru/upl/test_lis/widget/';

const scriptNames = fs.readdirSync(dir).filter(file => {
    return file.slice(0, 9) === 'script.js';
});  

if (scriptNames.length === 1) {
    createLink(scriptNames[0])
} else {
    scriptNames.forEach((file, i) => {
        console.log(i,file);
    })

    const questionMessage = 'Выберите файл на который ссылаться? (остальные будут удалены) ';
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    
    rl.question(questionMessage, (answer) => {
        if (!scriptNames[answer]) {
            console.log('Файла с таким номером нет');
        } else {
            const filename = scriptNames[answer];
            createLink(filename);
        }
        
        rl.close();
    });
}

function createLink(filename) {
    console.log(filename);
    scriptNames.forEach(file => {
        fs.unlinkSync(path.normalize(dir + file));
    })

    const command = `mklink "${path.normalize(dir + filename)}" script.js /H`;
    child_process.execSync(command);
    console.log('Success');
}