var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'moviebot',
    port: 3306,
});

connection.connect();

connection.end();