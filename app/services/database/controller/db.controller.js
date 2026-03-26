const { DataBase } = require("../database");

const dataBase = new DataBase

dataBase.addEventListener('onOperationEnd', (event) => {

    const data = event.data || null;

    console.log({data});
});

module.exports = { dataBase }