const {connection} = require('./db/connection');

const model = {
    queryProductExists(id, callback) {
        const QUERY = `SELECT EXISTS(SELECT 1 FROM products WHERE id = ${id}) as it_exists;
        SELECT SUM(qty) as 'qty'
        FROM product_restock_log
        WHERE product_id = ${id} AND MONTH (created_at) = MONTH (CURRENT_DATE) AND YEAR (created_at) = YEAR (CURRENT_DATE)
        group by(qty);`;
        connection.query(QUERY, (err, rows) => {
            if (err) {
                console.error(err);
                callback(err);
            }

            callback(null, rows);
        });
    },
    async productExists(idProducto) {
        return new Promise(((resolve, reject) => {
            connection.query(`SELECT EXISTS(SELECT 1 FROM products WHERE id = '${idProducto}') as it_exists;`, (err, rows) => {
                if (err) reject(err.toString());

                resolve(rows);
            });
        }))
    },
    async existencesOfCurrentMonth(idProducto) {
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
    baseQuery(query, callback) {
        connection.query(query, (err, rows) => {
            if (err) {
                console.error(err);
                callback(err);
            }

            callback(null, rows);
        });
    },
    async checkStock(productId) {
        return new Promise(((resolve, reject) => {
            connection.query(`SELECT stock
                              FROM products
                              WHERE id = '${productId}'`, (err, rows) => {
                if (err) reject(err.toString());

                resolve(rows);
            });
        }));
    },
    async reduceStock({idProducto, cantidad}) {
        return new Promise(((resolve, reject) => {
            connection.query(`UPDATE products
                              set stock = stock - ${cantidad}
                              WHERE id = '${idProducto}';`, (err, rows) => {
                if (err) reject(err.toString());

                resolve(rows);
            });
        }))
    },
    async logSale({idProducto, cantidad}) {
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