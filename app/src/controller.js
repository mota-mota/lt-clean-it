const {
    queryCheckStock,
    queryAddProduct,
    queryReduceStock,
    queryLogSale,
    queryAddToRestockLog,
    queryProductExists,
    queryAddToStock,
    queryExistencesOfCurrentMonth
} = require('./model');

const Controller = {
    addToStock({idProducto = null, cantidad = null, nombreProducto = null, fecha = false} = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!idProducto || !cantidad || !nombreProducto) {
                    reject('Por favor, envía todos los campos');
                    return;
                }

                if (fecha) {
                    const [y, m, d] = fecha.split('-');

                    const today = new Date();
                    const date = new Date(y, m - 1, d);

                    if (date > today) {
                        reject('La fecha de compra no puede ser mayor a la fecha actual');
                        return;
                    }
                }

                cantidad *= 1;

                if (cantidad > 30) {
                    reject(`Las compras por producto no deben superar las 30 unidades por mes.`);
                    return;
                }

                const [resExists] = await queryProductExists(idProducto);

                if (!resExists) {
                    reject('Ocurrió un error verificando la existencia de un producto');
                    return;
                }

                if (resExists.it_exists) {
                    const [resExistences] = await queryExistencesOfCurrentMonth({idProducto, fecha});
                    const fromQty = resExistences && resExistences.qty ? resExistences.qty : 0;
                    const existencesQty = fromQty + cantidad;

                    if (existencesQty > 30) {
                        reject(`Las compras por producto no deben superar las 30 unidades por mes. Cantidad: ${cantidad} | Stock ingresado este mes: ${resExistences.qty}`);
                        return;
                    }

                    const {affectedRows} = await queryAddToStock({idProducto, cantidad});

                    if (affectedRows) {
                        const {affectedRows} = await queryAddToRestockLog({idProducto, cantidad, fecha});

                        if (affectedRows) {
                            resolve('Procesado con éxito');
                            return;
                        }

                        reject('Ocurrió un error al procesar el log');
                        return;
                    }

                    reject('Ocurrió un error al añadir al stock');
                    return;
                } else {
                    const {affectedRows} = await queryAddProduct({idProducto, nombreProducto, cantidad});

                    if (affectedRows) {
                        const {affectedRows} = await queryAddToRestockLog({idProducto, cantidad, fecha});

                        if (affectedRows) {
                            resolve('Procesado con éxito');
                            return;
                        }

                        reject('Ocurrió un error al procesar el log');
                        return;
                    }

                    reject('Ocurrió un error al crear el producto');
                }
            } catch (err) {
                reject(err.toString());
            }
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

                const [resStock] = await queryCheckStock(idProducto);

                if (!resStock || typeof resStock === 'object' && !resStock.hasOwnProperty('stock')) {
                    reject(`No se encontró un producto con el id ${idProducto}`);
                    return;
                }

                const stock = resStock.stock * 1;

                if (stock < cantidad) {
                    reject(`No hay stock suficiente para realizar el pedido. Solicitado: ${cantidad} | Disponible: ${stock}`);
                    return;
                }

                const {affectedRows} = await queryReduceStock({idProducto, cantidad});

                if (affectedRows) {
                    const {insertId, affectedRows} = await queryLogSale({idProducto, cantidad});

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