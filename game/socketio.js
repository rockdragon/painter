var IO = require('socket.io');

var io = IO();
var debug = require('debug')('app:socket');
var _connected_mapping = {};

//hook all ns
//as https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/
for (var n in io.nsps) {
    io.nsps[n].on('connect', function (socket) {
        if (!socket['auth']) {
            debug("removing sock from ns", io.nsps[n].name)
            delete io.nsps[n].connected[socket.id];
        }
    });
}

io.on('connection', (socket) => {
    socket.on('authentication', (data) => {
        clearTimeout(loginCountdown);
        try {
            var res = authenticate(socket, data);
            enroll(socket, res);
        } catch (e) {
            //crashed
            debug(`disconnecting socket ${socket.id} err ${e}`)
            socket.disconnect(true);
        }
    });

    socket.on("disconnect", () => {
        if (socket["auth"]) {
            var nick_name = socket["auth"];

            _del_mapping(nick_name);
        }
    });
});

function authenticate(socket, data) {
    debug(`socket ${socket.id} tries to login`);
    debug(data);

    var socket = get_socket(data.nick_name);
    if(socket) throw new Error('nickname ${data.nick_name} has been occupied.');
}

function enroll(socket, nick_name) {
    socket['auth'] = nick_name;
    Object.keys(io.nsps).forEach((namespace)=> {
        io.nsps[namespace].sockets.forEach((s)=> {
            if (s.id === socket.id) {
                debug("restoring socket to", namespace);
                io.nsps[namespace].connected[socket.id] = socket;
                _set_mapping(nick_name, namespace, socket.id);
                return;
            }
        });
    });
}

function attach(server) {
    io.attach(server);
}
function _get_mapping(nick_name) {
    var key = nick_name;
    var mapping = _connected_mapping[key];
    return mapping;
}
function get_socket(nick_name) {
    var mapping = _get_mapping(nick_name);
    if (!mapping) return undefined;
    return io.nsps[mapping.namespace].connected[mapping.socketid];
}
function _set_mapping(nick_name, namespace, socketid) {
    var key = _get_key(nick_name);
    _connected_mapping[key] = {namespace: namespace, socketid: socketid};
}
function _del_mapping(nick_name) {
    var key = _get_key(nick_name);
    var mapping = _connected_mapping[key];
    if (mapping) {
        delete _connected_mapping[key];
    }
}
function _exists_nick_name(nick_name) {
    var mapping = _get_mapping(nick_name);
    return !!mapping;
}

module.exports.attach = attach;
module.exports.exists_nick_name = _exists_nick_name;
