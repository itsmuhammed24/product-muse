import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquareText, ListOrdered, FileText, ArrowUpRight, TrendingUp, Zap, BarChart3 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const stats = [
  { label: "Feedbacks analysés", value: "247", change: "+12%", positive: true },
  { label: "Features priorisées", value: "58", change: "+8%", positive: true },
  { label: "User Stories", value: "134", change: "+23%", positive: true },
  { label: "Heures gagnées", value: "32h", change: "ce mois", positive: true },
];

const features = [
  {
    to: "/feedback",
    icon: MessageSquareText,
    title: "Analyse de Feedback",
    description: "Identifiez les patterns et sentiments dans vos retours clients.",
    tag: "NLP",
  },
  {
    to: "/prioritization",
    icon: ListOrdered,
    title: "Priorisation",
    description: "Scorez vos features avec RICE et MoSCoW automatiquement.",
    tag: "Scoring",
  },
  {
    to: "/user-stories",
    icon: FileText,
    title: "User Stories",
    description: "Générez des stories structurées avec critères d'acceptation.",
    tag: "Génération",
  },
];

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const Dashboard = () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de votre assistant Product Owner."
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fade}
            initial="hidden"
            animate="show"
            className="bg-card rounded-xl p-4 shadow-card border border-border group hover:shadow-elevated transition-shadow duration-300"
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</span>
              <span className="text-[11px] font-medium text-accent">{stat.change}</span>
            </div>
            <p className="text-[28px] font-semibold text-foreground tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Section heading */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[22px] text-foreground">Outils</h2>
        <span className="text-[12px] text-muted-foreground">{features.length} modules disponibles</span>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {features.map((feature, i) => (
          <motion.div
            key={feature.to}
            custom={i + 4}
            variants={fade}
            initial="hidden"
            animate="show"
          >
            <Link
              to={feature.to}
              className="group block bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-all duration-300 hover:border-primary/20 h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
                  <feature.icon className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors duration-200" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-2 py-0.5 rounded bg-secondary">
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-[15px] font-medium text-foreground mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {feature.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>
              <div className="flex items-center gap-1 text-[12px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Ouvrir <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-foreground p-5 text-background"
      >
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[13px] font-medium mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              Workflow recommandé
            </p>
            <p className="text-[12px] text-background/60 leading-relaxed">
              Analysez vos feedbacks → Priorisez avec RICE → Générez vos user stories. 
              L'IA s'améliore à chaque itération en apprenant de vos choix de priorisation.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;
