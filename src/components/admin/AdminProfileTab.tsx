import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Check,
  X,
  RotateCcw,
  User,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { AdminProfile } from '../../types';
import { updateAdminProfile, resetAdminAvatar } from '../../api/client';
import { compressImageFile } from '../../utils/image';

interface AdminProfileTabProps {
  adminProfile: AdminProfile | null;
  onProfileUpdated: (updated: AdminProfile) => void;
  showNotification: (msg: string, isError?: boolean) => void;
}

export const AdminProfileTab: React.FC<AdminProfileTabProps> = ({
  adminProfile,
  onProfileUpdated,
  showNotification,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState(adminProfile?.name || 'Administrador de Mercadeo');
  const [roleInput, setRoleInput] = useState(adminProfile?.role || 'Comité de Mercadeo Partners Campus');
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 100% to 150%
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from computer or mobile device
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.88,
        maxFileSizeMb: 10,
      });

      // Set preview state only (do NOT save yet)
      setPreviewAvatar(compressedDataUrl);
      setZoomLevel(100);
      showNotification('Previsualización cargada. Haz clic en "Guardar foto" para confirmar.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la imagen seleccionada';
      showNotification(msg, true);
    } finally {
      setLoading(false);
      // Reset input value so user can pick the same file if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Confirm and save the new profile photo
  const handleSavePhoto = async () => {
    if (!previewAvatar) return;

    try {
      setLoading(true);
      const updated = await updateAdminProfile({
        avatarUrl: previewAvatar,
      });
      onProfileUpdated(updated);
      setPreviewAvatar(null);
      showNotification('Foto de perfil actualizada y guardada con éxito');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la foto de perfil';
      showNotification(msg, true);
    } finally {
      setLoading(false);
    }
  };

  // Cancel the pending photo change
  const handleCancelPhoto = () => {
    setPreviewAvatar(null);
    setZoomLevel(100);
  };

  // Reset to default avatar
  const handleResetToDefault = async () => {
    try {
      setLoading(true);
      const updated = await resetAdminAvatar();
      onProfileUpdated(updated);
      setPreviewAvatar(null);
      showNotification('Foto de perfil restablecida al avatar predeterminado');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al restablecer avatar';
      showNotification(msg, true);
    } finally {
      setLoading(false);
    }
  };

  // Save textual profile info (name, role)
  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      showNotification('El nombre es obligatorio', true);
      return;
    }

    try {
      setLoading(true);
      const updated = await updateAdminProfile({
        name: nameInput.trim(),
        role: roleInput.trim(),
      });
      onProfileUpdated(updated);
      showNotification('Datos de perfil actualizados con éxito');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar datos';
      showNotification(msg, true);
    } finally {
      setLoading(false);
    }
  };

  const currentAvatarUrl = previewAvatar || adminProfile?.avatarUrl;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Section Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4E689B]/10 text-[#4E689B] text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Mi Perfil</span>
        </div>
        <h3 className="text-xl font-bold text-black tracking-tight">
          Perfil de Administrador
        </h3>
        <p className="text-xs text-black/60 mt-1">
          Personaliza tu fotografía de perfil y tus datos. La imagen se mostrará en la cabecera del panel de administración y en la barra de navegación superior.
        </p>
      </div>

      {/* Profile Photo Management Card */}
      <div className="p-6 bg-white rounded-3xl border border-[#90AED1]/30 shadow-xs space-y-6">
        <h4 className="text-sm font-bold text-black flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#4E689B]" />
          <span>Fotografía de Perfil</span>
        </h4>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Circular Avatar Container with Institutional Frame */}
          <div className="relative shrink-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#4E689B] via-[#90AED1] to-[#FD7C5E] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center relative">
                {currentAvatarUrl ? (
                  <img
                    src={currentAvatarUrl}
                    alt="Foto de perfil del Administrador"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#4E689B] bg-slate-50">
                    <User className="w-14 h-14 opacity-40" />
                    <span className="text-[10px] font-bold text-black/40 mt-1">
                      Predeterminado
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Active Preview Badge */}
            {previewAvatar && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#FD7C5E] text-white text-[10px] font-bold shadow-xs whitespace-nowrap animate-pulse">
                Vista previa
              </span>
            )}
          </div>

          {/* Actions & Explanations */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <p className="text-xs font-bold text-black">
                {previewAvatar ? 'Previsualización de la nueva foto' : 'Fotografía actual'}
              </p>
              <p className="text-xs text-black/60 mt-0.5">
                Sube una imagen cuadrada o vertical centrada en el rostro. Formatos admitidos: JPG, PNG o WebP (máx. 10 MB).
              </p>
            </div>

            {/* Zoom / Framing slider (visible when previewing) */}
            {previewAvatar && (
              <div className="pt-1 pb-2">
                <label className="block text-[11px] font-semibold text-black/70 mb-1">
                  Ajuste de encuadre / Zoom: {zoomLevel}%
                </label>
                <input
                  type="range"
                  min="100"
                  max="140"
                  step="2"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-full max-w-xs accent-[#FD7C5E]"
                />
              </div>
            )}

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Buttons depending on whether a preview is pending or not */}
            {!previewAvatar ? (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4E689B] hover:bg-[#3B527E] text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cambiar foto de perfil</span>
                </button>

                {adminProfile?.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-black/70 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-black/50" />
                    <span>Volver al avatar predeterminado</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={handleSavePhoto}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FD7C5E] hover:bg-[#E2664A] text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{loading ? 'Guardando...' : 'Guardar foto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelPhoto}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-black/70 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2">
                  La foto anterior seguirá vigente hasta que confirmes la operación haciendo clic en <strong>Guardar foto</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Info Form Card */}
      <div className="p-6 bg-white rounded-3xl border border-[#90AED1]/30 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-black flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#4E689B]" />
          <span>Información de la Cuenta</span>
        </h4>

        <form onSubmit={handleSaveProfileInfo} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-black/80 mb-1">
              Nombre de administrador *
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ej: Administrador de Mercadeo"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B] focus:border-[#4E689B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/80 mb-1">
              Cargo o Comité
            </label>
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="Ej: Comité de Mercadeo Partners Campus EAFIT"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B] focus:border-[#4E689B]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4E689B] hover:bg-[#3B527E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Guardando...' : 'Guardar datos de perfil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
