import { useEffect, useState } from 'react'
import { KeyRound, Loader2, ScrollText, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuditLogTable } from '@/components/admin/AuditLogTable'
import { SetoresManager } from '@/components/admin/SetoresManager'
import { useToast } from '@/hooks/use-toast'
import { createUser, deleteUser, listUsers, resetUserPassword } from '@/lib/admin-users'
import { useAuth } from '@/context/AuthContext'
import { usuarioFormSchema } from '@/lib/validations/usuario'
import type { AuthUserSummary } from '@/types/rota'

export function AdminPage() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AuthUserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newNomeCompleto, setNewNomeCompleto] = useState('')
  const [newMatricula, setNewMatricula] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({})
  const [submittingCreate, setSubmittingCreate] = useState(false)
  const [submittingReset, setSubmittingReset] = useState<string | null>(null)
  const [submittingDelete, setSubmittingDelete] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await listUsers()
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar usuários',
        description:
          `${error}. Verifique se a Edge Function "admin-users" está publicada e se você é administrador.`,
      })
      setLoading(false)
      return
    }
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()

    const parsed = usuarioFormSchema.safeParse({
      email: newEmail,
      password: newPassword,
      nome_completo: newNomeCompleto,
      matricula: newMatricula,
      isAdmin,
    })
    if (!parsed.success) {
      toast({
        variant: 'destructive',
        title: 'Dados inválidos',
        description: parsed.error.issues[0]?.message ?? 'Verifique os campos do formulário.',
      })
      return
    }

    setSubmittingCreate(true)
    const { error } = await createUser(
      parsed.data.email,
      parsed.data.password,
      parsed.data.nome_completo,
      parsed.data.matricula,
      parsed.data.isAdmin
    )
    setSubmittingCreate(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Falha ao cadastrar usuário',
        description: error,
      })
      return
    }

    toast({
      variant: 'success',
      title: 'Usuário cadastrado',
      description: `${newEmail} foi criado com sucesso.`,
    })
    setNewEmail('')
    setNewPassword('')
    setNewNomeCompleto('')
    setNewMatricula('')
    setIsAdmin(false)
    fetchUsers()
  }

  const handleReset = async (userId: string) => {
    const pwd = resetPasswords[userId]
    if (!pwd || pwd.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha inválida',
        description: 'Digite uma nova senha com no mínimo 6 caracteres.',
      })
      return
    }

    setSubmittingReset(userId)
    const { error } = await resetUserPassword(userId, pwd)
    setSubmittingReset(null)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao resetar senha',
        description: error,
      })
      return
    }

    toast({
      variant: 'success',
      title: 'Senha alterada',
      description: 'Senha atualizada com sucesso.',
    })
    setResetPasswords((prev) => ({ ...prev, [userId]: '' }))
  }

  const handleDelete = async (user: AuthUserSummary) => {
    if (!window.confirm(`Excluir o operador ${user.email}? Esta ação não pode ser desfeita.`)) {
      return
    }

    setSubmittingDelete(user.id)
    const { error } = await deleteUser(user.id)
    setSubmittingDelete(null)

    if (error) {
      // As travas server-side já retornam mensagens prontas (ex.: tentativa de
      // excluir admin cai na trava 2 da Edge Function).
      toast({ variant: 'destructive', title: 'Erro ao excluir usuário', description: error })
      return
    }

    toast({
      variant: 'success',
      title: 'Usuário excluído',
      description: `${user.email} foi removido.`,
    })
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-institucional-700" />
            Cadastro de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-3">
              <Label htmlFor="new-nome">Nome completo</Label>
              <Input
                id="new-nome"
                type="text"
                value={newNomeCompleto}
                onChange={(e) => setNewNomeCompleto(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="new-matricula">Matrícula</Label>
              <Input
                id="new-matricula"
                inputMode="numeric"
                maxLength={6}
                placeholder="Ex.: 123456"
                value={newMatricula}
                onChange={(e) =>
                  setNewMatricula(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="new-email">E-mail</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="new-password">Senha inicial</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                Criar como admin
              </label>
              <Button type="submit" disabled={submittingCreate}>
                {submittingCreate ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Cadastrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-institucional-700" />
            Usuários Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando usuários...</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">E-mail</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Perfil</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Criado em</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Último login</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nova senha</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge className={user.is_admin ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'}>
                          {user.is_admin ? 'Administrador' : 'Operador'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleString('pt-BR')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="password"
                            placeholder="Nova senha"
                            value={resetPasswords[user.id] ?? ''}
                            onChange={(e) =>
                              setResetPasswords((prev) => ({ ...prev, [user.id]: e.target.value }))
                            }
                            className="max-w-44"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReset(user.id)}
                            disabled={submittingReset === user.id}
                          >
                            {submittingReset === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <KeyRound className="h-4 w-4" />
                            )}
                            Resetar
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {/* Gating visual: lixeira só para operador e nunca na
                            própria linha. A segurança real é server-side. */}
                        {!user.is_admin && user.id !== currentUser?.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            disabled={submittingDelete === user.id}
                            aria-label="Excluir usuário"
                          >
                            {submittingDelete === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <SetoresManager />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScrollText className="h-5 w-5 text-institucional-700" />
            Relatório de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogTable />
        </CardContent>
      </Card>
    </div>
  )
}
