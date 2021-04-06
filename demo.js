var mysql = require('mysql');

var con = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "88888888",
  database: "mydb"
});


con.connect(function(err) {
    if (err) throw err;
    con.query("SELECT * FROM customers WHERE name LIKE '%n%'", function (err, result) {
      if (err) throw err;
      console.log(result);
    });
  });