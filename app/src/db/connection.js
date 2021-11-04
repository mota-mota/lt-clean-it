const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.CLEANIT_HOST,
    port: process.env.CLEANIT_PORT,
    user: process.env.CLEANIT_USER,
    password: process.env.CLEANIT_PASSWORD,
    database: process.env.CLEANTI_DB,
    multipleStatements: true
});

const setAction = (action, callback) => {
    /*connection.connect(err => {
        if (err) {
            console.error({err})
            callback('error de conexión');
        }

        console.log('conn')
    });*/

    try{
        action(callback);
    } catch (err) {
        console.error('Ocurrió un error ejecutando una acción', err);
    }

    /*connection.end((err) => {
        if (err) {
            console.error(err);
            callback('error de conexión')
        }
        console.log('disconn')
    });*/
}

module.exports = {connection, setAction};

/*
connection.connect(err => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('connected')
});

connection.end(err => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('disconnected');
})
*/
