var mysql = require('mysql2');

// параметры соединения с бд
var config = {
    host: 'localhost',
    user: 'dima',
    password: '11111111111',
    database: 'Library',
    port: 3306,
    waitForConnections: true,  // Ожидать соединения
    connectionLimit: 10,       // Максимальное количество соединений в пуле
    queueLimit: 0              // Неограниченное количество запросов в очереди
};


var connection = mysql.createPool(config);



module.exports = connection; 