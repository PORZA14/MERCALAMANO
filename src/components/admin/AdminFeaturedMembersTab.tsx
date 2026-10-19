import React, { useState, useRef } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Calendar,
  Image as ImageIcon,
  User,
  Quote,
} from 'lucide-react';
import type { FeaturedMember } from '../../types';
import {
  createFeaturedMember,
  updateFeaturedMember,
} from '../../api/client';
import { MONTH_NAMES } from '../../utils/calendar';
import { compressImageFile } from '../../utils/image';

interface AdminFeaturedMembersTabProps {
  featuredMembers: FeaturedMember[];
  onDataChanged: () => void;
  showNotification: (msg: string, isError?: boolean) => void;
  onRequestDelete: (member: FeaturedMember) => void;
}

const AVAILABLE_YEARS = [2026, 2027, 2028, 2029, 2030, 2031];

const OFFICIAL_BADGE_COLORS = [
  { label: 'Salmón', value: '#FD7C5E' },
  { label: 'Azul Confianza', value: '#4E689B' },
  { label: 'Azul Inspiración', value: '#90AED1' },
];

export const AdminFeaturedMembersTab: React.FC<AdminFeaturedMembersTabProps> = ({
  featuredMembers,
  onDataChanged,
  showNotification,
  onRequestDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<FeaturedMember> | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for duplicate published month/year
  const checkDuplicate = (month: number, year: number, status: string, currentId?: string) => {
    if (status !== 'published') {
      setDuplicateWarning(null);
      return false;
    }
    const conflict = featuredMembers.find(
      (m) =>
        m.id !== currentId &&
        m.status === 'published' &&
        m.month === Number(month) &&
        m.year === Number(year)
    );
    if (conflict) {
      setDuplicateWarning(
        `Ya existe un reconocimiento publicado para ${MONTH_NAMES[month - 1]} de ${year} (${conflict.name}). Solo se permite uno publicado por mes/año.`
      );
      return true;
    } else {
      setDuplicateWarning(null);
      return false;
    }
  };

  const handleOpenCreate = () => {
    const defaultMonth = 1; // Enero
    const defaultYear = 2027;
    setDuplicateWarning(null);
    setEditingMember({
      name: '',
      role: '',
      month: defaultMonth,
      year: defaultYear,
      photoUrl: '',
      quote: '',
      badge: 'Liderazgo & Creatividad',
      badgeColor: '#FD7C5E',
      status: 'published',
    });
    checkDuplicate(defaultMonth, defaultYear, 'published');
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const compressedDataUrl = await compressImageFile(file, {
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.88,
        maxFileSizeMb: 12,
      });

      if (editingMember) {
        setEditingMember({
          ...editingMember,
          photoUrl: compressedDataUrl,
        });
      }
      showNotification('Fotografía procesada con éxito');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la fotografía';
      showNotification(msg, true);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    if (!editingMember.name?.trim()) {
      showNotification('El nombre del integrante es obligatorio', true);
      return;
    }

    if (!editingMember.photoUrl) {
      showNotification('Debes subir una fotografía para el reconocimiento', true);
      return;
    }

    const month = Number(editingMember.month);
    const year = Number(editingMember.year);
    const status = editingMember.status || 'published';

    // Duplicate verification
    const hasConflict = checkDuplicate(month, year, status, editingMember.id);
    if (hasConflict && status === 'published') {
      showNotification(
        `No se puede publicar: Ya existe un reconocimiento para ${MONTH_NAMES[month - 1]} de ${year}. Cámbialo a borrador o edita la fecha.`,
        true
      );
      return;
    }

    try {
      setLoading(true);
      if (editingMember.id) {
        await updateFeaturedMember(editingMember.id, editingMember);
        showNotification('Reconocimiento actualizado con éxito');
      } else {
        await createFeaturedMember(editingMember);
        showNotification('Miembro destacado agregado con éxito');
      }
      setEditingMember(null);
      setDuplicateWarning(null);
      onDataChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar reconocimiento';
      showNotification(msg, true);
    } finally {
      setLoading(false);
    }
  };

  // Sort list chronologically (newest first)
  const sortedMembers = [...featuredMembers].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <div className="space-y-6">
      {/* Tab Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FD7C5E]/15 text-[#FD7C5E] text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Reconocimiento Mensual</span>
          </div>
          <h3 className="text-xl font-bold text-black tracking-tight">
            Miembros Destacados del Mes
          </h3>
          <p className="text-xs text-black/60 mt-1 max-w-xl">
            Gestiona los reconocimientos que se muestran en el carrusel editorial al final de la página. Puedes registrar meses específicos de 2026, 2027 y años posteriores.
          </p>
        </div>

        {!editingMember && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4E689B] hover:bg-[#3B527E] text-white text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#FD7C5E]" />
            <span>+ Agregar miembro destacado</span>
          </button>
        )}
      </div>

      {/* Form Drawer / Card */}
      {editingMember && (
        <form
          onSubmit={handleSaveMember}
          className="p-6 rounded-3xl border border-[#4E689B]/30 bg-slate-50 space-y-6 shadow-sm animate-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FD7C5E]" />
              <h4 className="text-sm font-bold text-[#4E689B]">
                {editingMember.id
                  ? 'Editar Miembro Destacado'
                  : 'Nuevo Miembro Destacado'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingMember(null);
                setDuplicateWarning(null);
              }}
              className="text-xs font-semibold text-black/50 hover:text-black"
            >
              Cancelar
            </button>
          </div>

          {/* Duplicate warning banner */}
          {duplicateWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Photograph Upload & Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-black/80">
                Fotografía del integrante *
              </label>

              <div className="relative w-full aspect-3/4 max-w-[220px] mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-[#90AED1]/60 bg-white flex flex-col items-center justify-center p-2 group shadow-2xs">
                {editingMember.photoUrl ? (
                  <>
                    <img
                      src={editingMember.photoUrl}
                      alt="Vista previa de miembro"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold shadow-xs hover:bg-slate-100"
                      >
                        Reemplazar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-[#4E689B]/10 text-[#4E689B] flex items-center justify-center mx-auto mb-2">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-black/80">
                      Subir foto
                    </p>
                    <p className="text-[10px] text-black/50 mt-1">
                      JPG, PNG o WebP desde celular o computador
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-3 py-1 rounded-xl bg-[#4E689B] text-white text-xs font-bold hover:bg-[#3B527E] shadow-2xs"
                    >
                      Elegir imagen
                    </button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {editingMember.photoUrl && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#4E689B] font-semibold hover:underline"
                  >
                    Cambiar imagen seleccionada
                  </button>
                </div>
              )}
            </div>

            {/* Column 2 & 3: Member details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">
                  Nombre completo del integrante *
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name || ''}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  placeholder="Ej: Mariana Gómez Valencia"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">
                  Rol o Cargo en el comité (opcional)
                </label>
                <input
                  type="text"
                  value={editingMember.role || ''}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, role: e.target.value })
                  }
                  placeholder="Ej: Líder de Contenido Audiovisual"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Mes del reconocimiento *
                  </label>
                  <select
                    value={editingMember.month ?? 1}
                    onChange={(e) => {
                      const newMonth = Number(e.target.value);
                      setEditingMember({ ...editingMember, month: newMonth });
                      checkDuplicate(
                        newMonth,
                        Number(editingMember.year ?? 2027),
                        editingMember.status || 'published',
                        editingMember.id
                      );
                    }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name} ({idx + 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Año del reconocimiento *
                  </label>
                  <select
                    value={editingMember.year ?? 2027}
                    onChange={(e) => {
                      const newYear = Number(e.target.value);
                      setEditingMember({ ...editingMember, year: newYear });
                      checkDuplicate(
                        Number(editingMember.month ?? 1),
                        newYear,
                        editingMember.status || 'published',
                        editingMember.id
                      );
                    }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                  >
                    {AVAILABLE_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">
                  Mensaje de reconocimiento (opcional)
                </label>
                <textarea
                  rows={3}
                  value={editingMember.quote || ''}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, quote: e.target.value })
                  }
                  placeholder="Escribe una breve frase destacando su contribución especial del mes..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Insignia o Distintivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingMember.badge || ''}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, badge: e.target.value })
                    }
                    placeholder="Ej: Liderazgo, Creatividad, Excelencia"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Color de la insignia
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    {OFFICIAL_BADGE_COLORS.map((col) => (
                      <label
                        key={col.value}
                        className="flex items-center gap-1.5 cursor-pointer text-xs text-black/80"
                      >
                        <input
                          type="radio"
                          name="badgeColor"
                          value={col.value}
                          checked={editingMember.badgeColor === col.value}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              badgeColor: e.target.value,
                            })
                          }
                          className="accent-[#4E689B]"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block shadow-2xs"
                          style={{ backgroundColor: col.value }}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">
                  Estado de publicación *
                </label>
                <select
                  value={editingMember.status || 'published'}
                  onChange={(e) => {
                    const newStatus = e.target.value as 'draft' | 'published';
                    setEditingMember({ ...editingMember, status: newStatus });
                    checkDuplicate(
                      Number(editingMember.month ?? 1),
                      Number(editingMember.year ?? 2027),
                      newStatus,
                      editingMember.id
                    );
                  }}
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4E689B]"
                >
                  <option value="published">
                    Publicado (visible en el carrusel público)
                  </option>
                  <option value="draft">
                    Borrador (solo visible en el administrador)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setEditingMember(null);
                setDuplicateWarning(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-black/70 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#4E689B] hover:bg-[#3B527E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar reconocimiento'}
            </button>
          </div>
        </form>
      )}

      {/* Recognitions List */}
      <div className="space-y-3">
        {sortedMembers.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-[#90AED1]/40 text-center bg-white">
            <Award className="w-10 h-10 text-[#4E689B]/40 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-black">
              Aún no hay miembros destacados registrados
            </h4>
            <p className="text-xs text-black/60 mt-1 max-w-md mx-auto">
              Haz clic en "+ Agregar miembro destacado" para reconocer el aporte especial de un integrante de Mercadeo.
            </p>
          </div>
        ) : (
          sortedMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl bg-white border border-[#90AED1]/30 hover:border-[#4E689B]/60 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Photo Thumbnail */}
                <div className="w-14 h-16 rounded-xl overflow-hidden bg-slate-100 border border-[#90AED1]/40 shrink-0">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/30">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-black">
                      {member.name}
                    </h4>

                    {member.status === 'published' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Publicado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-black/70">
                        Borrador
                      </span>
                    )}

                    {member.badge && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{
                          backgroundColor: member.badgeColor || '#4E689B',
                        }}
                      >
                        {member.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-black/60">
                    <span className="font-semibold text-[#4E689B]">
                      {MONTH_NAMES[member.month - 1]} de {member.year}
                    </span>
                    {member.role && (
                      <>
                        <span>•</span>
                        <span>{member.role}</span>
                      </>
                    )}
                  </div>

                  {member.quote && (
                    <p className="text-[11px] text-black/60 italic mt-1 line-clamp-1 max-w-lg">
                      “{member.quote}”
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(member);
                    checkDuplicate(
                      member.month,
                      member.year,
                      member.status,
                      member.id
                    );
                  }}
                  className="p-2 rounded-xl text-black/60 hover:text-[#4E689B] hover:bg-slate-100 transition-colors"
                  title="Editar reconocimiento"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onRequestDelete(member)}
                  className="p-2 rounded-xl text-black/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar reconocimiento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
