import { mergeSets } from "../../utils/objectUtils";
import {
  PostMessagesContent,
  ServerContext,
  ServerReceiverEvents,
  ServerSenderEvents,
  SocketServer,
} from "../../types/WebSocketMessageTypes";
import { Socket } from "socket.io";

type SubscribeKeysByType = {
  [K in keyof PostMessagesContent]: {
    context: keyof ServerContext;
    keys: Array<keyof PostMessagesContent[K]>;
  };
};

const subscribeKeysByType: SubscribeKeysByType = {
  "new-message": {
    context: "messageContext",
    keys: ["message"],
  },
};

export default function sendSocketMessageToFront(
  socketServer: SocketServer,
  body: any
): number | undefined {
  const type: keyof PostMessagesContent = body.type;
  const server = socketServer.server;
  const contexts: ServerContext | undefined = server?.ioContext;
  if (!contexts) {
    return;
  }
  const subscribedInfo = subscribeKeysByType[type];
  if (subscribedInfo) {
    const { context, keys } = subscribedInfo;
    return notifyConnections(
      contexts[context],
      type,
      body.content,
      keys as any
    );
  }
}

function notifyConnections<
  C extends keyof ServerContext,
  T extends keyof PostMessagesContent,
  K extends keyof PostMessagesContent[T]
>(
  context: ServerContext[C],
  type: T,
  content: PostMessagesContent[T],
  subscribeKeys: Array<K>
): number {
  type CustomSocket = Socket<ServerReceiverEvents, ServerSenderEvents>;
  const sets = subscribeKeys
    .map((key) => {
      const safeKey = key.toString();
      const value = content[safeKey as keyof PostMessagesContent[T]];
      return context.get(`${safeKey}_${value}`);
    })
    .filter((set) => !!set);
  const castedSets = sets as any as Array<Set<CustomSocket>>;
  const socketConnections = mergeSets(...castedSets);
  socketConnections &&
    socketConnections.forEach((socket) => (socket as any).emit(type, content));
  return socketConnections?.size ?? 0;
}
