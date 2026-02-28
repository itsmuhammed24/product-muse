import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListOrdered, Plus, Trash2, Calculator, Sparkles, Loader2, Wand2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { prioritizeFeatures } from "@/lib/po-agent";

type Framework = "rice" | "moscow";

interface Feature {
  id: string;
  name: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  moscow: "must" | "should" | "could" | "wont";
  riceScore?: number;
  justification?: string;
}

const defaultFeatures: Feature[] = [
  { id: "1", name: "Export PDF", reach: 500, impact: 3, confidence: 80, effort: 3, moscow: "should" },
  { id: "2", name: "Intégration Slack", reach: 300, impact: 2, confidence: 90, effort: 5, moscow: "could" },
  { id: "3", name: "Sauvegarde auto", reach: 800, impact: 3, confidence: 95, effort: 2, moscow: "must" },
  { id: "4", name: "Filtres avancés", reach: 200, impact: 1, confidence: 70, effort: 4, moscow: "could" },
  { id: "5", name: "Mode hors-ligne", reach: 100, impact: 2, confidence: 50, effort: 8, moscow: "wont" },
];

const moscowColors = {
  must: "bg-destructive/8 text-destructive ring-1 ring-destructive/15",
  should: "bg-warning/8 text-warning ring-1 ring-warning/15",
  could: "bg-info/8 text-info ring-1 ring-info/15",
  wont: "bg-muted text-muted-foreground ring-1 ring-border",
};

const moscowLabels = { must: "Must Have", should: "Should Have", could: "Could Have", wont: "Won't Have" };

const calcRice = (f: Feature) => (f.reach * f.impact * (f.confidence / 100)) / f.effort;

