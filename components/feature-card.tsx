"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  delay = 0 
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -5 }}
      aria-label={title}
    >
      <div className="rounded-xl p-[1px] bg-[linear-gradient(135deg,theme(colors.violet.500),theme(colors.pink.500),theme(colors.cyan.500))]">
        <Card className="glass-effect hover-lift h-full rounded-[11px]">
          <CardHeader>
            <motion.div 
              className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center mb-4`}
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-6 h-6 text-white" aria-hidden="true" />
            </motion.div>
            <CardTitle className="text-white text-xl">{title}</CardTitle>
            <CardDescription className="text-gray-300">
              {description}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </motion.div>
  );
}
