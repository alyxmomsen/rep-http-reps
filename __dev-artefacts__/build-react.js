const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('building react js');

const PROJECT_ROOT = __dirname;
const CONSTANTS = {
    CLIENT_PROJECT_ROOT:path.join(),
}

try {

    process.chdir('./');


}
catch (e) {
    console.log({e});
}