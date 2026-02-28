import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, TrendingUp, Tag, AlertTriangle, ThumbsUp, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { analyzeFeedback, type FeedbackAnalysis as AnalysisResult } from "@/lib/po-agent";

const sampleFeedbacks = [
  "Le tableau de bord est super mais il manque un export PDF. Aussi, la recherche est trop lente quand on a beaucoup de projets. J'adorerais avoir des filtres avancés.",
  "Nous avons besoin d'une intégration Slack pour les notifications. L'équipe perd du temps à checker l'app. Par contre, le nouveau design est top !",
  "Bug critique : les données se perdent quand on rafraîchit la page en plein édition. Plusieurs membres de l'équipe ont remonté ce problème.",
];

const loadingMessages = [
  "Analyse du sentiment…",
  "Identification des patterns…",
  "Extraction des features…",
  "Évaluation des pain points…",
];

const FeedbackAnalysis = () => {
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleAnalyze = async () => {
    if (!feedback.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setLoadingStep(0);
    const interval = setInterval(() => setLoadingStep((s) => (s + 1) % loadingMessages.length), 1500);
    try {
      const analysis = await analyzeFeedback(feedback);
      setResult(analysis);
    } catch (e: any) {
      toast({ title: "Erreur d'analyse", description: e.message || "Impossible d'analyser", variant: "destructive" });
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const sentimentConfig = {
    positive: { label: "Positif", icon: ThumbsUp, cls: "bg-success/10 text-success" },
    negative: { label: "Négatif", icon: AlertTriangle, cls: "bg-destructive/10 text-destructive" },
    mixed: { label: "Mixte", icon: TrendingUp, cls: "bg-warning/10 text-warning" },
  };

  return (
    <>
      <PageHeader title="Analyse de Feedback" description="Collez vos retours clients pour en extraire patterns, sentiments et demandes." />

      {/* Input */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2 block">
          Retours clients
        </label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Collez ici les retours — emails, tickets, commentaires…"
          className="min-h-[120px] resize-none mb-3 bg-background text-[13px]"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {sampleFeedbacks.map((s, i) => (
              <button
                key={i}
                onClick={() => setFeedback((p) => (p ? p + "\n\n" : "") + s)}
                className="text-[11px] px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Exemple {i + 1}
              </button>
            ))}
          </div>
          <Button onClick={handleAnalyze} disabled={!feedback.trim() || isAnalyzing} className="bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] h-9 px-4">
            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
            Analyser
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isAnalyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-primary-foreground animate-pulse" />
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={loadingStep} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-[13px] text-muted-foreground">
              {loadingMessages[loadingStep]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Résultats générés par IA
            </p>

            {/* Summary + Sentiment */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 rounded-lg border border-border bg-card p-5">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-2">Résumé</h3>
                <p className="text-[13px] text-foreground leading-relaxed">{result.summary}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 flex flex-col items-center justify-center">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3">Sentiment</h3>
                {(() => {
                  const cfg = sentimentConfig[result.sentiment];
                  return (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${cfg.cls}`}>
                      <cfg.icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Patterns */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3">Patterns identifiés</h3>
              <div className="grid grid-cols-2 gap-2">
                {result.patterns.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2 p-2.5 rounded bg-secondary/50">
                    <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-[12px] text-foreground">{p}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Feature Requests */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3">Demandes de features</h3>
              <div className="space-y-1.5">
                {result.featureRequests.map((fr, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="flex items-center justify-between p-3 rounded bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[12px] font-medium text-foreground">{fr.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={fr.priority === "Critique" ? "destructive" : "secondary"} className="text-[10px]">{fr.priority}</Badge>
                      <span className="text-[10px] text-muted-foreground">{fr.mentions} mentions</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pain Points */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3">Points de douleur</h3>
              <div className="space-y-1.5">
                {result.painPoints.map((pp, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2 p-2.5 rounded bg-destructive/5">
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                    <span className="text-[12px] text-foreground">{pp}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackAnalysis;
