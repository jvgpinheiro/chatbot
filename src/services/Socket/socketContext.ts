import { Socket } from "socket.io";
import {
  WebSocketEvents,
  ServerContext,
} from "../../shared/types/WebSocketMessageTypes";

export function storeConnectionInContext<T extends keyof ServerContext>(
  socket: Socket<ServerReceiverEvents, ServerSenderEvents>,
  context: ServerContext[T],
  key: string
): void {
  const storedConnectionsByKey =
    context.get(key) ??
    new Set<Socket<ServerReceiverEvents, ServerSenderEvents>>();
  storedConnectionsByKey.add(socket);
  key && context.set(key, storedConnectionsByKey);
}

export function unstoreConnectionFromContext<T extends keyof ServerContext>(
  socket: Socket<ServerReceiverEvents, ServerSenderEvents>,
  context: ServerContext[T],
  key: string
): void {
  const storedConnectionsByKey =
    context.get(key) ??
    new Set<Socket<ServerReceiverEvents, ServerSenderEvents>>();
  storedConnectionsByKey.delete(socket);
  key && context.set(key, storedConnectionsByKey);
}
