let express = require('express');

let app = express();
let port = 5000;

app.use(express.static('server/public'));

const bodyParser = require('body-parser');
app.use( bodyParser.urlencoded( { extended: true } ) );

let cors = require('cors');
app.use(cors());

app.listen(port, function(){
  console.log('listening on port', port);
});