import React, { useState, useEffect } from "react";
import { 
  db, 
  auth, 
  googleProvider 
} from "../firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import { WeddingConfig } from "../types";
import { 
  Save, 
  LogOut, 
  Settings, 
  Lock, 
  Key, 
  Loader2, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Mail
} from "lucide-react";

interface AdminPanelProps {
  currentConfig: WeddingConfig;
  onConfigChange: (newConfig: WeddingConfig) => void;
  onClose: () => void;
}

export default function AdminPanel({ currentConfig, onConfigChange, onClose }: AdminPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingText, setSavingText] = useState<string>("Guardando...");
  const [isNewAudioUploaded, setIsNewAudioUploaded] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Simple key validation fallback
  const [passcode, setPasscode] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isPasscodeAdmin, setIsPasscodeAdmin] = useState<boolean>(false);

  // Email/Password login states
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [activeAuthTab, setActiveAuthTab] = useState<"email" | "google" | "passcode">("email");

  // Form states
  const [formData, setFormData] = useState<WeddingConfig>({ 
    ...currentConfig,
    groomParents: currentConfig.groomParents || "",
    brideParents: currentConfig.brideParents || "",
    parentsIntro: currentConfig.parentsIntro || "",
    middleText: currentConfig.middleText || "",
    image2: currentConfig.image2 || "",
    image3: currentConfig.image3 || "",
    image4: currentConfig.image4 || "",
  });

  const ADMIN_EMAIL = "richard29cal@gmail.com";
  // Fallback passcode that always works
  const MASTER_PASSCODE = "OrianaYRichard2026";

  useEffect(() => {
    // Keep form data synced with current config on load
    setFormData({ 
      ...currentConfig,
      groomParents: currentConfig.groomParents || "",
      brideParents: currentConfig.brideParents || "",
      parentsIntro: currentConfig.parentsIntro || "",
      middleText: currentConfig.middleText || "",
      image2: currentConfig.image2 || "",
      image3: currentConfig.image3 || "",
      image4: currentConfig.image4 || "",
    });
  }, [currentConfig]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setUser(firebaseUser);
          setIsAdmin(true);
          setErrorMsg(null);
        } else {
          // Immediately sign out unauthorized users so they don't hold a valid client session
          setIsAdmin(false);
          setUser(null);
          setErrorMsg(`Acceso denegado. El correo ${firebaseUser.email} no está autorizado como administrador.`);
          try {
            await signOut(auth);
          } catch (err) {
            console.error("Error signing out unauthorized user:", err);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    // Explicit email restriction check BEFORE calling Firebase Auth
    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      setErrorMsg(`Acceso denegado. El correo ingresado (${email}) no está autorizado como administrador.`);
      return;
    }
    
    if (!password) {
      setErrorMsg("Por favor, introduce tu contraseña.");
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      console.error("Email login error:", error);
      let readableError = "Error al iniciar sesión con correo. Verifica tus credenciales.";
      
      const isUserNotFound = 
        error.code === "auth/user-not-found" || 
        error.code === "auth/wrong-password" || 
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-login-credentials";

      if (isUserNotFound) {
        // Since email is confirmed to be the ADMIN_EMAIL, let's auto-register them if account doesn't exist
        try {
          setErrorMsg("Creando tu cuenta de administrador por primera vez con esta contraseña...");
          await createUserWithEmailAndPassword(auth, email.trim(), password);
          return; // onAuthStateChanged will handle the state update
        } catch (signUpError: any) {
          console.error("Auto registration error:", signUpError);
          if (signUpError.code === "auth/email-already-in-use") {
            readableError = "Contraseña incorrecta para esta cuenta de correo. Por favor, verifícala.";
          } else {
            readableError = `No se pudo crear el acceso automático: ${signUpError.message}`;
          }
        }
      } else if (error.code === "auth/invalid-email") {
        readableError = "El formato de correo electrónico ingresado es inválido.";
      } else if (error.code === "auth/operation-not-allowed") {
        readableError = "El método de inicio de sesión por correo y contraseña no está habilitado en Firebase. Por favor, habilítalo en la consola de Firebase Authentication.";
      } else {
        readableError = `Error: ${error.message}`;
      }
      setErrorMsg(readableError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      
      // Explicit email restriction check AFTER popup returns
      if (!userEmail || userEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setIsAdmin(false);
        setUser(null);
        setErrorMsg(`Acceso denegado. La cuenta de Google (${userEmail || "desconocida"}) no está autorizada como administrador.`);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      setErrorMsg("Error al iniciar sesión con Google. Inténtalo de nuevo o usa la clave de acceso.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    if (passcode.trim() === MASTER_PASSCODE) {
      setIsPasscodeAdmin(true);
      setErrorMsg(null);
    } else {
      setPasscodeError("Clave de acceso incorrecta. Inténtalo de nuevo.");
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setIsPasscodeAdmin(false);
      setIsAdmin(false);
      setPasscode("");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);
    setSavingText("Guardando...");

    try {
      let finalConfig = { ...formData };

      // If a new audio file has been selected, let's chunk it!
      if (isNewAudioUploaded && formData.musicUrl.startsWith("data:audio")) {
        const fullAudioStr = formData.musicUrl;
        const chunkSize = 350000; // 350KB chunk size is extremely safe for Firestore and prevents connection issues
        const chunks: string[] = [];
        
        for (let i = 0; i < fullAudioStr.length; i += chunkSize) {
          chunks.push(fullAudioStr.substring(i, i + chunkSize));
        }

        // Upload chunks sequentially to avoid overloading the Firestore connection/payload rules
        for (let index = 0; index < chunks.length; index++) {
          setSavingText(`Guardando... Subiendo canción parte ${index + 1} de ${chunks.length}`);
          const chunkRef = doc(db, "wedding_config", `music_chunk_${index}`);
          await setDoc(chunkRef, { data: chunks[index] });
        }

        // Update the main document pointers
        finalConfig.musicUrl = "db://chunked";
        finalConfig.musicChunksCount = chunks.length;
      } else if (!isNewAudioUploaded && formData.musicUrl.startsWith("data:audio")) {
        // If the music is already saved in the database as chunks and was loaded as base64 in the background,
        // we must NOT write the massive base64 string back to the "main" document, as it exceeds the 1MB Firestore limit.
        // Instead, we keep the "db://chunked" placeholder and preserve the chunks count.
        finalConfig.musicUrl = "db://chunked";
        finalConfig.musicChunksCount = currentConfig.musicChunksCount || formData.musicChunksCount || 0;
      }

      // Save to Firestore
      const configDocRef = doc(db, "wedding_config", "main");
      await setDoc(configDocRef, finalConfig);
      
      // Update local state in parent with the actual base64 string for immediate playback
      onConfigChange({
        ...finalConfig,
        musicUrl: formData.musicUrl
      });
      setSaveSuccess(true);
      setIsNewAudioUploaded(false); // Reset upload flag
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error saving document:", error);
      // If we used the passcode login but Firestore rules blocked it, let's explain
      if (error.code === 'permission-denied') {
        setErrorMsg("Error de permisos en Firebase. Para guardar cambios en la base de datos de la nube, debes iniciar sesión con tu cuenta de Google 'richard29cal@gmail.com'.");
      } else {
        setErrorMsg("Error al guardar en Firebase: " + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const isAuthorized = isAdmin || isPasscodeAdmin;

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div id="admin-panel-card" className="bg-cream-50 w-full max-w-lg rounded-3xl border border-sage-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-sage-600 text-white p-6 flex justify-between items-center border-b border-sage-500">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 animate-spin-slow" />
            <h2 className="font-serif text-xl tracking-wide font-medium">Panel de Edición</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/15 px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 transition-all focus:outline-none"
          >
            Volver a Invitación
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-sage-600 animate-spin" />
              <p className="text-sage-600 text-sm mt-3 font-medium">Cargando...</p>
            </div>
          ) : !isAuthorized ? (
            /* Authentication Screen */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-5 h-5 text-sage-600" />
                </div>
                <h3 className="font-serif text-lg font-medium text-sage-800">Acceso de Administrador</h3>
                <p className="text-xs text-sage-500 mt-1">
                  Ingresa con tu correo administrativo, cuenta de Google o la clave de acceso de emergencia.
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-2xl flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Tab Selector */}
              <div className="flex bg-sage-100/50 p-1 rounded-2xl border border-sage-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAuthTab("email");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all focus:outline-none cursor-pointer ${
                    activeAuthTab === "email"
                      ? "bg-white text-sage-800 shadow-sm font-semibold"
                      : "text-sage-600 hover:text-sage-800"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Correo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAuthTab("google");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all focus:outline-none cursor-pointer ${
                    activeAuthTab === "google"
                      ? "bg-white text-sage-800 shadow-sm font-semibold"
                      : "text-sage-600 hover:text-sage-800"
                  }`}
                >
                  <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAuthTab("passcode");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all focus:outline-none cursor-pointer ${
                    activeAuthTab === "passcode"
                      ? "bg-white text-sage-800 shadow-sm font-semibold"
                      : "text-sage-600 hover:text-sage-800"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Clave
                </button>
              </div>

              {/* Tab Content: Email */}
              {activeAuthTab === "email" && (
                <form onSubmit={handleEmailLogin} className="space-y-4 border border-sage-200/60 rounded-2xl p-5 bg-white/60">
                  <span className="text-[10px] font-semibold text-sage-500 uppercase tracking-widest block mb-1 text-center">Acceso Directo con Correo</span>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-sage-600 uppercase tracking-wider mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Ej: richard29cal@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-sage-200 text-sm rounded-full px-4 py-2.5 text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-sage-600 uppercase tracking-wider mb-1">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-sage-200 text-sm rounded-full px-4 py-2.5 text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-2 bg-sage-600 hover:bg-sage-700 text-white rounded-full py-3 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer focus:outline-none"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Iniciar Sesión con Correo
                  </button>
                  <p className="text-[10px] text-sage-400 text-center mt-1">
                    Nota: Asegúrate de habilitar el proveedor "Correo electrónico/contraseña" en tu consola de Firebase Authentication.
                  </p>
                </form>
              )}

              {/* Tab Content: Google */}
              {activeAuthTab === "google" && (
                <div className="border border-sage-200/60 rounded-2xl p-5 bg-white/60 text-center">
                  <span className="text-[10px] font-semibold text-sage-500 uppercase tracking-widest block mb-2">Método Recomendado (Google)</span>
                  <p className="text-xs text-sage-600 mb-4 max-w-xs mx-auto">
                    Permite sincronizar y guardar directamente en la base de datos con tu cuenta registrada <strong>{ADMIN_EMAIL}</strong>.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none font-medium rounded-full text-xs px-5 py-3 text-center shadow-sm transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                  </button>
                </div>
              )}

              {/* Tab Content: Passcode */}
              {activeAuthTab === "passcode" && (
                <div className="border border-sage-200/60 rounded-2xl p-5 bg-white/60">
                  <span className="text-[10px] font-semibold text-sage-500 uppercase tracking-widest block mb-2 text-center">Clave de Emergencia (Sin Base de Datos)</span>
                  <form onSubmit={handlePasscodeLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-2 text-center">
                        Contraseña Administrativa
                      </label>
                      <input
                        type="password"
                        placeholder="Introduce la contraseña"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full bg-white border border-sage-200 text-sm rounded-full px-5 py-3 text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30 text-center font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-sage-600 hover:bg-sage-700 text-white rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer focus:outline-none"
                    >
                      <Key className="w-4 h-4" />
                      Ingresar al Panel
                    </button>
                  </form>
                  {passcodeError && (
                    <p className="text-xs text-red-600 mt-3 text-center font-medium">{passcodeError}</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-sage-100 text-center">
                    <p className="text-[11px] text-sage-400">
                      Contraseña actual: <strong className="text-sage-600 font-mono">{MASTER_PASSCODE}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Editing Form */
            <form onSubmit={handleSubmit} className="space-y-4 pb-6">
              
              {/* Authenticated Header Status */}
              <div className="bg-sage-100/70 border border-sage-200/60 px-4 py-2.5 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                  <div className="text-xs">
                    <span className="text-sage-500">Sesión activa:</span>{" "}
                    <strong className="text-sage-800">
                      {user ? user.email : "Clave de Emergencia"}
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sage-600 hover:text-red-600 hover:bg-white border border-sage-200/50 bg-white/50 p-1.5 rounded-full transition-all focus:outline-none"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-2xl flex items-start gap-2 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-2xl flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>¡Cambios guardados exitosamente en Firebase!</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Couple Names */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    Nombres de la Pareja
                  </label>
                  <input
                    type="text"
                    name="names"
                    value={formData.names}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                 {/* Text Intro before Parents */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    Texto de Introducción para la Sección de Padres
                  </label>
                  <textarea
                    name="parentsIntro"
                    value={formData.parentsIntro || ""}
                    onChange={handleInputChange}
                    placeholder="Escribe un hermoso mensaje introductorio para la sección de los padres..."
                    rows={2}
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                  <p className="text-[10px] text-sage-400 mt-1 italic">
                    Este texto aparecerá justo antes de los nombres de sus padres en la invitación.
                  </p>
                </div>

                {/* Parents Names - Separate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                      Padres del Novio (Richard)
                    </label>
                    <input
                      type="text"
                      name="groomParents"
                      value={formData.groomParents || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej. Obdulio Camargo y Lucía de Camargo"
                      className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                      Padres de la Novia (Oriana)
                    </label>
                    <input
                      type="text"
                      name="brideParents"
                      value={formData.brideParents || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="Nombres de los padres de la novia"
                      className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                    />
                  </div>
                </div>

                {/* Wedding Date & Time */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    Fecha y Hora del Evento
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date ? formData.date.substring(0, 16) : ""}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                  <p className="text-[10px] text-sage-400 mt-1 italic">
                    Configurada actualmente para: {new Date(formData.date).toLocaleString()}
                  </p>
                </div>

                {/* Venue Name */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    Nombre del Lugar / Salón
                  </label>
                  <input
                    type="text"
                    name="placeName"
                    value={formData.placeName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                {/* Event Details Text */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    Detalles del Evento
                  </label>
                  <textarea
                    name="eventDetails"
                    value={formData.eventDetails}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                {/* Custom Section Text (Replaces the Music Player Card) */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    Texto Personalizado (Reemplazo del Reproductor de Música)
                  </label>
                  <textarea
                    name="middleText"
                    value={formData.middleText || ""}
                    onChange={handleInputChange}
                    placeholder="Escribe el texto, frase o verso que deseas mostrar en lugar de la tarjeta del reproductor de música..."
                    rows={3}
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                  <p className="text-[10px] text-sage-400 mt-1 italic">
                    Este texto se mostrará en un cuadro elegante en la invitación, justo donde solía estar el control visual del reproductor (el cual ahora sonará en segundo plano de manera invisible).
                  </p>
                </div>

                {/* Google Maps Location */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    Enlace de Google Maps
                  </label>
                  <input
                    type="url"
                    name="googleMapsUrl"
                    value={formData.googleMapsUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    URL de la Imagen de Fondo (Unsplash)
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                {/* Extra Gallery Image 2 */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    URL de Imagen de Galería 2 (Intercalada)
                  </label>
                  <input
                    type="url"
                    name="image2"
                    value={formData.image2 || ""}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                {/* Extra Gallery Image 3 */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    URL de Imagen de Galería 3 (Intercalada)
                  </label>
                  <input
                    type="url"
                    name="image3"
                    value={formData.image3 || ""}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                {/* Extra Gallery Image 4 */}
                <div>
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    URL de Imagen de Galería 4 (Intercalada)
                  </label>
                  <input
                    type="url"
                    name="image4"
                    value={formData.image4 || ""}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                </div>

                {/* RSVP Whatsapp Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                      Teléfono WhatsApp RSVP
                    </label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej. +584262710305"
                      className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                      Mensaje Predeterminado
                    </label>
                    <input
                      type="text"
                      name="whatsappMessage"
                      value={formData.whatsappMessage}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white border border-sage-200 rounded-2xl px-4 py-2.5 text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                    />
                  </div>
                </div>

                {/* Music Instrumental URL & Uploader */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-sage-600 uppercase tracking-wider mb-1">
                    Música de Fondo (Sube tu archivo de audio preferido)
                  </label>
                  
                  <div className="flex flex-col gap-3">
                    {/* Active song status badge */}
                    <div className="bg-sage-50 border border-sage-200/60 rounded-2xl p-3 flex items-center justify-between text-xs text-sage-800">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎵</span>
                        <div>
                          <p className="font-semibold text-sage-800">Estado de la Música:</p>
                          <p className="text-[10px] text-sage-500">
                            {formData.musicUrl === "db://chunked" || formData.musicChunksCount 
                              ? "Canción personalizada guardada en la base de datos de tu boda"
                              : formData.musicUrl.startsWith("data:audio")
                                ? "Nueva canción lista para subir al guardar"
                                : formData.musicUrl 
                                  ? "Canción activa" 
                                  : "Sin canción configurada"}
                          </p>
                        </div>
                      </div>
                      
                      {formData.musicUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              musicUrl: "",
                              musicChunksCount: 0
                            }));
                            setIsNewAudioUploaded(false);
                          }}
                          className="text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-700 border-none px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 focus:outline-none"
                        >
                          ❌ Eliminar
                        </button>
                      )}
                    </div>

                    {/* File Uploader */}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-sage-200 border-dashed rounded-2xl cursor-pointer bg-sage-50/50 hover:bg-sage-50 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <svg className="w-8 h-8 mb-2 text-sage-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="mb-1 text-xs text-sage-600 font-medium">
                            <span className="font-semibold">Selecciona la canción desde tu dispositivo</span>
                          </p>
                          <p className="text-[10px] text-sage-400">Archivos MP3, WAV, M4A o similar (Soporta hasta 5MB)</p>
                          {isNewAudioUploaded && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mt-2 font-bold animate-pulse">
                              ✓ Nueva canción cargada localmente. ¡Haz clic en 'Guardar Cambios' abajo para subirla!
                            </span>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="audio/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              alert("El archivo supera los 5MB. Por favor, selecciona un audio más corto o comprimido para asegurar que cargue correctamente.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setFormData(prev => ({
                                  ...prev,
                                  musicUrl: event.target!.result as string
                                }));
                                setIsNewAudioUploaded(true);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-sage-200/50">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:bg-sage-400 text-white rounded-full font-medium py-3 px-4 text-sm flex items-center justify-center gap-2 transition-all focus:outline-none shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {savingText}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-cream-100 hover:bg-cream-200 text-sage-700 border border-sage-200/60 rounded-full font-medium py-3 px-5 text-sm transition-all focus:outline-none"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
