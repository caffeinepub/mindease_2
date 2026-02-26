import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";

actor {
  type Mood = {
    #great;
    #good;
    #okay;
    #bad;
    #awful;
  };

  type MoodLog = {
    mood : Mood;
    note : ?Text;
    timestamp : Time.Time;
  };

  type JournalEntry = {
    title : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type ChatMessage = {
    role : {
      #user;
      #assistant;
    };
    content : Text;
    timestamp : Time.Time;
  };

  type UserStats = {
    totalJournalEntries : Nat;
    totalMoodLogs : Nat;
    currentStreak : Nat;
    riskAlert : Bool;
  };

  module MoodLog {
    public func compare(a : MoodLog, b : MoodLog) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  module JournalEntry {
    public func compare(a : JournalEntry, b : JournalEntry) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module ChatMessage {
    public func compare(a : ChatMessage, b : ChatMessage) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  let moodLogs = Map.empty<Principal, List.List<MoodLog>>();
  let journalEntries = Map.empty<Principal, List.List<JournalEntry>>();
  let chatHistories = Map.empty<Principal, List.List<ChatMessage>>();

  // Mood Logging
  public shared ({ caller }) func logMood(mood : Mood, note : ?Text) : async () {
    let timestamp = Time.now();
    let newLog = {
      mood;
      note;
      timestamp;
    };

    let existingLogs = switch (moodLogs.get(caller)) {
      case (null) { List.empty<MoodLog>() };
      case (?logs) { logs };
    };
    existingLogs.add(newLog);
    moodLogs.add(caller, existingLogs);
  };

  public query ({ caller }) func getMoodHistory() : async [MoodLog] {
    switch (moodLogs.get(caller)) {
      case (null) { [] };
      case (?logs) { logs.toArray().sort() };
    };
  };

  public query ({ caller }) func getLast30DaysMoodLogs() : async [MoodLog] {
    let now = Time.now();
    let thirtyDaysNanos = 30 * 24 * 60 * 60 * 1_000_000_000;
    let filteredLogs = switch (moodLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.filter(
          func(log) { log.timestamp > now - thirtyDaysNanos }
        ).toArray();
      };
    };
    filteredLogs.sort();
  };

  // Journal Entries
  public shared ({ caller }) func createJournalEntry(title : Text, content : Text) : async () {
    let timestamp = Time.now();
    let newEntry = {
      title;
      content;
      timestamp;
    };

    let existingEntries = switch (journalEntries.get(caller)) {
      case (null) { List.empty<JournalEntry>() };
      case (?entries) { entries };
    };
    existingEntries.add(newEntry);
    journalEntries.add(caller, existingEntries);
  };

  public query ({ caller }) func getJournalEntries() : async [JournalEntry] {
    switch (journalEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray().sort() };
    };
  };

  public shared ({ caller }) func deleteJournalEntry(timestamp : Time.Time) : async () {
    switch (journalEntries.get(caller)) {
      case (null) { Runtime.trap("No journal entries found") };
      case (?entries) {
        let filteredEntries = entries.filter(func(entry) { entry.timestamp != timestamp });
        journalEntries.add(caller, filteredEntries);
      };
    };
  };

  // Chat History
  public shared ({ caller }) func addChatMessage(role : { #user; #assistant }, content : Text) : async () {
    let timestamp = Time.now();
    let newMessage = {
      role;
      content;
      timestamp;
    };

    let existingMessages = switch (chatHistories.get(caller)) {
      case (null) { List.empty<ChatMessage>() };
      case (?messages) { messages };
    };
    existingMessages.add(newMessage);
    chatHistories.add(caller, existingMessages);
  };

  public query ({ caller }) func getChatHistory() : async [ChatMessage] {
    switch (chatHistories.get(caller)) {
      case (null) { [] };
      case (?messages) { messages.toArray().sort() };
    };
  };

  public shared ({ caller }) func clearChatHistory() : async () {
    chatHistories.remove(caller);
  };

  // Risk Detection
  public query ({ caller }) func checkRiskAlert() : async Bool {
    riskAlertForUser(caller);
  };

  func riskAlertForUser(user : Principal) : Bool {
    switch (moodLogs.get(user)) {
      case (null) { false };
      case (?logs) {
        let now = Time.now();
        let sevenDaysNanos = 7 * 24 * 60 * 60 * 1_000_000_000;
        let recentLogs = logs.filter(
          func(log) { log.timestamp > now - sevenDaysNanos }
        );

        let badDays = recentLogs.filter(
          func(log) { switch (log.mood) { case (#bad or #awful) { true }; case (_) { false } } }
        ).size();

        badDays >= 5;
      };
    };
  };

  // User Stats
  public query ({ caller }) func getUserStats() : async UserStats {
    let totalMoodLogs = switch (moodLogs.get(caller)) {
      case (null) { 0 };
      case (?logs) { logs.size() };
    };

    let totalJournalEntries = switch (journalEntries.get(caller)) {
      case (null) { 0 };
      case (?entries) { entries.size() };
    };

    let currentStreak = calculateStreak(caller);
    let riskAlert = riskAlertForUser(caller);

    {
      totalJournalEntries;
      totalMoodLogs;
      currentStreak;
      riskAlert;
    };
  };

  func calculateStreak(user : Principal) : Nat {
    let now = Time.now();
    let oneDayNanos = 24 * 60 * 60 * 1_000_000_000;

    switch (moodLogs.get(user)) {
      case (null) { 0 };
      case (?logs) {
        var streak = 0;
        var dayOffset = 0;

        for (log in logs.values()) {
          let logDay = (now - log.timestamp) / oneDayNanos;
          if (logDay == dayOffset) {
            dayOffset += 1;
            streak += 1;
          } else if (logDay > dayOffset) {
            return streak;
          };
        };
        streak;
      };
    };
  };
};
