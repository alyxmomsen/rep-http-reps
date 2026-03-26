const { DataBase } = require("../database");

const dataBase = new DataBase

dataBase.addEventListener('onOperationEnd', (event) => {

    // const data = event.data || null;

    // console.log(`😱 выводим всю базу данных`);

    // console.log(data);
});

module.exports = { dataBase }