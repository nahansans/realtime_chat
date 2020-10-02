type MessageType = {
    sender: string,
    text?: string,
    time: number
}

export type RoomType = {
    messages?: MessageType[],
    participants: string[]
}