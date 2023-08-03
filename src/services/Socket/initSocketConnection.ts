import { Socket } from "socket.io";
import {
  ServerContext,
  ServerReceiverEvents,
  ServerSenderEvents,
} from "../../types/WebSocketMessageTypes";
import {
  storeConnectionInContext,
  unstoreConnectionFromContext,
} from "./socketContext";
import { sendSocketMessage } from "@/utils/websocketUtils";

export default function initSocketConnection(
  socket: Socket<ServerReceiverEvents, ServerSenderEvents>,
  serverContext: ServerContext
): void {
  socket.on("subscribe-message", ({ id }) => {
    storeConnectionInContext(socket, serverContext.messageContext, id);
    const message1 =
      "Mensagem recebida do backend via websocket 1s após o subscribe";
    const message2 =
      "Mensagem recebida do backend via websocket 2s após o subscribe";
    const message3 =
      "Mensagem recebida do backend via websocket 3s após o subscribe";
    setTimeout(
      () => sendSocketMessage("new-message", { message: message1 }),
      1000
    );
    setTimeout(
      () => sendSocketMessage("new-message", { message: message2 }),
      2000
    );
    setTimeout(
      () => sendSocketMessage("new-message", { message: message3 }),
      3000
    );
  });

  socket.on("disconnect", () => {
    Object.values(serverContext).forEach((context) => {
      const keysToDelete = new Set<string>();
      context.forEach((storedConnections, key) => {
        storedConnections.delete(socket);
        storedConnections.size <= 0 && keysToDelete.add(key);
      });
      keysToDelete.forEach((key) => context.delete(key));
    });
  });
}
