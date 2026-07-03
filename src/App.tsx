/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { WeddingConfig } from "./types";
import InvitationCard from "./components/InvitationCard";
import MusicPlayer from "./components/MusicPlayer";
import AdminPanel from "./components/AdminPanel";
import { Loader2, Heart } from "lucide-react";

const defaultWeddingConfig: WeddingConfig = {
  names: "Richard y Oriana",
  date: "2026-10-17T18:00:00",
  parents: "Obdulio Camargo y Lucía de Camargo",
  groomParents: "Obdulio Camargo y Lucía de Camargo",
  brideParents: "Padres de la Novia (Ejemplo)",
  googleMapsUrl: "https://maps.google.com/?q=Hacienda+El+Establo,+Caracas,+Venezuela",
  whatsappNumber: "+584262784483",
  whatsappMessage: "¡Hola Richard y Oriana! Confirmo con mucha alegría mi asistencia a su boda.",
  musicUrl: "",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
  image2: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
  image3: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200",
  image4: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1200",
  eventDetails: "Nos complace anunciar nuestro matrimonio y queremos compartir contigo este momento.",
  placeName: "Hacienda El Establo",
  parentsIntro: "Con la bendición de Dios y de nuestros queridos padres, tenemos el honor de invitarles a celebrar nuestra unión matrimonial.",
  middleText: "Unidos por el amor, comenzamos un nuevo camino juntos. Nos encantaría que nos acompañes en este día tan especial."
};

export default function App() {
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  useEffect(() => {
    // Real-time listener for the wedding configuration
    const configDocRef = doc(db, "wedding_config", "main");
    
    const unsubscribe = onSnapshot(configDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as WeddingConfig;
        if (data.musicUrl === "db://chunked" && data.musicChunksCount) {
          try {
            const chunkPromises = [];
            for (let i = 0; i < data.musicChunksCount; i++) {
              const chunkRef = doc(db, "wedding_config", `music_chunk_${i}`);
              chunkPromises.push(getDoc(chunkRef));
            }
            const chunkSnaps = await Promise.all(chunkPromises);
            const chunksData = chunkSnaps.map(snap => {
              if (snap.exists()) {
                return snap.data().data || "";
              }
              return "";
            });
            const fullBase64 = chunksData.join("");
            setConfig({
              ...data,
              musicUrl: fullBase64
            });
          } catch (e) {
            console.error("Error loading chunked music:", e);
            setConfig(data);
          }
        } else {
          setConfig(data);
        }
      } else {
        // Fallback to default config if not initialized in Firestore yet
        setConfig(defaultWeddingConfig);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore onSnapshot error (using default config fallback):", error);
      // Fallback locally if Firebase gets blocked or disconnected
      setConfig(defaultWeddingConfig);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleConfigChangeInAdmin = (newConfig: WeddingConfig) => {
    setConfig(newConfig);
  };

  if (loading) {
    return (
      <div id="app-loading-container" className="min-h-screen bg-cream-50 flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 text-sage-500 fill-sage-100 animate-pulse mx-auto" />
          <p className="text-sage-600 font-serif text-lg tracking-wide font-medium">Cargando Invitación...</p>
          <Loader2 className="w-6 h-6 text-sage-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Double check that we have config
  const activeConfig = config || defaultWeddingConfig;

  return (
    <div id="wedding-invitation-app" className="relative">
      {/* Background audio player (floating control) */}
      <MusicPlayer url={activeConfig.musicUrl} />

      {/* Main interactive guest card invitation */}
      <InvitationCard 
        config={activeConfig} 
        onOpenAdmin={() => setIsAdminOpen(true)} 
      />

      {/* Admin Panel editor modal */}
      {isAdminOpen && (
        <AdminPanel 
          currentConfig={activeConfig}
          onConfigChange={handleConfigChangeInAdmin}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
