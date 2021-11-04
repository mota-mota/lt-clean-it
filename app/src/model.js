const {connection} = require('./db/connection');

const queryTime = callback => {
    connection.query('SELECT NOW() AS TIME', (err, rows) => {
        if (err) {
            console.error(err);
            callback(err);
        }

        callback(null, rows);
    });
}

const queryProductExists = (id, callback) => {
    const QUERY = `SELECT EXISTS(SELECT 1 FROM products WHERE id = ${id}) as it_exists; SELECT SUM(qty) as 'qty' FROM product_restock_log WHERE product_id = ${id} AND MONTH(created_at) = MONTH(CURRENT_DATE) AND YEAR(created_at) = YEAR(CURRENT_DATE) group by(qty);`;
    connection.query(QUERY, (err, rows) => {
        if (err) {
            console.error(err);
            callback(err);
        }

        callback(null, rows);
    });
}

const baseQuery = (query, callback) => {
    connection.query(query, (err, rows) => {
        if (err) {
            console.error(err);
            callback(err);
        }

        callback(null, rows);
    });
}

const queryAddStock = (data, callback) => {
    console.log('queryAddStock', {data, callback})
    // connection.query("")
}

module.exports = {baseQuery, queryTime, queryAddStock, queryProductExists};