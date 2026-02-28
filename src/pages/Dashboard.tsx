import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LayoutDashboard, MessageSquareText, ListOrdered, FileText, ArrowRight, TrendingUp, Users, Zap } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const stats = [
  { label: "Feedbacks analysés", value: "247", trend: "+12%", icon: MessageSquareText },
  { label: "Features priorisées", value: "58", trend: "+8%", icon: ListOrdered },
  { label: "User Stories générées", value: "134", trend: "+23%", icon: FileText },
  { label: "Temps gagné", value: "32h", trend: "ce mois", icon: Zap },
];

const features = [
  {
    to: "/feedback",
    icon: MessageSquareText,
    title: "Analyse de Feedback",
    description: "Analysez les retours clients, identifiez les patterns et extrayez les demandes de features.",
    color: "gradient-primary",
  },
  {
    to: "/prioritization",
    icon: ListOrdered,
    title: "Priorisation",
    description: "Scorez et priorisez vos features avec les frameworks MoSCoW, RICE et plus encore.",
    color: "gradient-warm",
  },
  {
    to: "/user-stories",
    icon: FileText,
    title: "User Stories",
    description: "Générez des user stories structurées avec critères d'acceptation et estimation de complexité.",
    color: "gradient-accent",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de votre assistant Product Owner."
        icon={<LayoutDashboard className="w-5 h-5 text-primary-foreground" />}
      />

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium text-accent px-2 py-0.5 rounded-full bg-accent/10">
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Feature Cards */}
      <h2 className="text-xl font-bold text-foreground mb-4">Outils disponibles</h2>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {features.map((feature) => (
          <motion.div key={feature.to} variants={item}>
            <Link
              to={feature.to}
              className="group block bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-200">
                Commencer <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 rounded-xl gradient-primary p-6 text-primary-foreground"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Astuce du jour
            </h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Commencez par analyser vos feedbacks clients pour identifier les patterns récurrents, 
              puis utilisez la priorisation RICE pour scorer objectivement vos features avant de générer vos user stories.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;
