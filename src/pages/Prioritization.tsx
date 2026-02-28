import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Sparkles, Loader2, Wand2 } from "lucide-react";
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
  must: "bg-destructive/10 text-destructive",
  should: "bg-warning/10 text-warning",
  could: "bg-info/10 text-info",
  wont: "bg-muted text-muted-foreground",
};
const moscowLabels = { must: "Must Have", should: "Should Have", could: "Could Have", wont: "Won't Have" };

const calcRice = (f: Feature) => (f.reach * f.impact * (f.confidence / 100)) / f.effort;

const Prioritization = () => {
  const [framework, setFramework] = useState<Framework>("rice");
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const [newName, setNewName] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const sortedFeatures = [...features].map((f) => ({ ...f, riceScore: calcRice(f) })).sort((a, b) => (framework === "rice" ? b.riceScore - a.riceScore : 0));
  const moscowOrder: Feature["moscow"][] = ["must", "should", "could", "wont"];

  const addFeature = () => {
    if (!newName.trim()) return;
    setFeatures([...features, { id: Date.now().toString(), name: newName, reach: 100, impact: 1, confidence: 50, effort: 3, moscow: "could" }]);
    setNewName("");
  };
  const removeFeature = (id: string) => setFeatures(features.filter((f) => f.id !== id));
  const updateFeature = (id: string, u: Partial<Feature>) => setFeatures(features.map((f) => (f.id === id ? { ...f, ...u } : f)));

  const handleAiPrioritize = async () => {
    if (features.length === 0) return;
    setIsAiLoading(true);
    try {
      const result = await prioritizeFeatures(features.map((f) => ({ name: f.name })));
      setFeatures(features.map((f) => {
        const ai = result.find((r) => r.name.toLowerCase() === f.name.toLowerCase());
        if (!ai) return f;
        return { ...f, reach: ai.reach, impact: ai.impact, confidence: ai.confidence, effort: ai.effort, moscow: ai.moscow, justification: ai.justification };
      }));
      toast({ title: "Priorisation terminée", description: "Scores mis à jour par l'IA." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Priorisation" description="Scorez et classez vos features avec RICE ou MoSCoW." />

      {/* Controls */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <Select value={framework} onValueChange={(v) => setFramework(v as Framework)}>
          <SelectTrigger className="w-40 bg-card text-[12px] h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rice">RICE</SelectItem>
            <SelectItem value="moscow">MoSCoW</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAiPrioritize} disabled={isAiLoading || features.length === 0} variant="outline" className="text-[12px] h-8 border-primary/20 text-primary hover:bg-primary/5">
          {isAiLoading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />}
          Prioriser avec l'IA
        </Button>
        <div className="flex-1" />
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nouvelle feature…" className="w-44 bg-card text-[12px] h-8" onKeyDown={(e) => e.key === "Enter" && addFeature()} />
        <Button onClick={addFeature} disabled={!newName.trim()} className="bg-primary text-primary-foreground h-8 text-[12px] px-3">
          <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {framework === "rice" ? (
          <motion.div key="rice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-[1fr_64px_64px_64px_64px_72px_32px] gap-0 px-4 py-2 bg-secondary/40 text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                <span>Feature</span><span className="text-center">Reach</span><span className="text-center">Impact</span><span className="text-center">Conf.</span><span className="text-center">Effort</span><span className="text-center">Score</span><span />
              </div>
              {sortedFeatures.map((f, i) => (
                <motion.div key={f.id} layout className="grid grid-cols-[1fr_64px_64px_64px_64px_72px_32px] gap-0 px-4 py-2.5 border-t border-border items-center hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <span className="text-[12px] font-medium text-foreground truncate block">{f.name}</span>
                      {f.justification && <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate"><Sparkles className="w-2.5 h-2.5 shrink-0" />{f.justification}</p>}
                    </div>
                  </div>
                  <Input type="number" value={f.reach} onChange={(e) => updateFeature(f.id, { reach: +e.target.value })} className="h-6 text-center text-[11px] bg-background px-0.5" />
                  <Select value={f.impact.toString()} onValueChange={(v) => updateFeature(f.id, { impact: +v })}>
                    <SelectTrigger className="h-6 text-[11px] bg-background px-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3].map((v) => <SelectItem key={v} value={v.toString()}>{v}x</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" value={f.confidence} onChange={(e) => updateFeature(f.id, { confidence: Math.min(100, +e.target.value) })} className="h-6 text-center text-[11px] bg-background px-0.5" max={100} />
                  <Input type="number" value={f.effort} onChange={(e) => updateFeature(f.id, { effort: Math.max(1, +e.target.value) })} className="h-6 text-center text-[11px] bg-background px-0.5" min={1} />
                  <div className="text-center"><span className="text-[15px] font-bold text-primary tabular-nums">{f.riceScore?.toFixed(0)}</span></div>
                  <button onClick={() => removeFeature(f.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors mx-auto"><Trash2 className="w-3.5 h-3.5" /></button>
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground"><strong className="text-foreground">RICE</strong> = (Reach × Impact × Confidence) / Effort</p>
          </motion.div>
        ) : (
          <motion.div key="moscow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {moscowOrder.map((cat) => {
              const items = features.filter((f) => f.moscow === cat);
              return (
                <div key={cat} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-center gap-2">
                    <Badge className={`${moscowColors[cat]} border-0 text-[10px]`}>{moscowLabels[cat]}</Badge>
                    <span className="text-[10px] text-muted-foreground">({items.length})</span>
                  </div>
                  {items.length === 0 ? (
                    <div className="px-4 py-5 text-center text-[11px] text-muted-foreground/40">Aucune feature</div>
                  ) : items.map((f) => (
                    <div key={f.id} className="px-4 py-2.5 border-t border-border flex items-center justify-between hover:bg-secondary/10 transition-colors">
                      <div className="min-w-0">
                        <span className="text-[12px] font-medium text-foreground">{f.name}</span>
                        {f.justification && <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 shrink-0" />{f.justification}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select value={f.moscow} onValueChange={(v) => updateFeature(f.id, { moscow: v as Feature["moscow"] })}>
                          <SelectTrigger className="h-6 w-28 text-[11px] bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>{moscowOrder.map((m) => <SelectItem key={m} value={m}>{moscowLabels[m]}</SelectItem>)}</SelectContent>
                        </Select>
                        <button onClick={() => removeFeature(f.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">MoSCoW</strong> — Must: indispensable · Should: important · Could: bonus · Won't: reporté</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Prioritization;
