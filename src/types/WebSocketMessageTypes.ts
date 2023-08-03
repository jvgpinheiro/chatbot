import { Server, Socket } from "socket.io";
import { Merge } from "../utils/typeUtils";
import { NextApiResponse } from "next";

export type ServerReceiverEvents = {
  "subscribe-message": (data: { id: string }) => void;
  "unsubscribe-message": (data: { id: string }) => void;
};

export type ServerSenderEvents = {
  "new-message": (data: { message: string }) => void;
};

export type WebSocketEvents = Merge<ServerReceiverEvents, ServerSenderEvents>;
export type SocketServer = NextApiResponse["socket"] & {
  server?: { io?: Server; ioContext?: ServerContext; ioVersion?: string };
};
export type StoppedSocketServer = NextApiResponse["socket"] & {
  server: { io?: Server; ioContext?: ServerContext; ioVersion?: string };
};
export type RunningSocketServer = NextApiResponse["socket"] & {
  server: { io: Server; ioContext: ServerContext; ioVersion: string };
};
export type ServerContext = {
  messageContext: Map<
    string,
    Set<Socket<ServerReceiverEvents, ServerSenderEvents>>
  >;
};
export type PostMessageData<T extends keyof ServerSenderEvents> = {
  type: T;
  content: WebSocketEvents[T] extends (data: infer O) => void ? O : never;
};
export type PostMessagesContent = {
  [K in keyof ServerSenderEvents]: PostMessageData<K>["content"];
};
