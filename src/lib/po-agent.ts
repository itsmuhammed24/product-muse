import { supabase } from "@/integrations/supabase/client";

export interface FeedbackAnalysis {
  summary: string;
  sentiment: "positive" | "negative" | "mixed";
  patterns: string[];
  featureRequests: { title: string; priority: string; mentions: number }[];
  painPoints: string[];
}

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
  complexity: "XS" | "S" | "M" | "L" | "XL";
  complexityReason: string;
}

export interface PrioritizedFeature {
  name: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  moscow: "must" | "should" | "could" | "wont";
  justification: string;
}

async function callAgent<T>(action: string, payload: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("po-agent", {
    body: { action, ...payload },
  });

  if (error) throw new Error(error.message || "Erreur de communication avec l'agent");
  if (data?.error) throw new Error(data.error);
  return data.result as T;
}

export async function analyzeFeedback(content: string): Promise<FeedbackAnalysis> {
  return callAgent<FeedbackAnalysis>("analyze-feedback", { content });
}

export async function generateStories(content: string, persona: string): Promise<UserStory[]> {
  const result = await callAgent<{ stories: Omit<UserStory, "id">[] }>("generate-stories", { content, persona });
  return result.stories.map((s, i) => ({ ...s, id: String(i + 1) }));
}

export async function prioritizeFeatures(features: { name: string }[]): Promise<PrioritizedFeature[]> {
  const result = await callAgent<{ features: PrioritizedFeature[] }>("prioritize-features", { features });
  return result.features;
}
