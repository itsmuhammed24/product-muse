import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListOrdered, Plus, Trash2, Calculator, ArrowUpDown } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Framework = "rice" | "moscow";

interface Feature {
  id: string;
  name: string;
  // RICE
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  // MoSCoW
  moscow: "must" | "should" | "could" | "wont";
  riceScore?: number;
}

const defaultFeatures: Feature[] = [
  { id: "1", name: "Export PDF", reach: 500, impact: 3, confidence: 80, effort: 3, moscow: "should" },
  { id: "2", name: "Intégration Slack", reach: 300, impact: 2, confidence: 90, effort: 5, moscow: "could" },
  { id: "3", name: "Sauvegarde auto", reach: 800, impact: 3, confidence: 95, effort: 2, moscow: "must" },
  { id: "4", name: "Filtres avancés", reach: 200, impact: 1, confidence: 70, effort: 4, moscow: "could" },
  { id: "5", name: "Mode hors-ligne", reach: 100, impact: 2, confidence: 50, effort: 8, moscow: "wont" },
];

const moscowColors = {
  must: "bg-destructive/10 text-destructive border-destructive/20",
  should: "bg-warning/10 text-warning border-warning/20",
  could: "bg-info/10 text-info border-info/20",
  wont: "bg-muted text-muted-foreground border-border",
};

const moscowLabels = { must: "Must Have", should: "Should Have", could: "Could Have", wont: "Won't Have" };

const calcRice = (f: Feature) => (f.reach * f.impact * (f.confidence / 100)) / f.effort;

const Prioritization = () => {
  const [framework, setFramework] = useState<Framework>("rice");
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const [newName, setNewName] = useState("");

  const sortedFeatures = [...features]
    .map((f) => ({ ...f, riceScore: calcRice(f) }))
    .sort((a, b) => (framework === "rice" ? b.riceScore - a.riceScore : 0));

  // For MoSCoW, group by category
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

  return (
    <>
      <PageHeader
        title="Priorisation"
        description="Scorez et classez vos features avec les frameworks RICE et MoSCoW."
        icon={<ListOrdered className="w-5 h-5 text-primary-foreground" />}
      />

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <Select value={framework} onValueChange={(v) => setFramework(v as Framework)}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rice">Framework RICE</SelectItem>
            <SelectItem value="moscow">Framework MoSCoW</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la feature…"
            className="w-56 bg-card"
            onKeyDown={(e) => e.key === "Enter" && addFeature()}
          />
          <Button onClick={addFeature} disabled={!newName.trim()} className="gradient-primary text-primary-foreground border-0">
            <Plus className="w-4 h-4 mr-1" /> Ajouter
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {framework === "rice" ? (
          <motion.div
            key="rice"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* RICE Table */}
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_80px_80px_80px_100px_40px] gap-0 px-6 py-3 bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Feature</span>
                <span className="text-center">Reach</span>
                <span className="text-center">Impact</span>
                <span className="text-center">Confiance</span>
                <span className="text-center">Effort</span>
                <span className="text-center flex items-center justify-center gap-1">
                  <Calculator className="w-3 h-3" /> Score
                </span>
                <span />
              </div>
              {sortedFeatures.map((f, i) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-[1fr_80px_80px_80px_80px_100px_40px] gap-0 px-6 py-4 border-t border-border items-center hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium text-foreground text-sm">{f.name}</span>
                  </div>
                  <Input
                    type="number"
                    value={f.reach}
                    onChange={(e) => updateFeature(f.id, { reach: +e.target.value })}
                    className="h-8 text-center text-sm bg-background"
                  />
                  <Select value={f.impact.toString()} onValueChange={(v) => updateFeature(f.id, { impact: +v })}>
                    <SelectTrigger className="h-8 text-sm bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3].map((v) => (
                        <SelectItem key={v} value={v.toString()}>{v}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={f.confidence}
                    onChange={(e) => updateFeature(f.id, { confidence: Math.min(100, +e.target.value) })}
                    className="h-8 text-center text-sm bg-background"
                    max={100}
                  />
                  <Input
                    type="number"
                    value={f.effort}
                    onChange={(e) => updateFeature(f.id, { effort: Math.max(1, +e.target.value) })}
                    className="h-8 text-center text-sm bg-background"
                    min={1}
                  />
                  <div className="text-center">
                    <span className="text-lg font-bold text-primary">{f.riceScore?.toFixed(0)}</span>
                  </div>
                  <button onClick={() => removeFeature(f.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* RICE Explanation */}
            <div className="mt-6 p-5 rounded-xl bg-secondary/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Comment fonctionne RICE ?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Score = (Reach × Impact × Confidence) / Effort</strong><br />
                <strong>Reach</strong> : nombre d'utilisateurs impactés · <strong>Impact</strong> : 1 (faible) à 3 (fort) ·{" "}
                <strong>Confidence</strong> : % de certitude · <strong>Effort</strong> : personne-semaines estimées
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="moscow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {moscowOrder.map((cat) => {
              const items = features.filter((f) => f.moscow === cat);
              return (
                <div key={cat} className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
                  <div className="px-6 py-3 bg-secondary/30 border-b border-border flex items-center gap-2">
                    <Badge className={`${moscowColors[cat]} border text-xs`}>{moscowLabels[cat]}</Badge>
                    <span className="text-xs text-muted-foreground">({items.length} features)</span>
                  </div>
                  {items.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Aucune feature dans cette catégorie
                    </div>
                  ) : (
                    items.map((f) => (
                      <div key={f.id} className="px-6 py-4 border-t border-border flex items-center justify-between hover:bg-secondary/10 transition-colors">
                        <span className="font-medium text-foreground text-sm">{f.name}</span>
                        <div className="flex items-center gap-3">
                          <Select value={f.moscow} onValueChange={(v) => updateFeature(f.id, { moscow: v as Feature["moscow"] })}>
                            <SelectTrigger className="h-8 w-36 text-sm bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {moscowOrder.map((m) => (
                                <SelectItem key={m} value={m}>{moscowLabels[m]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <button onClick={() => removeFeature(f.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}

            <div className="p-5 rounded-xl bg-secondary/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Comment fonctionne MoSCoW ?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Must Have</strong> : indispensable · <strong>Should Have</strong> : important mais pas vital ·{" "}
                <strong>Could Have</strong> : bonus appréciable · <strong>Won't Have</strong> : reporté consciemment
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Prioritization;
