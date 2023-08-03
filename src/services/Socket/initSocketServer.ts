import { Server, Socket } from "socket.io";
import {
  RunningSocketServer,
  ServerContext,
  SocketServer,
  StoppedSocketServer,
  ServerSenderEvents,
  ServerReceiverEvents,
} from "../../types/WebSocketMessageTypes";
import initSocketConnection from "./initSocketConnection";

export default function initSocketServer(
  socketServer: SocketServer,
  version: string
): Server | undefined {
  const server = socketServer.server;
  const io = server?.io;
  const ioContext = server?.ioContext;
  const ioVersion = server?.ioVersion;

  if (server && io && ioContext && (!ioVersion || ioVersion !== version)) {
    migrateServerVersion(socketServer as RunningSocketServer, version);
  } else if (server && !io) {
    initNewSocketServer(socketServer as StoppedSocketServer, version);
  }

  return server?.io;
}

function migrateServerVersion(
  socketServer: RunningSocketServer,
  version: string
): void {
  const server = socketServer.server;
  const io = server.io;
  const ioContext = server.ioContext;

  const serverContext: ServerContext = {
    messageContext: ioContext?.messageContext ?? new Map(),
  };
  server.ioContext = serverContext;
  server.ioVersion = version;
  io.on(
    "connection",
    (socket: Socket<ServerReceiverEvents, ServerSenderEvents>) =>
      initSocketConnection(socket, serverContext)
  );
}

function initNewSocketServer(
  socketServer: StoppedSocketServer,
  version: string
): void {
  const server = socketServer.server;
  const io = new Server(server as any);
  const serverContext: ServerContext = {
    messageContext: new Map(),
  };
  server.io = io;
  server.ioContext = serverContext;
  server.ioVersion = version;
  io.on(
    "connection",
    (socket: Socket<ServerReceiverEvents, ServerSenderEvents>) =>
      initSocketConnection(socket, serverContext)
  );
}
