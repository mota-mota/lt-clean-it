const {setAction} = require('./db/connection');
const {queryTime, baseQuery, queryProductExists} = require('./model');

const getTime = callback => {
    setAction(queryTime, callback);
};

const NOOP = (err, data) => {
    // console.log({err, data})
}

const actionAddStock = (callback = () => {}, data = {}) => {
    return new Promise(function(resolve, reject) {
        if(!data.idProducto || !data.cantidad || !data.nombreProducto){
            reject('Por favor, envía todos los campos');
            return;
        }

        const insertIntoLog = (err = null, resp = null) => {
            if (err) {
                console.error(err);
                reject('Ocurrió un error al insertar el producto');
                return;
            }

            const QUERY = `INSERT INTO product_restock_log (product_id, qty) VALUES (${data.idProducto}, ${data.cantidad})`;
            setAction(() => baseQuery(QUERY, NOOP), callback);

            resolve(true);
        }

        const insertAfterCheck = (err = null, resp = null) => {
            if (err) {
                console.error(err);
                reject('Ocurrió un error despues de chequear si el producto existía');
                return;
            }

            const exists = resp[0][0].it_exists;
            const stock = resp[1] && resp[1][0] && resp[1][0].qty ? resp[1][0].qty : 0;

            const total = (data.cantidad*1) + (stock * 1);

            console.log({exists, stock, cantidad: data.cantidad, total})
            if(total <= 30){
                if (!exists || Number(exists) === 0) {
                    const QUERY = `INSERT INTO products (id, name, stock)
                           VALUES (${data.idProducto}, '${data.nombreProducto}', ${data.cantidad})`;
                    setAction(() => baseQuery(QUERY, insertIntoLog));
                } else {
                    const QUERY = `UPDATE products set stock = stock + ${data.cantidad} WHERE id = ${data.idProducto}`
                    setAction(() => baseQuery(QUERY, insertIntoLog));
                }
            } else {
                reject('No se pueden ingresar más de 30 unidades por mes de un producto');
            }
        }

        setAction(() => queryProductExists(data.idProducto, insertAfterCheck), NOOP)
    })
}

module.exports = {getTime, actionAddStock};