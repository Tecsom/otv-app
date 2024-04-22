import io from 'socket.io';

declare global {
  var socket_io: io.Server;
}
export default global;
