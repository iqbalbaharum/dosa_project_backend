var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

require('dotenv').config()

const abi = require('./data/dosamintburn_abi.json')

var indexRouter = require('./routes/index');

const bigchaindb = require('./datasource/bigchaindb.datasource');
const { mint } = require('./controller/nft.controller');

const Web3 = require('web3')
const web3 = new Web3(process.env.ETH_RPC_URL)

var app = express();

app.use(cors({
  origin: '*'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'html');

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const contract = new web3.eth.Contract(abi, process.env.ADDRESS_MINTBURN)

contract.events.Mint({
  filter: {
      value: [],
  },
  fromBlock: 'latest'
}).on('data', async(event) => {
  await mint(event.returnValues.to)
})
  .on('changed', changed => console.log('changed', changed))
  .on('error', err => console.log('err', err))



module.exports = app;
