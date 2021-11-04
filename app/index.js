const http = require('http');
const data = require('./src/actions');
const {parse} = require('querystring');

const router = (req, res) => {
    const showIt = (err = null, suchData = null) => {
        if(err) res.write('error');

        res.write('success');
    }

    const URL = req.url;
    const METHOD = req.method;
    const NOT_SUPPORTED = `El método ${METHOD} no es soportado`;

    switch (URL) {
        case '/api/v1/registrar-compra':
            if(METHOD === 'POST'){
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                let isSuccess = false;
                req.on('end', () => {
                    body = JSON.parse(body);
                    const pr = data.actionAddStock(showIt, body);

                    pr
                        .then(r => {
                            res.write('Añadido al stock');
                            res.end();
                        })
                        .catch(err => {
                            res.write(err);
                            console.error(err)
                            res.end();
                        });
                });
                break;
            }

            res.write(NOT_SUPPORTED);
            res.end();

            break;
        case '/api/v1/registrar-venta':
            if(METHOD === 'POST'){
                res.write('holi')
                res.end();
                break;
            }

            res.write(NOT_SUPPORTED);
            res.end();

            break;
        default:
            res.write('No se encontró la ruta');
            res.end();

            break;
    }
}

http.createServer(router).listen(3001);