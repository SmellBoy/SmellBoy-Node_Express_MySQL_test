// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./userSqlMapping');
 
// 使用连接池，提升性能
var pool  = mysql.createPool($util.extend({}, $conf.mysql));
//var pool  = mysql.createPool($conf.mysql);
/*
var pool = mysql.createPool(
	{
		host: '127.0.0.1', 
		user: 'root',
		password: '123456',
		database:'test1', // 前面建的user表位于这个数据库中
		port: 3306
	}
);*/
/*
pool.connect();
console.log('database connect test:');
pool.query('select * from user', function(err, rows, fields) {
  if (err) throw err;
  console.log('The solution is: ', rows[0]);
});
*/
//pool.end();

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
	if(typeof ret === 'undefined') {
		res.json({
			code:'1',
			msg: '操作失败'
		});
	} else {
		res.json(ret);
	}
};
 
module.exports = {
	add: function (req, res, next) {
		pool.getConnection(function(err, connection) {
			// 获取前台页面传过来的参数
			var param = req.query || req.params;
 
			// 建立连接，向表中插入值
			connection.query($sql.insert, [param.name, param.age], function(err, result) {
				if(result) {
					result = {
						code: 200,
						msg:'增加成功'
					};
					var propertys = ['code', 'msg', '0'];
					var result_id = [];
					var result_name = {};
					var result_age = [' '];
					var i = 0;
					//for(var i=0; i<result.length; ++i)
					//{
						result_id[i]=String(result.code);
						result_name[i]=String(result.msg);
					//}

					res.render('results', {
						th:propertys, 
						id:result_id, 
						name:result_name, 
						age:result_age
					});
				}
 
				// 以json形式，把操作结果返回给前台页面
				//jsonWrite(res, result);

				// 释放连接 
				connection.release();
			});
		});
	},
	delete: function (req, res, next) {
		// delete by Id
		pool.getConnection(function(err, connection) {
			var id = +req.query.id;
			connection.query($sql.delete, id, function(err, result) {
				if(result.affectedRows > 0) {
					result = {
						code: 200,
						msg:'删除成功'
					};					
				} else {
					result = {
						code: 300,
						msg:'删除失败'
					};
				}
				//jsonWrite(res, result);
				var propertys = ['code', 'msg', '0'];
				var result_id = [];
				var result_name = {};
				var result_age = [' '];
				var i = 0;
				//for(var i=0; i<result.length; ++i)
				//{
					result_id[i]=String(result.code);
					result_name[i]=String(result.msg);
				//}

				res.render('results', {
					th:propertys, 
					id:result_id, 
					name:result_name, 
					age:result_age
				});

				connection.release();
			});
		});
	},
    update: function (req, res, next) {
        // update by id
        // 为了简单，要求同时传name和age两个参数
        var param = req.body;
        if(param.name == null || param.age == null || param.id == null) {
            jsonWrite(res, undefined);
            return;
        }

        pool.getConnection(function(err, connection) {
            connection.query($sql.update, [param.name, param.age, +param.id], function(err, result) {
                // 使用页面进行跳转提示
                if(result.affectedRows > 0) {
                    res.render('suc', {
                        result: result
                    }); // 第二个参数可以直接在jade中使用
                } else {
                    res.render('fail',  {
                        result: result
                    });
                }
                console.log(result);

                connection.release();
            });
        });

    },
	queryById: function (req, res, next) {
		var id = +req.query.id; // 为了拼凑正确的sql语句，这里要转下整数
		pool.getConnection(function(err, connection) {
			connection.query($sql.queryById, id, function(err, result) {
				//res.render('results', {id: result.id}, {name: result.name}, {age: result.age });
				//jsonWrite(res, result);
				var propertys = Object.getOwnPropertyNames(result[0]);
				//console.log(propertys);

				var result_id = [];
				var result_name = [];
				var result_age = [];
				//console.log(result_id);
				for(var i=0; i<1; i++)
				{
					result_id[i]=id;
					result_name[i]=String(result[i].name);
					result_age[i]=String(result[i].age);
				}

				res.render('results', {
					th:propertys, 
					id:result_id, 
					name:result_name, 
					age:result_age
				});
				connection.release();
 
			});
		});
	},
	queryAll: function (req, res, next) {
		pool.getConnection(function(err, connection) {
			connection.query($sql.queryAll, function(err, result) {
				//console.log(result);
				//jsonWrite(res, result);
				var propertys = Object.getOwnPropertyNames(result[0]);
				//console.log(propertys);

				var result_id = [];
				var result_name = [];
				var result_age = [];
				//console.log(result_id);
				for(var i=0; i<result.length; i++)
				{
					result_id[i]=String(result[i].id);
					result_name[i]=String(result[i].name);
					result_age[i]=String(result[i].age);
				}

				res.render('results', {
					th:propertys, 
					id:result_id, 
					name:result_name, 
					age:result_age
				});
				connection.release();
			});
		});
	}
 
};