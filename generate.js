const fs = require('fs');
const path = require('path');

const data = require('./data.json');
const templateHtml = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const scriptJs = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

let outputHtml = templateHtml
    .replace('<!-- INJECT_CSS_HERE -->', styleCss)
    .replace('<!-- INJECT_JS_HERE -->', scriptJs)
    .replace('<!-- INJECT_EVENT_TITLE_HERE -->', data.eventTitle)
    .replace('<!-- INJECT_EVENT_DATE_HERE -->', data.eventDate)
    .replace('<!-- INJECT_SCHEDULE_DATA_HERE -->', JSON.stringify(data));

fs.writeFileSync(path.join(__dirname, 'index.html'), outputHtml);

console.log('index.html generated successfully!');