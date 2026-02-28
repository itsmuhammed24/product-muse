import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-10"
    >
      <h1 className="text-[36px] text-foreground leading-[1.1] mb-2">{title}</h1>
      <p className="text-[14px] text-muted-foreground max-w-lg">{description}</p>
    </motion.div>
  );
};

export default PageHeader;
