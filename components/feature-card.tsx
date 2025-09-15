"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 h-full">
        <CardHeader>
          <motion.div 
            className={`w-12 h-12 ${gradient} rounded-lg flex items-center justify-center mb-4`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <CardTitle className="text-white text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-300">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
