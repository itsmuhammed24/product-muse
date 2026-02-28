import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquareText, ListOrdered, FileText, ArrowUpRight, Zap } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const stats = [
  { label: "Feedbacks analysés", value: "247", sub: "+12% ce mois" },
  { label: "Features priorisées", value: "58", sub: "+8 cette semaine" },
  { label: "User Stories générées", value: "134", sub: "+23% vs. mois dernier" },
  { label: "Heures gagnées", value: "32h", sub: "estimation ce mois" },
];

const tools = [
  {
    to: "/feedback",
    icon: MessageSquareText,
    title: "Analyse de Feedback",
    desc: "Identifiez les patterns, le sentiment et les demandes de features dans vos retours clients.",
  },
  {
    to: "/prioritization",
    icon: ListOrdered,
    title: "Priorisation",
    desc: "Scorez automatiquement vos features avec les frameworks RICE et MoSCoW.",
  },
  {
    to: "/user-stories",
    icon: FileText,
    title: "User Stories",
    desc: "Générez des stories structurées avec critères d'acceptation et estimation.",
  },
];

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" as const },
  }),
};

const Dashboard = () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de votre assistant Product Owner propulsé par l'IA."
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={fade}
            initial="hidden"
            animate="show"
            className="p-4 rounded-lg border border-border bg-card hover:shadow-card transition-shadow duration-200"
          >
            <p
              className="text-[32px] font-semibold text-foreground leading-none tracking-tight mb-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {s.value}
            </p>
            <p className="text-[12px] text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-primary mt-1.5 font-medium">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tools heading */}
      <div className="mb-4">
        <h2 className="text-[24px] text-foreground">Outils</h2>
      </div>

      {/* Tools */}
      <div className="space-y-2 mb-12">
        {tools.map((t, i) => (
          <motion.div
            key={t.to}
            custom={i + 4}
            variants={fade}
            initial="hidden"
            animate="show"
          >
            <Link
              to={t.to}
              className="group flex items-center gap-5 p-4 rounded-lg border border-border bg-card hover:border-primary/20 hover:shadow-card transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-md bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                <t.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-[14px] font-medium text-foreground mb-0.5"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {t.title}
                </h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-start gap-3 p-4 rounded-lg bg-primary text-primary-foreground"
      >
        <Zap className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
        <div>
          <p className="text-[12px] font-medium mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
            Workflow recommandé
          </p>
          <p className="text-[11px] opacity-70 leading-relaxed">
            Feedback → Priorisation RICE → User Stories. L'IA affine ses recommandations à chaque itération.
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;
