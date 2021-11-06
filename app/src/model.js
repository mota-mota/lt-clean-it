const {connection} = require('./db/connection');

const model = {
    async queryAddToStock({idProducto, cantidad}){
        return new Promise(((resolve, reject) => {
            connection.query(`UPDATE products
                              SET stock = stock + ${cantidad}
                              WHERE id = '${idProducto}'`, (err, rows) => {
                if(err) reject(err.toString());

                resolve(rows);
            });
        }))
    },
    async queryAddToRestockLog({idProducto, cantidad}){
        return new Promise(((resolve, reject) => {
            connection.query(`INSERT INTO product_restock_log (product_id, qty)
                               VALUES (${idProducto}, ${cantidad})`, (err, rows) => {
                if(err) reject(err.toString());

                resolve(rows);
            })
        }))
    },
    async queryAddProduct({idProducto, nombreProducto, cantidad}){
        return new Promise((resolve, reject) => {
            connection.query(`INSERT INTO products (id, name, stock)
                              VALUES (${idProducto}, '${nombreProducto}', ${cantidad})`, (err, rows) => {
                if(err) reject(err.toString());

                resolve(rows);
            });
        })
    },
    async queryProductExists(idProducto) {
        return new Promise(((resolve, reject) => {
            connection.query(`SELECT EXISTS(SELECT 1 FROM products WHERE id = '${idProducto}') as it_exists;`, (err, rows) => {
                if (err) reject(err.toString());

                resolve(rows);
            });
        }))
    },
    async queryExistencesOfCurrentMonth(idProducto) {
        return new Promise(((resolve, reject) => {
            connection.query(`SELECT SUM(qty) as 'qty'
                              FROM product_restock_log
                              WHERE product_id = '${idProducto}' AND MONTH (created_at) = MONTH (CURRENT_DATE)
                                AND YEAR (created_at) = YEAR (CURRENT_DATE)
                              group by(qty);`, (err, rows) => {
                if (err) reject(err);

                resolve(rows);
            })
        }))
    },
    async queryCheckStock(productId) {
        return new Promise(((resolve, reject) => {
            connection.query(`SELECT stock
                              FROM products
                              WHERE id = '${productId}'`, (err, rows) => {
                if (err) reject(err.toString());

                resolve(rows);
            });
        }));
    },
    async queryReduceStock({idProducto, cantidad}) {
        return new Promise(((resolve, reject) => {
            connection.query(`UPDATE products
                              set stock = stock - ${cantidad}
                              WHERE id = '${idProducto}';`, (err, rows) => {
                if (err) reject(err.toString());

                resolve(rows);
            });
        }))
    },
    async queryLogSale({idProducto, cantidad}) {
        return new Promise(((resolve, reject) => {
            connection.query(`INSERT INTO product_sale_log (product_id, qty)
                              VALUES ('${idProducto};', '${cantidad}')`, (err, rows) => {
                if (err) reject(err.toString());

                resolve(rows);
            })
        }))
    }
}

module.exports = model;