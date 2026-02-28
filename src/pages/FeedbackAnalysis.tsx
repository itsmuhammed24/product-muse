import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, Send, Loader2, TrendingUp, Tag, AlertTriangle, ThumbsUp, Sparkles } from "lucide-react";
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
  "Analyse du sentiment en cours…",
  "Identification des patterns…",
  "Extraction des demandes de features…",
  "Évaluation des points de douleur…",
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

    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % loadingMessages.length);
    }, 1500);

    try {
      const analysis = await analyzeFeedback(feedback);
      setResult(analysis);
    } catch (e: any) {
      toast({
        title: "Erreur d'analyse",
        description: e.message || "Impossible d'analyser les feedbacks",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const sentimentConfig = {
    positive: { label: "Positif", icon: ThumbsUp, className: "bg-success/10 text-success" },
    negative: { label: "Négatif", icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
    mixed: { label: "Mixte", icon: TrendingUp, className: "bg-warning/10 text-warning" },
  };

  return (
    <>
      <PageHeader
        title="Analyse de Feedback"
        description="Collez vos retours clients pour identifier patterns, sentiments et demandes de features."
        icon={<MessageSquareText className="w-5 h-5 text-primary-foreground" />}
      />

      {/* Input */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-6">
        <label className="text-sm font-medium text-foreground mb-3 block">
          Retours clients (emails, tickets, commentaires…)
        </label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Collez ici les retours de vos clients…"
          className="min-h-[140px] resize-none mb-4 bg-background"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {sampleFeedbacks.map((s, i) => (
              <button
                key={i}
                onClick={() => setFeedback((prev) => (prev ? prev + "\n\n" : "") + s)}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                Exemple {i + 1}
              </button>
            ))}
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!feedback.trim() || isAnalyzing}
            className="gradient-primary text-primary-foreground border-0 hover:opacity-90"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Analyser
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-muted-foreground"
            >
              {loadingMessages[loadingStep]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* AI badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              Analyse générée par IA — résultats basés sur vos retours clients
            </div>

            {/* Summary + Sentiment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Résumé</h3>
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-card border border-border flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sentiment</h3>
                {(() => {
                  const cfg = sentimentConfig[result.sentiment];
                  return (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${cfg.className}`}>
                      <cfg.icon className="w-5 h-5" />
                      <span className="font-semibold">{cfg.label}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Patterns */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Patterns identifiés
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.patterns.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{p}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Feature Requests */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Demandes de features extraites
              </h3>
              <div className="space-y-3">
                {result.featureRequests.map((fr, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">{fr.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={fr.priority === "Critique" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {fr.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{fr.mentions} mentions</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pain Points */}
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Points de douleur
              </h3>
              <div className="space-y-2">
                {result.painPoints.map((pp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5"
                  >
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{pp}</span>
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
