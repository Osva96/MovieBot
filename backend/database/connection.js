var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'botstest',
    port: 3306,
});

connection.connect();

connection.end();