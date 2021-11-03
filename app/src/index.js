const http = require('http');

const router = (req, res) => {
    switch (req.url) {
        case '/sales':
            switch (req.method){
                case 'GET':
                    res.write('book');
                    res.end();
                    break;
                default:
                    res.write('not supported');
                    res.end();
                    break;
            }
            break;
        default:
            res.write('not found');
            res.end();
            break;
    }
}

http.createServer(router).listen(3000);