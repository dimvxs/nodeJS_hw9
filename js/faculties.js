var express = require('express');
var router = express.Router();
var connection = require('./config'); //импорт соединения с базой данных
var path = require('path');




// Middleware для получения соединения из пула
router.use(function(req, res, next) {
    connection.getConnection(function(err, connection) {
        if (err) {
            console.error('Ошибка при получении соединения из пула: ', err);
            return res.status(500).send('Ошибка сервера');
        }
        req.dbConnection = connection; // Сохраняем соединение в объекте запроса
        next(); // Передаем управление следующему обработчику
    });
});


router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '../html/faculties.html'));
});


 
    router.post('/add', function(req, res){
    
    var checkFacultyName = 'SELECT * FROM Faculties WHERE Name = ?';
    var checkFacultyID = 'SELECT * FROM Faculties WHERE Id = ?';
    
    
    var facultyID = parseInt(req.body.facultyID);
    var facultyName = req.body.facultyName;
    
    
    req.dbConnection.beginTransaction(function(err) {
        if (err) {
            console.error('Ошибка начала транзакции: ', err);
            req.dbConnection.release();
            return res.status(500).send('Ошибка сервера');
        }
    
    
        req.dbConnection.execute(checkFacultyName, [facultyName], (err, results) => {
        
        if (err) {
            console.error(err);
            req.dbConnection.release();
            return res.status(500).send('ошибка при проверке названия факультета');
        }
    
        if (results.length > 0) {
            // название группы уже существует
            dbConnection.release();
            return res.status(500).send('факультет уже существует');
        }
    
    
    
        req.dbConnection.execute(checkFacultyID, [facultyID], (err, results) => {
        if (err) {
            console.error(err);
            return req.dbConnection.rollback(function() {
                req.req.dbConnection.release();
                res.status(500).send('ошибка при проверке ID факультета');
            });
    
        
        }
    
        if (results.length > 0) {
            // id группы уже существует
            return req.dbConnection.rollback(function() {
                req.dbConnection.release();
                res.status(500).send('факультет уже существует');
            });
        }
    
        var insert = 'INSERT INTO Faculties (Name, Id) VALUES (?, ?)';
    
        req.dbConnection.commit(function(err) {

                
                if (err) {
                    console.error(err);
                    return req.dbConnection.rollback(function() {
                        req.dbConnection.release();
                        res.status(500).send('ошибка  при завершении транзакции');
                    });
                }

                req.dbConnection.execute(insert, [facultyName, facultyID], (err) => {
    
                    if (err) {
                        console.error(err);
                        return req.dbConnection.rollback(function() {
                            req.dbConnection.release();
                            res.status(500).send('ошибка при добавлении ID факультета');
                        });
                
                    
                    }
        
                console.log('транзакция успешно завершена.');
                res.send('факультет успешно добавлен в базу данных.');
                req.dbConnection.release(); // Возвращаем соединение в пул
            });
        });
    });
    });
    });
    });
    



    router.post('/delete', function(req, res){

        const query = "DELETE FROM Faculties WHERE Id = ?";
        var facultyID = parseInt(req.body.facultyID);

        req.dbConnection.beginTransaction(function(err) {
            if (err) {
                console.error('Ошибка начала транзакции: ', err);
                req.dbConnection.release();
                return res.status(500).send('Ошибка сервера');
            }



            req.dbConnection.execute(query, [facultyID], (err) => {

            if (err) {
                console.error('Ошибка при удалении факультета:', err);
                return req.dbConnection.rollback(function() {
                    conn.release();
                    res.status(500).send('Ошибка при удалении факультета');
                    req.dbConnection.release();
                });
            }

            req.dbConnection.commit(function(err) {
                if (err) {
                    console.error(err);
                    return req.dbConnection.rollback(function() {
                        req.dbConnection.release();
                        res.status(500).send('ошибка  при завершении транзакции');
                    });
                }
          
            console.log('факультет удален');
            res.send('факультет успешно удален');
            req.dbConnection.release();
        });
        });
    });
});




router.post('/edit', function(req, res){
    const query = "UPDATE Faculties SET Name = ? WHERE Id = ?";
    var facultyID = parseInt(req.body.facultyID);
    var facultyName = req.body.facultyName;
    

          
        req.dbConnection.beginTransaction(function(err) {
        if (err) {
            console.error('Ошибка начала транзакции: ', err);
            req.dbConnection.release();
            return res.status(500).send('Ошибка сервера');
        }

        req.dbConnection.execute(query, [facultyName, facultyID], (err) => {

        if (err) {
            console.error('Ошибка при обновлении факультета:', err);
            return res.status(500).send('Ошибка при обновлении факультета');
        }


        req.dbConnection.commit(function(err) {
            if (err) {
                console.error(err);
                return req.dbConnection.rollback(function() {
                    req.dbConnection.release();
                    res.status(500).send('ошибка  при завершении транзакции');
                });
            }

        console.log('факультет обновлен');
        res.send('факультет успешно обновлен');
    });
})
});
});
    

module.exports = router;
