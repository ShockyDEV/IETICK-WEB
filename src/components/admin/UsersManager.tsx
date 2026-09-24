"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Ban, Copy, Dices, Eye, EyeOff, KeyRound, Pencil, UserCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { ApiError, apiRequest, errorMessage } from "@/lib/admin/api-client";
import { issuesToFieldErrors, zodIssues } from "@/lib/admin/errors";
import { formatDateTime } from "@/lib/admin/format";
import { passwordResetSchema, userCreateSchema, userUpdateSchema } from "@/lib/admin/schemas";
import { ROLE_LABELS, type Role, type UserRow } from "@/lib/admin/types";
import { ConfirmDialog, Dialog } from "@/components/admin/Dialog";
import { Badge, Button, Field, describedBy, inputClass, selectClass } from "@/components/admin/ui";

/**
 * Cuentas del panel (solo ADMIN): listar, crear (EDITOR o ADMIN) con
 * contraseña inicial, editar nombre y rol, desactivar/reactivar y
 * restablecer la contraseña. Nadie puede desactivarse ni degradarse a sí
 * mismo, y siempre queda al menos un ADMIN activo (lo garantiza la API).
 */

type Modal =
  | { kind: "create" }
  | { kind: "edit"; user: UserRow }
  | { kind: "password"; user: UserRow }
  | { kind: "deactivate"; user: UserRow }
  | null;

const ROLE_HINT: Record<Role, string> = {
  ADMIN: "Todo el panel, incluidas las cuentas.",
  EDITOR: "Programa, espacios y ajustes; no gestiona cuentas.",
};

