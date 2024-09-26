var express = require('express');
var router = express.Router();
var connection = require('./config'); //импорт соединения с базой данных
var path = require('path');
const { group } = require('console');




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
    res.sendFile(path.join(__dirname, '../html/students.html'));
});


 
    router.post('/add', function(req, res){
    
    var checkStudentsGroupID = 'SELECT * FROM Students WHERE Id_Group = ?';
    var checkStudentsID = 'SELECT * FROM Students WHERE Id = ?';
    

    var studentsID = parseInt(req.body.studentsID);
    var name = req.body.name;
    var surname = req.body.surname;
    var groupID = req.body.groupID;

    
    

    
    
        req.dbConnection.beginTransaction(function(err) {
        if (err) {
            console.error('Ошибка начала транзакции: ', err);
            req.dbConnection.release();
            return res.status(500).send('Ошибка сервера');
        }
    
    
        req.dbConnection.execute(checkStudentsGroupID, [groupID], (err, results) => {
        
        if (err) {
            console.error(err);
            req.dbConnection.release();
            return res.status(500).send('ошибка при проверке данных студента');
        }
    
        if (results.length > 0) {
            // название группы уже существует
            req.dbConnection.release();
            return res.status(500).send('студент уже существует');
        }
    
    
    
    
    
    
        req.dbConnection.execute(checkStudentsID, [studentsID], (err, results) => {
        if (err) {
            console.error(err);
            return  req.dbConnection.rollback(function() {
                req.dbConnection.release();
                res.status(500).send('ошибка при проверке ID студента');
            });
    
        
        }
    
        if (results.length > 0) {
            // id группы уже существует
            return  req.dbConnection.rollback(function() {
                req.dbConnection.release();
                res.status(500).send('студент уже существует');
            });
        }
    
       
    
        req.dbConnection.commit(function(err) {
                if (err) {
                    console.error(err);
                    return  req.dbConnection.rollback(function() {
                        req.dbConnection.release();
                        res.status(500).send('ошибка  при завершении транзакции');
                    });
                }

                var insert = 'INSERT INTO Students (Id, FirstName, LastName, Id_Group) VALUES (?, ?, ?, ?)';
                req.dbConnection.execute(insert, [studentsID, name, surname, groupID], (err) => {
            
                    if (err) {
                        console.error(err);
                        return  req.dbConnection.rollback(function() {
                            req.dbConnection.release();
                            res.status(500).send('ошибка при добавлении студента');
                        });
                
                    
                    }
        
                console.log('транзакция успешно завершена.');
                res.send('студент успешно добавлен в базу данных.');
                req.dbConnection.release(); // Возвращаем соединение в пул
            });
        });
    });
    });
    });
    });
    
 


    router.post('/delete', function(req, res){

       
        const query = "DELETE FROM Students WHERE Id = ?";

        var studentsID = parseInt(req.body.studentsID);



    

            req.dbConnection.beginTransaction(function(err) {
            if (err) {
                console.error('Ошибка начала транзакции: ', err);
                connection.release();
                return res.status(500).send('Ошибка сервера');
            }



            req.dbConnection.execute(query, [studentsID], (err) => {

            if (err) {
                console.error('Ошибка при удалении студента:', err);
                return conn.rollback(function() {
                    conn.release();
                    res.status(500).send('Ошибка при удалении студента');
                    connection.release();
                });
            }

            req.dbConnection.commit(function(err) {
                if (err) {
                    console.error(err);
                    return connection.rollback(function() {
                        connection.release();
                        res.status(500).send('ошибка  при завершении транзакции');
                    });
                }
          
            console.log('студент удален');
            res.send('студент успешно удален');
            req.dbConnection.release();
        });
        });
    });
});








router.post('/edit', function(req, res){
    const query = "UPDATE Students SET FirstName = ?, LastName = ?, Id_Group = ? WHERE Id = ?";
    var studentsID = parseInt(req.body.studentsID);
    var name = req.body.name;
    var surname = req.body.surname;
    var groupID = req.body.groupID;
    
        req.dbConnection.beginTransaction(function(err) {
        if (err) {
            console.error('Ошибка начала транзакции: ', err);
            req.dbConnection.release();
            return res.status(500).send('Ошибка сервера');
        }

          req.dbConnection.execute(query, [name, surname, groupID, studentsID], (err) => {

        if (err) {
            console.error('Ошибка при обновлении студента:', err);
            req.dbConnection.release();
            return res.status(500).send('Ошибка при обновлении студента');
        }


        req.dbConnection.commit(function(err) {
            if (err) {
                console.error(err);
                return req.dbConnection.rollback(function() {
                    req.dbConnection.release();
                    res.status(500).send('ошибка  при завершении транзакции');
                });
            }

        console.log('студент обновлен');
        res.send('студент успешно обновлен');
    });
})
});
});

    

module.exports = router;
