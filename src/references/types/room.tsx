type MessageType = {
    sender: string,
    text?: string,
    time: number
}

export type RoomType = {
    messages?: MessageType[],
    participants: string[],
    groupName?: string,
    created_by?: string
}