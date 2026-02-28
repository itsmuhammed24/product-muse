import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "analyze-feedback": `Tu es un expert Product Owner / UX Researcher. Tu analyses des retours clients (emails, tickets, commentaires).

Tu DOIS utiliser la fonction analyze_feedback pour retourner ton analyse structurée. Analyse en profondeur :
- Le sentiment global (positive, negative, ou mixed)
- Un résumé clair et actionnable de 2-3 phrases
- Les patterns et tendances récurrents
- Les demandes de features explicites ou implicites avec priorité et nombre de mentions estimé
- Les points de douleur majeurs

Sois précis, objectif et orienté action. Utilise le français.`,

  "generate-stories": `Tu es un Product Owner senior expert en écriture de user stories. Tu génères des user stories professionnelles au format standard.

Tu DOIS utiliser la fonction generate_user_stories pour retourner les stories structurées.

Pour chaque story :
- Définis un rôle/persona pertinent
- Écris une action claire et spécifique
- Indique le bénéfice business/utilisateur
- Propose 4-6 critères d'acceptation testables et précis
- Estime la complexité (XS, S, M, L, XL) avec justification

Génère 2 à 4 user stories selon la complexité de la feature décrite. Utilise le français.`,

  "prioritize-features": `Tu es un expert en priorisation produit. On te donne une liste de features avec leurs descriptions.

Tu DOIS utiliser la fonction prioritize_features pour retourner ta priorisation structurée.

Pour chaque feature, propose :
- Un score RICE réaliste (Reach 0-1000, Impact 1-3, Confidence 0-100, Effort 1-10)
- Une catégorie MoSCoW (must, should, could, wont)
- Une justification courte de ta priorisation

Base tes estimations sur des critères objectifs : valeur utilisateur, faisabilité technique, impact business. Utilise le français.`,
};

const TOOLS: Record<string, any[]> = {
  "analyze-feedback": [
    {
      type: "function",
      function: {
        name: "analyze_feedback",
        description: "Return structured feedback analysis",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Résumé actionnable de 2-3 phrases" },
            sentiment: { type: "string", enum: ["positive", "negative", "mixed"] },
            patterns: {
              type: "array",
              items: { type: "string" },
              description: "Patterns et tendances identifiés",
            },
            featureRequests: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  priority: { type: "string", enum: ["Critique", "Haute", "Moyenne", "Basse"] },
                  mentions: { type: "number" },
                },
                required: ["title", "priority", "mentions"],
                additionalProperties: false,
              },
            },
            painPoints: {
              type: "array",
              items: { type: "string" },
              description: "Points de douleur identifiés",
            },
          },
          required: ["summary", "sentiment", "patterns", "featureRequests", "painPoints"],
          additionalProperties: false,
        },
      },
    },
  ],
  "generate-stories": [
    {
      type: "function",
      function: {
        name: "generate_user_stories",
        description: "Return generated user stories",
        parameters: {
          type: "object",
          properties: {
            stories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  action: { type: "string" },
                  benefit: { type: "string" },
                  acceptanceCriteria: { type: "array", items: { type: "string" } },
                  complexity: { type: "string", enum: ["XS", "S", "M", "L", "XL"] },
                  complexityReason: { type: "string" },
                },
                required: ["role", "action", "benefit", "acceptanceCriteria", "complexity", "complexityReason"],
                additionalProperties: false,
              },
            },
          },
          required: ["stories"],
          additionalProperties: false,
        },
      },
    },
  ],
  "prioritize-features": [
    {
      type: "function",
      function: {
        name: "prioritize_features",
        description: "Return prioritized features with RICE scores and MoSCoW categories",
        parameters: {
          type: "object",
          properties: {
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reach: { type: "number" },
                  impact: { type: "number" },
                  confidence: { type: "number" },
                  effort: { type: "number" },
                  moscow: { type: "string", enum: ["must", "should", "could", "wont"] },
                  justification: { type: "string" },
                },
                required: ["name", "reach", "impact", "confidence", "effort", "moscow", "justification"],
                additionalProperties: false,
              },
            },
          },
          required: ["features"],
          additionalProperties: false,
        },
      },
    },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, features, persona } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[action];
    const tools = TOOLS[action];
    if (!systemPrompt || !tools) {
      return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userMessage = content || "";
    if (action === "generate-stories" && persona) {
      userMessage = `Persona principal : ${persona}\n\nFeature à découper en user stories :\n${content}`;
    }
    if (action === "prioritize-features" && features) {
      userMessage = `Voici les features à prioriser :\n${features.map((f: any, i: number) => `${i + 1}. ${f.name}`).join("\n")}`;
    }

    const toolChoice = { type: "function", function: { name: tools[0].function.name } };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits dans les paramètres." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "L'IA n'a pas retourné de résultat structuré" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("po-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
