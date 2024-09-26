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
    res.sendFile(path.join(__dirname, '../html/groups.html'));
});


 
    router.post('/add', function(req, res){
    
    var checkGroupName = 'SELECT * FROM Groupss WHERE Name = ?';
    var checkGroupID = 'SELECT * FROM Groupss WHERE Id = ?';
    
    var groupID = parseInt(req.body.groupID);
    var groupName = req.body.groupName;
    var facultyID = req.body.facultyID;

    
 
    
    req.dbConnection.beginTransaction(function(err) {
        if (err) {
            console.error('Ошибка начала транзакции: ', err);
            connection.release();
            return res.status(500).send('Ошибка сервера');
        }
    
    
        req.dbConnection.execute(checkGroupName, [groupName], (err, results) => {
        
        if (err) {
            console.error(err);
            req.dbConnection.release();
            return res.status(500).send('ошибка при проверке названия группы');
        }
    
        if (results.length > 0) {
            // название группы уже существует
            req.dbConnection.release();
            return res.status(500).send('группа уже существует');
        }
    
    
       
    
      
    
         
    
    
    
        req.dbConnection.execute(checkGroupID, [groupID], (err, results) => {
        if (err) {
            console.error(err);
            return req.dbConnection.rollback(function() {
                req.dbConnection.release();
                res.status(500).send('ошибка при проверке ID группы');
            });
    
        
        }
    
        if (results.length > 0) {
            // id группы уже существует
            return req.dbConnection.rollback(function() {
                req.dbConnection.release();
                res.status(500).send('группа уже существует');
            });
        }
    
        var insert = 'INSERT INTO Groupss (Name, Id, Id_Faculty) VALUES (?, ?, ?)';
    
        req.dbConnection.commit(function(err) {
                if (err) {
                    console.error(err);
                    return req.dbConnection.rollback(function() {
                        req.dbConnection.release();
                        res.status(500).send('ошибка  при завершении транзакции');
                    });
                }

                req.dbConnection.execute(insert, [groupName, groupID, facultyID], (err) => {
    
                    if (err) {
                        console.error(err);
                        return req.dbConnection.rollback(function() {
                            req.dbConnection.release();
                            res.status(500).send('ошибка при добавлении ID группы');
                        });
                
                    
                    }
        
                console.log('транзакция успешно завершена.');
                res.send('группа успешно добавлена в базу данных.');
                req.dbConnection.release(); // Возвращаем соединение в пул
            });
        });
    });
    });
    });
    });




    router.post('/delete', function(req, res){

       
            const query = "DELETE FROM Groupss WHERE Id = ?";

            var groupID = parseInt(req.body.groupID);



                req.dbConnection.beginTransaction(function(err) {
                if (err) {
                    console.error('Ошибка начала транзакции: ', err);
                    req.dbConnection.release();
                    return res.status(500).send('Ошибка сервера');
                }
    


                req.dbConnection.execute(query, [groupID], (err) => {

                if (err) {
                    console.error('Ошибка при удалении группы:', err);
                    return conn.rollback(function() {
                        conn.release();
                        res.status(500).send('Ошибка при удалении группы');
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
              
                console.log('группа удалена');
                res.send('группа успешно удалена');
                req.dbConnection.release();
            });
            });
        });
    });


    


router.post('/edit', function(req, res){
    const query = "UPDATE Groupss SET Name = ?, Id_Faculty = ? WHERE Id = ?";
    var groupID = parseInt(req.body.groupID);
    var groupName = req.body.groupName;
    var facultyID = req.body.facultyID;
    
          
        req.dbConnection.beginTransaction(function(err) {
        if (err) {
            console.error('Ошибка начала транзакции: ', err);
            req.dbConnection.release();
            return res.status(500).send('Ошибка сервера');
        }
    


        req.dbConnection.execute(query, [groupName, facultyID, groupID], (err) => {

        if (err) {
            console.error('Ошибка при обновлении группы:', err);
            return res.status(500).send('Ошибка при обновлении группы');
        }


        req.dbConnection.commit(function(err) {
            if (err) {
                console.error(err);
                return req.dbConnection.rollback(function() {
                    req.dbConnection.release();
                    res.status(500).send('ошибка  при завершении транзакции');
                });
            }

        console.log('группа обновлена');
        res.send('группа успешно обновлена');
    });
})
});
});


module.exports = router;
