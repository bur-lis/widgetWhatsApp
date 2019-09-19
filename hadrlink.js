const fs = require('fs');
const child_process = require('child_process');
const readline = require('readline');
const path = require('path');

const overridePath = 'C:/Users/byrak/development/overrides';
const domen = 'pasportprosto';
//const domen = 'mois11'
const dir = path.join(overridePath, domen + '.amocrm.ru', '/widgets/amo_new_pasportprosto_whatsapp/');
const version = '1.0.2';

console.log(dir);

const scriptNames = fs.readdirSync(dir).filter(file => {
    return file.slice(0, 9) === 'script.js';
});

if (scriptNames.length === 1) {
    createLink(scriptNames[0])
} else if (scriptNames.length === 0) {
    console.error('Нет файлов для переопределения!');
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
    
    const stylesPath = path.normalize(dir + 'style.css%3fv=' + version);
    if (fs.existsSync(stylesPath)) {
        fs.unlinkSync(stylesPath);
    }

    scriptNames.forEach(file => {
        fs.unlinkSync(path.normalize(dir + file));
    })

    const commandScript = `mklink "${path.normalize(dir + filename)}" script.js /H`;
    const commandStyle = `mklink "${stylesPath}" style.css /H`;
    child_process.execSync(commandScript);
    child_process.execSync(commandStyle);
    console.log('Success');
}