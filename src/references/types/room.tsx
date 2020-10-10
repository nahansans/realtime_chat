type MessageType = {
    sender: string,
    text?: string,
    time: number,
    isRead?: string
}
export type deletedType = {
    last_message_index:any,
    username: string,
    status: string
}
export type RoomType = {
    messages?: MessageType[],
    participants: string[],
    groupName?: string,
    created_by?: string,
    deleted_participants?: deletedType[]
}