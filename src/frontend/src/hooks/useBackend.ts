import { useActor } from "./useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mood, Variant_user_assistant } from "../backend.d";

export { Mood, Variant_user_assistant };

// ---- Query hooks ----

export function useUserStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMoodHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["moodHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMoodHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLast30DaysMoods() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["last30DaysMoods"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLast30DaysMoodLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJournalEntries() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["journalEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJournalEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useChatHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Mutation hooks ----

export function useLogMood() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mood, note }: { mood: Mood; note?: string }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.logMood(mood, note ?? null);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["moodHistory"] });
      void queryClient.invalidateQueries({ queryKey: ["last30DaysMoods"] });
      void queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useCreateJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.createJournalEntry(title, content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useDeleteJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (timestamp: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.deleteJournalEntry(timestamp);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      void queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useAddChatMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      role,
      content,
    }: {
      role: Variant_user_assistant;
      content: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.addChatMessage(role, content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useClearChatHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      await actor.clearChatHistory();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}
