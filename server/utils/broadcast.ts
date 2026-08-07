type BroadcastHandler = (data: any) => void;

let broadcastHandler: BroadcastHandler | null = null;

export const setBroadcastHandler = (handler: BroadcastHandler) => {
    broadcastHandler = handler;
};

export const broadcast = (data: any) => {
    if (broadcastHandler) {
        broadcastHandler(data);
    } else {
        console.warn("Broadcast handler not set!");
    }
};
