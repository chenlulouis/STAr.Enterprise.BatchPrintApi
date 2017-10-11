
//指定Server的IP地址和端口
const ip_addr = '127.0.0.1';
const port = '8080';

var Configs = function() {};
Configs.IP=function(){
    return ip_addr;
};
Configs.PORT=function(){
    return port;
}
module.exports = Configs;
