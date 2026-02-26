import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    content: string;
    role: Variant_user_assistant;
    timestamp: Time;
}
export interface MoodLog {
    mood: Mood;
    note?: string;
    timestamp: Time;
}
export type Time = bigint;
export interface JournalEntry {
    title: string;
    content: string;
    timestamp: Time;
}
export interface UserStats {
    riskAlert: boolean;
    totalMoodLogs: bigint;
    totalJournalEntries: bigint;
    currentStreak: bigint;
}
export enum Mood {
    bad = "bad",
    awful = "awful",
    good = "good",
    okay = "okay",
    great = "great"
}
export enum Variant_user_assistant {
    user = "user",
    assistant = "assistant"
}
export interface backendInterface {
    addChatMessage(role: Variant_user_assistant, content: string): Promise<void>;
    checkRiskAlert(): Promise<boolean>;
    clearChatHistory(): Promise<void>;
    createJournalEntry(title: string, content: string): Promise<void>;
    deleteJournalEntry(timestamp: Time): Promise<void>;
    getChatHistory(): Promise<Array<ChatMessage>>;
    getJournalEntries(): Promise<Array<JournalEntry>>;
    getLast30DaysMoodLogs(): Promise<Array<MoodLog>>;
    getMoodHistory(): Promise<Array<MoodLog>>;
    getUserStats(): Promise<UserStats>;
    logMood(mood: Mood, note: string | null): Promise<void>;
}
