import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, Copy, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { generateStories, type UserStory } from "@/lib/po-agent";

const complexityColors: Record<string, string> = {
  XS: "bg-success/10 text-success",
  S: "bg-success/10 text-success",
  M: "bg-warning/10 text-warning",
  L: "bg-primary/10 text-primary",
  XL: "bg-destructive/10 text-destructive",
};

const loadingMessages = ["Analyse de la feature…", "Identification des personas…", "Rédaction des critères…", "Estimation de complexité…"];

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
    const interval = setInterval(() => setLoadingStep((s) => (s + 1) % loadingMessages.length), 1500);
    try {
      const result = await generateStories(featureDesc, persona);
      setStories(result);
      if (result.length > 0) setExpandedId(result[0].id);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
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
      <PageHeader title="User Stories" description="Décrivez une feature pour obtenir des user stories structurées." />

      {/* Input */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="col-span-3">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2 block">Description de la feature</label>
            <Textarea value={featureDesc} onChange={(e) => setFeatureDesc(e.target.value)} placeholder="Ex : Permettre aux utilisateurs d'exporter leur tableau de bord en PDF…" className="min-h-[100px] resize-none bg-background text-[13px]" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-2 block">Persona</label>
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger className="bg-background text-[12px]"><SelectValue /></SelectTrigger>
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
          <Button onClick={handleGenerate} disabled={!featureDesc.trim() || isGenerating} className="bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] h-9 px-4">
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5" />}
            Générer
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isGenerating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-3">
            <Wand2 className="w-5 h-5 text-primary-foreground animate-pulse" />
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={loadingStep} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-[13px] text-muted-foreground">
              {loadingMessages[loadingStep]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Stories */}
      <AnimatePresence>
        {stories.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] text-foreground">{stories.length} User Stories</h2>
              <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1"><Sparkles className="w-3 h-3" />Générées par IA</p>
            </div>

            {stories.map((story, i) => (
              <motion.div key={story.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-lg border border-border bg-card overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === story.id ? null : story.id)} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/10 transition-colors text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                    <p className="text-[12px] text-foreground truncate">
                      <span className="text-muted-foreground">En tant que</span> <span className="font-medium">{story.role}</span>, <span className="text-muted-foreground">je veux</span> <span className="font-medium">{story.action}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge className={`${complexityColors[story.complexity]} border-0 text-[10px]`}>{story.complexity}</Badge>
                    {expandedId === story.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === story.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-4 border-t border-border pt-3 space-y-3">
                        <div className="bg-secondary/30 rounded p-3">
                          <p className="text-[12px] text-foreground leading-relaxed">
                            <strong>En tant que</strong> {story.role},<br />
                            <strong>Je veux</strong> {story.action},<br />
                            <strong>Afin de</strong> {story.benefit}.
                          </p>
                        </div>
                        <div>
                          <h4 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-1.5">Critères d'acceptation</h4>
                          <ul className="space-y-1">
                            {story.acceptanceCriteria.map((c, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-[11px] text-foreground">
                                <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 rounded bg-muted/50">
                          <Badge className={`${complexityColors[story.complexity]} border-0 text-[10px] shrink-0`}>Complexité {story.complexity}</Badge>
                          <p className="text-[11px] text-muted-foreground">{story.complexityReason}</p>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" className="text-[11px] h-7" onClick={() => copyStory(story)}>
                            {copiedId === story.id ? <><Check className="w-3 h-3 mr-1" />Copié</> : <><Copy className="w-3 h-3 mr-1" />Copier</>}
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
