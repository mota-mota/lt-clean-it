const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const INIT_QUERY = `CREATE DATABASE IF NOT EXISTS cleanit_db;
                    CREATE TABLE IF NOT EXISTS cleanit_db.products (
                        id INT(6) AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        stock INT(10) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    );
                    
                    CREATE TABLE IF NOT EXISTS cleanit_db.product_sale_log(
                        id INT(6) AUTO_INCREMENT PRIMARY KEY,
                        product_id int NOT NULL,
                        qty int NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (product_id) REFERENCES products(id)
                    );
                    
                    CREATE TABLE IF NOT EXISTS cleanit_db.product_restock_log(
                        id INT(6) AUTO_INCREMENT PRIMARY KEY,
                        product_id int NOT NULL,
                        qty int NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (product_id) REFERENCES products(id)
                    );`;

const connection = mysql.createConnection({
    host: process.env.CLEANIT_HOST,
    port: process.env.CLEANIT_PORT,
    user: process.env.CLEANIT_USER,
    password: process.env.CLEANIT_PASSWORD,
    multipleStatements: true
});

connection.query(INIT_QUERY, (err, rows) => {
    if (err) {
        console.error(err);
    }

    console.log(rows);
});

connection.end(err => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('disconnected');
});