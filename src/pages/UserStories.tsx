import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Wand2, Loader2, Copy, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { generateStories, type UserStory } from "@/lib/po-agent";

const complexityColors: Record<string, string> = {
  XS: "bg-success/10 text-success border-success/20",
  S: "bg-success/10 text-success border-success/20",
  M: "bg-warning/10 text-warning border-warning/20",
  L: "bg-accent/10 text-accent border-accent/20",
  XL: "bg-destructive/10 text-destructive border-destructive/20",
};

const loadingMessages = [
  "Analyse de la feature…",
  "Identification des personas…",
  "Rédaction des critères d'acceptation…",
  "Estimation de la complexité…",
];

const UserStories = () => {
  const [featureDesc, setFeatureDesc] = useState("");
  const [persona, setPersona] = useState("utilisateur");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleGenerate = async () => {
    if (!featureDesc.trim()) return;
    setIsGenerating(true);
    setStories([]);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % loadingMessages.length);
    }, 1500);

    try {
      const result = await generateStories(featureDesc, persona);
      setStories(result);
      if (result.length > 0) setExpandedId(result[0].id);
    } catch (e: any) {
      toast({
        title: "Erreur de génération",
        description: e.message || "Impossible de générer les user stories",
        variant: "destructive",
      });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const copyStory = (story: UserStory) => {
    const text = `**En tant que** ${story.role}\n**Je veux** ${story.action}\n**Afin de** ${story.benefit}\n\n**Critères d'acceptation :**\n${story.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}\n\n**Complexité :** ${story.complexity} — ${story.complexityReason}`;
    navigator.clipboard.writeText(text);
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <PageHeader
        title="Générateur de User Stories"
        description="Décrivez une feature et obtenez des user stories structurées avec critères d'acceptation."
        icon={<FileText className="w-5 h-5 text-primary-foreground" />}
      />

      {/* Input */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-3">
            <label className="text-sm font-medium text-foreground mb-2 block">Description de la feature</label>
            <Textarea
              value={featureDesc}
              onChange={(e) => setFeatureDesc(e.target.value)}
              placeholder="Ex : Permettre aux utilisateurs d'exporter leur tableau de bord en PDF et de recevoir des notifications Slack…"
              className="min-h-[100px] resize-none bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Persona principal</label>
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utilisateur">Utilisateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="chef_projet">Chef de projet</SelectItem>
                <SelectItem value="developpeur">Développeur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={!featureDesc.trim() || isGenerating}
            className="gradient-warm text-primary-foreground border-0 hover:opacity-90"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Générer les User Stories
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mb-4">
            <Wand2 className="w-8 h-8 text-primary-foreground animate-pulse" />
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

      {/* Stories */}
      <AnimatePresence>
        {stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {stories.length} User Stories générées
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Générées par IA
              </div>
            </div>

            {stories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === story.id ? null : story.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg gradient-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <div className="text-left">
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">En tant que</span>{" "}
                        <span className="font-semibold">{story.role}</span>,{" "}
                        <span className="text-muted-foreground">je veux</span>{" "}
                        <span className="font-semibold">{story.action}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${complexityColors[story.complexity]} border text-xs`}>
                      {story.complexity}
                    </Badge>
                    {expandedId === story.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === story.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 border-t border-border pt-4 space-y-4">
                        <div className="bg-secondary/30 rounded-lg p-4">
                          <p className="text-sm text-foreground leading-relaxed">
                            <strong>En tant que</strong> {story.role},<br />
                            <strong>Je veux</strong> {story.action},<br />
                            <strong>Afin de</strong> {story.benefit}.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Critères d'acceptation
                          </h4>
                          <ul className="space-y-2">
                            {story.acceptanceCriteria.map((c, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                                <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Badge className={`${complexityColors[story.complexity]} border text-xs shrink-0`}>
                            Complexité {story.complexity}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{story.complexityReason}</p>
                        </div>

                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => copyStory(story)}>
                            {copiedId === story.id ? (
                              <><Check className="w-4 h-4 mr-1" /> Copié !</>
                            ) : (
                              <><Copy className="w-4 h-4 mr-1" /> Copier</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserStories;
