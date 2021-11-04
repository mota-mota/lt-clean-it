const {connection, setAction} = require('./connection');

const INIT_QUERY = `CREATE TABLE IF NOT EXISTS products (
                        id INT(6) AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        stock INT(10) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    );
                    
                    CREATE TABLE IF NOT EXISTS product_sale_log(
                        id INT(6) AUTO_INCREMENT PRIMARY KEY,
                        product_id int NOT NULL,
                        qty int NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (product_id) REFERENCES products(id)
                    );
                    
                    CREATE TABLE IF NOT EXISTS product_restock_log(
                        id INT(6) AUTO_INCREMENT PRIMARY KEY,
                        product_id int NOT NULL,
                        qty int NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (product_id) REFERENCES products(id)
                    );`;

const actionInit = callback => {
    connection.query(INIT_QUERY, (err, rows) => {
        if (err) {
            console.error(err);
            callback(err);
        }

        callback(null, rows);
    });
}

setAction(actionInit, () => {})