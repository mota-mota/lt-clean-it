const http = require('http');
const dotenv = require('dotenv');
const {addToStock, processSale} = require('./src/controller');
dotenv.config();

const response = ({msg = '', data = null, errors = null}) => {
    return JSON.stringify({msg, data, errors})
}

const getData = req => {
    return new Promise((resolve, reject) => {
        try {
            let body = "";

            req.on("data", chunk => {
                body += chunk.toString();
            });

            req.on("end", () => {
                try{
                    resolve(JSON.parse(body));
                } catch (err){
                    reject('Ocurrió un error al obtener los datos');
                }
            })
        } catch (err) {
            reject(err);
        }
    })
}

const router = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    const URL = req.url;
    const METHOD = req.method;
    const METHOD_NOT_SUPPORTED = `El método ${METHOD} no es soportado`;

    switch (URL) {
        case '/api/v1/registrar-compra':
            if (METHOD === 'POST') {
                try {
                    const data = await getData(req);

                    const result = await addToStock(data);

                    res.end(response({msg: result}));
                } catch (err) {
                    res.statusCode = 500;
                    res.end(response({
                        msg: 'Ocurrió un error',
                        errors: err.toString()
                    }));
                }

                break;
            }

            res.statusCode = 404;
            res.end(response({
                msg: METHOD_NOT_SUPPORTED
            }))

            break;
        case '/api/v1/registrar-venta':
            if (METHOD === 'POST') {
                try {
                    const data = await getData(req);
                    const result = await processSale(data);

                    res.end(response({
                        msg: result
                    }));
                } catch (err) {
                    res.statusCode = 500;
                    res.end(response({
                        msg: err
                    }));
                }
                break;
            }

            res.statusCode = 500;
            res.end(response({
                msg: METHOD_NOT_SUPPORTED
            }));
            break;
        default:
            res.statusCode = 404;
            res.end(response({
                msg: 'Ruta no encontrada'
            }));

            break;
    }
}

http.createServer(router).listen(process.env.CLEANIT_SERVER_PORT);