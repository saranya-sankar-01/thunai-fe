type ChatHistory = {
    query: string;
    response: string
}
export interface HistoryDetail {
    histories: ChatHistory[]
}