const Prioritization = () => {
  const [framework, setFramework] = useState<Framework>("rice");
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const [newName, setNewName] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const sortedFeatures = [...features]
    .map((f) => ({ ...f, riceScore: calcRice(f) }))
    .sort((a, b) => (framework === "rice" ? b.riceScore - a.riceScore : 0));

  const moscowOrder: Feature["moscow"][] = ["must", "should", "could", "wont"];

  const addFeature = () => {
    if (!newName.trim()) return;
    setFeatures([
      ...features,
      { id: Date.now().toString(), name: newName, reach: 100, impact: 1, confidence: 50, effort: 3, moscow: "could" },
    ]);
    setNewName("");
  };

  const removeFeature = (id: string) => setFeatures(features.filter((f) => f.id !== id));

  const updateFeature = (id: string, updates: Partial<Feature>) =>
    setFeatures(features.map((f) => (f.id === id ? { ...f, ...updates } : f)));

  const handleAiPrioritize = async () => {
    if (features.length === 0) return;
    setIsAiLoading(true);
    try {
      const result = await prioritizeFeatures(features.map((f) => ({ name: f.name })));
      setFeatures(
        features.map((f) => {
          const ai = result.find((r) => r.name.toLowerCase() === f.name.toLowerCase());
          if (!ai) return f;
          return { ...f, reach: ai.reach, impact: ai.impact, confidence: ai.confidence, effort: ai.effort, moscow: ai.moscow, justification: ai.justification };
        })
      );
      toast({ title: "Priorisation terminée", description: "Scores mis à jour par l'IA." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Impossible de prioriser", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Priorisation"
        description="Scorez et classez vos features avec RICE ou MoSCoW."
      />

      {/* Controls */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <Select value={framework} onValueChange={(v) => setFramework(v as Framework)}>
          <SelectTrigger className="w-44 bg-card text-[13px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rice">Framework RICE</SelectItem>
            <SelectItem value="moscow">Framework MoSCoW</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleAiPrioritize}
          disabled={isAiLoading || features.length === 0}
          variant="outline"
          className="text-[13px] h-9 border-primary/20 text-primary hover:bg-primary/5"
        >
          {isAiLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5" />}
          Prioriser avec l'IA
        </Button>

        <div className="flex-1" />
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la feature…"
            className="w-48 bg-card text-[13px] h-9"
            onKeyDown={(e) => e.key === "Enter" && addFeature()}
          />
          <Button onClick={addFeature} disabled={!newName.trim()} className="gradient-primary text-primary-foreground border-0 text-[13px] h-9 px-3">
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {framework === "rice" ? (
          <motion.div key="rice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_72px_72px_72px_72px_80px_36px] gap-0 px-5 py-2.5 bg-secondary/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <span>Feature</span>
                <span className="text-center">Reach</span>
                <span className="text-center">Impact</span>
                <span className="text-center">Conf.</span>
                <span className="text-center">Effort</span>
                <span className="text-center">Score</span>
                <span />
              </div>
              {sortedFeatures.map((f, i) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[1fr_72px_72px_72px_72px_80px_36px] gap-0 px-5 py-3 border-t border-border items-center hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md gradient-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-foreground truncate block">{f.name}</span>
                      {f.justification && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                          <Sparkles className="w-2.5 h-2.5 shrink-0" /> {f.justification}
                        </p>
                      )}
                    </div>
                  </div>
                  <Input type="number" value={f.reach} onChange={(e) => updateFeature(f.id, { reach: +e.target.value })} className="h-7 text-center text-[12px] bg-background px-1" />
                  <Select value={f.impact.toString()} onValueChange={(v) => updateFeature(f.id, { impact: +v })}>
                    <SelectTrigger className="h-7 text-[12px] bg-background px-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3].map((v) => <SelectItem key={v} value={v.toString()}>{v}x</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" value={f.confidence} onChange={(e) => updateFeature(f.id, { confidence: Math.min(100, +e.target.value) })} className="h-7 text-center text-[12px] bg-background px-1" max={100} />
                  <Input type="number" value={f.effort} onChange={(e) => updateFeature(f.id, { effort: Math.max(1, +e.target.value) })} className="h-7 text-center text-[12px] bg-background px-1" min={1} />
                  <div className="text-center">
                    <span className="text-[16px] font-bold text-primary tabular-nums">{f.riceScore?.toFixed(0)}</span>
                  </div>
                  <button onClick={() => removeFeature(f.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors mx-auto">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl bg-secondary/40 border border-border">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">RICE</strong> = (Reach × Impact × Confidence) / Effort — 
                Reach: utilisateurs impactés · Impact: 1–3 · Confidence: % · Effort: personne-semaines
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="moscow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
            {moscowOrder.map((cat) => {
              const items = features.filter((f) => f.moscow === cat);
              return (
                <div key={cat} className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
                  <div className="px-5 py-2.5 bg-secondary/30 border-b border-border flex items-center gap-2">
                    <Badge className={`${moscowColors[cat]} border-0 text-[10px]`}>{moscowLabels[cat]}</Badge>
                    <span className="text-[11px] text-muted-foreground">({items.length})</span>
                  </div>
                  {items.length === 0 ? (
                    <div className="px-5 py-6 text-center text-[12px] text-muted-foreground/50">Aucune feature</div>
                  ) : (
                    items.map((f) => (
                      <div key={f.id} className="px-5 py-3 border-t border-border flex items-center justify-between hover:bg-secondary/10 transition-colors">
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium text-foreground">{f.name}</span>
                          {f.justification && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 shrink-0" /> {f.justification}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <Select value={f.moscow} onValueChange={(v) => updateFeature(f.id, { moscow: v as Feature["moscow"] })}>
                            <SelectTrigger className="h-7 w-32 text-[12px] bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>{moscowOrder.map((m) => <SelectItem key={m} value={m}>{moscowLabels[m]}</SelectItem>)}</SelectContent>
                          </Select>
                          <button onClick={() => removeFeature(f.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}

            <div className="p-4 rounded-xl bg-secondary/40 border border-border">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">MoSCoW</strong> — 
                Must: indispensable · Should: important · Could: bonus · Won't: reporté
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Prioritization;
