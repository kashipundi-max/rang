export interface Message {
    id: number;
    nameKey: string;
    messageKey: string;
    timeKey: string;
    isMe: boolean;
}

export const messageKeys: Message[] = [
    {
        id: 1,
        nameKey: "card2.messages.msg3.name",
        messageKey: "card2.messages.msg3.message",
        timeKey: "card2.messages.msg3.time",
        isMe: true,
    },
    {
        id: 2,
        nameKey: "card2.messages.msg1.name",
        messageKey: "card2.messages.msg1.message",
        timeKey: "card2.messages.msg1.time",
        isMe: false,
    },
    {
        id: 3,
        nameKey: "card2.messages.msg2.name",
        messageKey: "card2.messages.msg2.message",
        timeKey: "card2.messages.msg2.time",
        isMe: false,
    },
];
