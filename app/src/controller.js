const {setAction} = require('./db/connection');
const {
    checkStock,
    baseQuery,
    queryProductExists,
    reduceStock,
    logSale,
    productExists,
    existencesOfCurrentMonth
} = require('./model');

const getTime = callback => {
    setAction(queryTime, callback);
};

const NOOP = (err, data) => {
    // console.log({err, data})
}

const Controller = {
    addToStock({idProducto, cantidad, nombreProducto} = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!idProducto || !cantidad || !nombreProducto) {
                    reject('Por favor, envía todos los campos');
                    return;
                }

                cantidad *= cantidad;

                const [resExists] = await productExists(idProducto);

                if (!resExists) {
                    reject('Ocurrió un error verificando la existencia de un producto');
                    return;
                }

                if (resExists.it_exists) {
                    const [resExistences] = await existencesOfCurrentMonth(idProducto);
                    const existencesQty = resExistences.qty + cantidad;

                    if(existencesQty <= 30) {
                        // TODO: discount de stock y añadir log
                    }

                    reject(`Las compras por producto no deben superar las 30 unidades por mes. Cantidad: ${cantidad} | Stock: ${resExistences.qty}`);
                    return;
                }

                console.log({resExists: resExists.it_exists})
            } catch (err) {
                reject(err.toString());
            }

            reject('holi');
            return;

            const insertIntoLog = (err = null, resp = null) => {
                if (err) {
                    console.error(err);
                    reject('Ocurrió un error al insertar el producto');
                }

                const QUERY = `INSERT INTO product_restock_log (product_id, qty)
                               VALUES (${data.idProducto}, ${data.cantidad})`;
                setAction(() => baseQuery(QUERY, NOOP), NOOP);

                resolve('Procesado con éxito');
                return true;
            }

            const insertAfterCheck = (err = null, resp = null) => {
                if (err) {
                    console.error(err);
                    reject('Ocurrió un error despues de chequear si el producto existía');
                    return;
                }

                const exists = resp[0][0].it_exists;
                const stock = resp[1] && resp[1][0] && resp[1][0].qty ? resp[1][0].qty : 0;
                const total = (data.cantidad * 1) + (stock * 1);

                if (total <= 30) {
                    if (!exists || Number(exists) === 0) {
                        const QUERY = `INSERT INTO products (id, name, stock)
                                       VALUES (${data.idProducto}, '${data.nombreProducto}', ${data.cantidad})`;
                        setAction(() => baseQuery(QUERY, insertIntoLog));
                    } else {
                        const QUERY = `UPDATE products
                                       set stock = stock + ${data.cantidad}
                                       WHERE id = ${data.idProducto}`
                        setAction(() => baseQuery(QUERY, insertIntoLog));
                    }
                } else {
                    reject(`No se pueden ingresar más de 30 unidades por mes de un producto. unidades: ${stock}`);
                }
            }

            setAction(() => queryProductExists(data.idProducto, insertAfterCheck), NOOP)
        })
    },
    processSale({idProducto, cantidad} = {}) {
        return new Promise((async (resolve, reject) => {
            try {
                if (!idProducto || !cantidad) {
                    reject('Envía los datos necesarios');
                    return;
                }

                cantidad *= 1;

                if (cantidad <= 0) {
                    reject('Envíe una cantidad válida');
                    return;
                }

                const [resStock] = await checkStock(idProducto);

                if (!resStock || typeof resStock === 'object' && !resStock.hasOwnProperty('stock')) {
                    reject(`No se encontró un producto con el id ${idProducto}`);
                    return;
                }

                const stock = resStock.stock * 1;

                if (stock < cantidad) {
                    reject(`No hay stock suficiente para realizar el pedido. Solicitado: ${cantidad} | Disponible: ${stock}`);
                    return;
                }

                const {affectedRows} = await reduceStock({idProducto, cantidad});

                if (affectedRows) {
                    const {insertId, affectedRows} = await logSale({idProducto, cantidad});

                    if (insertId && affectedRows) {
                        resolve('Procesado correctamente');
                        return;
                    }

                    reject('Ocurrió un error al ingresar el registro de venta');
                    return;
                }

                reject('Ocurrió un error en el proceso');
            } catch (err) {
                reject(err.toString());
            }
        }));
    }
}


module.exports = Controller;