import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

const PageHeader = ({ title, description, icon }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8"
    >
      <h1 className="text-[32px] font-normal text-foreground leading-tight mb-1">{title}</h1>
      <p className="text-[14px] text-muted-foreground">{description}</p>
    </motion.div>
  );
};

export default PageHeader;
