"use client";

import { motion } from "framer-motion";
import { Upload, BookOpen, Wand2 } from "lucide-react";
import { ImmersiveBackground } from "./components/layout/ImmersiveBackground";
import { MagicCard } from "./components/ui/MagicCard";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <ImmersiveBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 max-w-4xl z-10"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 drop-shadow-sm"
          animate={{ backgroundPosition: ["0%", "100%"] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        >
          Vive tus Lecturas
        </motion.h1>

        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Convierte documentos aburridos en historias vivas.
          <br />
          Aprende idiomas sumergiéndote en el contexto.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
          <MagicCard className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Sube tu PDF</h3>
            <p className="text-sm text-muted-foreground">Compatible con cualquier libro o documento.</p>
          </MagicCard>

          <MagicCard className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold">Lectura Inmersiva</h3>
            <p className="text-sm text-muted-foreground">Olvídate del scroll aburrido. Vive la historia.</p>
          </MagicCard>

          <MagicCard className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-pink-500/10 rounded-full">
              <Wand2 className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold">Aprendizaje Mágico</h3>
            <p className="text-sm text-muted-foreground">Toca cualquier palabra para entenderla al instante.</p>
          </MagicCard>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-12 inline-block"
        >
          <Link
            href="/reader"
            className="px-8 py-4 bg-primary text-white rounded-full text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Comenzar Aventura
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
