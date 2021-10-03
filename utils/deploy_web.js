var FtpDeploy = require('ftp-deploy');
//const Ftp = require('jsftp');
var path = require('path');
const { secret } = require('./secret');

var ftpDeploy = new FtpDeploy();

var dir = path.join(__dirname, '/');

//var chcp = JSON.parse(fs.readFileSync(dir + '../www/chcp.json','utf-8'));


var config = {
  user: secret.ftp.user,
  password: secret.ftp.password, // optional, prompted if none given 
  host: secret.ftp.host,
  port: secret.ftp.port,
  localRoot: dir + "../www",
  remoteRoot: "/uccnceditor",
  include: ['*', '**/*'],
  exclude: ['.git', '*.js.map', '.idea', 'tmp/*', 'build/*'/*, 'res/gdt/*', 'img/*','fonts/*'/**/]
};

console.log("Deploying release: Browser Platform");
ftpDeploy.on('uploaded', function (data) {
  console.log(data.filename);
});

ftpDeploy.deploy(config, function (err) {
  if (err) console.log(err);
  else console.log('finished');

});


ftpDeploy.on('uploaded', function (data) {
  console.log(data.filename);
});