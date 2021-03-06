import debug from 'debug';

const log = debug('maple-server:ChatServer');
const listenerLog = debug('maple-server:ChatServer=>Listenser');
const emitLog = debug('maple-server:ChatServer=>Emit');

const rooms = new Map();

/**
 * @param {import('../../node_modules/socket.io/dist/socket').Socket} socket
 */
function chatServerSocketService(socket, io) {
  log('New Socket Connected');

  socket.on('join classroom', ({ classID, userID }) => {
    listenerLog(`New Request To Join Classroom ${classID} from ${socket.id}`);

    if (!rooms.has(classID)) {
      log('Creating new room', classID);
      rooms.set(classID, [{ socketID: socket.id, userID }]);
    }

    socket.join(classID);

    log('Socket', socket.id, 'joined classroom', classID);
    socket.data.classId = classID;
    const roomMembers = rooms.get(classID);
    const classData = { numberOfConnected: roomMembers.length };

    socket.emit('joined classroom data', classData);
  });

  socket.on('forward message', ({ message, classID }) => {
    listenerLog(`New Message Recieved Frmo Class ${classID}: ${message}`);
    socket.to(classID).emit('recieve message', { message });
  });

  socket.on('disconnect', (reason) => {
    log(`Socket on Chat Namespace Disconnected due to reason ${reason}`);
    socket.leave(socket.data.classId);

    const users = rooms.get(socket.data.classId);
    rooms.set(
      socket.data.classId,
      users.filter((user) => user.socketID != socket.id)
    );
  });
}

export default chatServerSocketService;