/** Contraseña aleatoria legible (sin caracteres ambiguos). */
function generatePassword(length = 16): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_.";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function UsersManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setActive(user: UserRow, active: boolean) {
    setBusyId(user.id);
    try {
      await apiRequest(`/api/admin/users/${user.id}`, { method: "PATCH", body: { active } });
      toast.success(active ? `Cuenta ${user.email} reactivada.` : `Cuenta ${user.email} desactivada.`);
      setModal(null);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  const done = () => {
    setModal(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setModal({ kind: "create" })}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Nueva cuenta
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-linea bg-white shadow-sm">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <caption className="sr-only">Cuentas del panel</caption>
          <thead className="border-b border-linea bg-papel/70 text-xs uppercase tracking-wide text-tinta-tenue">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">
                Cuenta
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Rol
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Estado
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Alta
              </th>
              <th scope="col" className="w-px px-4 py-2">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linea">
            {users.map((user) => {
              const self = user.id === currentUserId;
              return (
                <tr key={user.id} className={cn("align-top", !user.active && "bg-papel/60")}>
                  <td className="px-4 py-3">
                    <p className={cn("font-medium", user.active ? "text-tinta" : "text-tinta-tenue")}>
                      {user.name || "Sin nombre"}
                      {self ? <span className="ml-2 text-xs font-normal text-mar-700">(tú)</span> : null}
                    </p>
                    <p className="text-xs text-tinta-suave">{user.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={user.role === "ADMIN" ? "dark" : "info"}>{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    {user.active ? <Badge tone="success">Activa</Badge> : <Badge tone="warning">Desactivada</Badge>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-tinta-suave">{formatDateTime(user.createdAt)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" onClick={() => setModal({ kind: "edit", user })}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Editar
                        <span className="sr-only"> {user.email}</span>
                      </Button>
                      <Button size="sm" onClick={() => setModal({ kind: "password", user })}>
                        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                        Contraseña
                        <span className="sr-only"> de {user.email}</span>
                      </Button>
                      {user.active ? (
                        <Button
                          size="sm"
                          variant="danger-ghost"
                          onClick={() => setModal({ kind: "deactivate", user })}
                          disabled={self || busyId === user.id}
                          title={self ? "No puedes desactivar tu propia cuenta" : "Desactivar la cuenta"}
                        >
                          <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                          Desactivar
                          <span className="sr-only"> {user.email}</span>
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setActive(user, true)} busy={busyId === user.id}>
                          {busyId === user.id ? null : <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />}
                          Reactivar
                          <span className="sr-only"> {user.email}</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal?.kind === "create" ? <CreateUserDialog onClose={() => setModal(null)} onDone={done} /> : null}
      {modal?.kind === "edit" ? (
        <EditUserDialog user={modal.user} self={modal.user.id === currentUserId} onClose={() => setModal(null)} onDone={done} />
      ) : null}
      {modal?.kind === "password" ? (
        <PasswordDialog user={modal.user} onClose={() => setModal(null)} onDone={done} />
      ) : null}

      <ConfirmDialog
        open={modal?.kind === "deactivate"}
        title="¿Desactivar la cuenta?"
        confirmLabel="Desactivar"
        onClose={() => setModal(null)}
        onConfirm={() => (modal?.kind === "deactivate" ? setActive(modal.user, false) : undefined)}
      >
        {modal?.kind === "deactivate" ? (
          <p>
            <strong className="text-tinta">{modal.user.email}</strong> no podrá entrar en el panel (y se cerrará su sesión
            abierta). Podrás reactivarla cuando quieras.
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}

// ─── Diálogos ─────────────────────────────────────────────────────────

function PasswordInput({
  id,
  value,
  onChange,
  error,
  hint,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(true);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Contraseña copiada.");
    } catch {
      const el = document.getElementById(id) as HTMLInputElement | null;
      el?.select();
      toast("Selecciónala y cópiala con Ctrl+C.");
    }
  }

  return (
    <Field id={id} label="Contraseña" required error={error} hint={hint ?? "Mínimo 10 caracteres. Compártela por un canal seguro."}>
      <div className="flex gap-2">
        <input
          {...describedBy(id, { hint: true, error })}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, "font-mono")}
        />
        <Button variant="ghost" size="icon" onClick={() => setVisible((v) => !v)} aria-pressed={visible} title={visible ? "Ocultar" : "Mostrar"}>
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          <span className="sr-only">{visible ? "Ocultar la contraseña" : "Mostrar la contraseña"}</span>
        </Button>
        <Button variant="secondary" size="icon" onClick={() => onChange(generatePassword())} title="Generar una contraseña">
          <Dices className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Generar una contraseña aleatoria</span>
        </Button>
        <Button variant="secondary" size="icon" onClick={copy} disabled={!value} title="Copiar">
          <Copy className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Copiar la contraseña</span>
        </Button>
      </div>
    </Field>
  );
}

function RoleSelect({ id, value, onChange, disabled, error }: { id: string; value: Role; onChange: (r: Role) => void; disabled?: boolean; error?: string }) {
  return (
    <Field id={id} label="Rol" required error={error} hint={disabled ? "No puedes cambiar tu propio rol." : ROLE_HINT[value]}>
      <select
        {...describedBy(id, { hint: true, error })}
        value={value}
        onChange={(e) => onChange(e.target.value as Role)}
        disabled={disabled}
        className={selectClass}
      >
        <option value="EDITOR">{ROLE_LABELS.EDITOR} (EDITOR)</option>
        <option value="ADMIN">{ROLE_LABELS.ADMIN} (ADMIN)</option>
      </select>
    </Field>
  );
}

function CreateUserDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ email: "", name: "", role: "EDITOR" as Role, password: generatePassword() });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = userCreateSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(issuesToFieldErrors(zodIssues(parsed.error)));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await apiRequest("/api/admin/users", { method: "POST", body: form });
      toast.success(`Cuenta ${parsed.data.email} creada. Recuerda enviarle la contraseña.`);
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.issues.length) setErrors(issuesToFieldErrors(err.issues));
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      busy={saving}
      title="Nueva cuenta"
      description="La persona entrará con este correo y la contraseña inicial."
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="user-create" variant="primary" busy={saving}>
            Crear cuenta
          </Button>
        </>
      }
    >
      <form id="user-create" onSubmit={submit} noValidate className="space-y-4">
        <Field id="uc-email" label="Correo electrónico" required error={errors.email}>
          <input
            {...describedBy("uc-email", { error: errors.email })}
            type="email"
            autoComplete="off"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
            data-autofocus
          />
        </Field>
        <Field id="uc-name" label="Nombre" error={errors.name}>
          <input
            {...describedBy("uc-name", { error: errors.name })}
            type="text"
            autoComplete="off"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <RoleSelect id="uc-role" value={form.role} onChange={(role) => setForm((f) => ({ ...f, role }))} error={errors.role} />
        <PasswordInput id="uc-password" value={form.password} onChange={(password) => setForm((f) => ({ ...f, password }))} error={errors.password} />
      </form>
    </Dialog>
  );
}

function EditUserDialog({ user, self, onClose, onDone }: { user: UserRow; self: boolean; onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: user.name ?? "", role: user.role });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = self ? { name: form.name } : form;
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) {
      setErrors(issuesToFieldErrors(zodIssues(parsed.error)));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await apiRequest(`/api/admin/users/${user.id}`, { method: "PATCH", body });
      toast.success("Cuenta guardada.");
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.issues.length) setErrors(issuesToFieldErrors(err.issues));
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      busy={saving}
      title="Editar cuenta"
      description={user.email}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="user-edit" variant="primary" busy={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="user-edit" onSubmit={submit} noValidate className="space-y-4">
        <Field id="ue-name" label="Nombre" error={errors.name}>
          <input
            {...describedBy("ue-name", { error: errors.name })}
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <RoleSelect
          id="ue-role"
          value={form.role}
          onChange={(role) => setForm((f) => ({ ...f, role }))}
          disabled={self}
          error={errors.role}
        />
      </form>
    </Dialog>
  );
}

function PasswordDialog({ user, onClose, onDone }: { user: UserRow; onClose: () => void; onDone: () => void }) {
  const [password, setPassword] = useState(generatePassword());
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = passwordResetSchema.safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      await apiRequest(`/api/admin/users/${user.id}/password`, { method: "PUT", body: { password } });
      toast.success(`Contraseña de ${user.email} restablecida.`);
      onDone();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      busy={saving}
      title="Restablecer la contraseña"
      description={user.email}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="user-password" variant="primary" busy={saving}>
            Guardar la contraseña
          </Button>
        </>
      }
    >
      <form id="user-password" onSubmit={submit} noValidate>
        <PasswordInput
          id="up-password"
          value={password}
          onChange={setPassword}
          error={error}
          hint="Se sustituye la contraseña actual. Cópiala antes de guardar y envíasela por un canal seguro."
        />
      </form>
    </Dialog>
  );
}
