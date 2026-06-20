import { useState } from 'react'
import { AlertCircle, Loader2, Palette, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useSetores } from '@/hooks/useSetores'
import { setorFormSchema } from '@/lib/validations/setor'
import type { Setor } from '@/types/rota'

const COR_PADRAO = '#1e40af'

/** Gestão dos setores da SME (admin). Form de criar/editar + tabela. */
export function SetoresManager() {
  const { setores, loading, error, createSetor, updateSetor, deleteSetor } = useSetores()
  const { toast } = useToast()

  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(COR_PADRAO)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isEditing = editingId !== null

  const resetForm = () => {
    setNome('')
    setCor(COR_PADRAO)
    setEditingId(null)
  }

  const startEdit = (setor: Setor) => {
    setEditingId(setor.id)
    setNome(setor.nome)
    setCor(setor.cor)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Valida o valor exatamente como sai dos inputs, sem normalizar a cor.
    const parsed = setorFormSchema.safeParse({ nome, cor })
    if (!parsed.success) {
      toast({
        variant: 'destructive',
        title: 'Dados inválidos',
        description: parsed.error.issues[0]?.message ?? 'Verifique os campos do formulário.',
      })
      return
    }

    setSubmitting(true)
    const { error: submitError } = isEditing
      ? await updateSetor(editingId, parsed.data)
      : await createSetor(parsed.data)
    setSubmitting(false)

    if (submitError) {
      toast({
        variant: 'destructive',
        title: isEditing ? 'Falha ao atualizar setor' : 'Falha ao criar setor',
        description: submitError,
      })
      return
    }

    toast({
      variant: 'success',
      title: isEditing ? 'Setor atualizado' : 'Setor criado',
      description: parsed.data.nome,
    })
    resetForm()
  }

  const handleDelete = async (setor: Setor) => {
    if (!window.confirm(`Excluir o setor "${setor.nome}"?`)) return
    const { error: deleteError } = await deleteSetor(setor.id)
    if (deleteError) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: deleteError })
      return
    }
    toast({ variant: 'success', title: 'Setor excluído' })
    if (editingId === setor.id) resetForm()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5 text-institucional-700" />
          Setores da SME
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <Label htmlFor="setor-nome">Nome do setor</Label>
            <Input
              id="setor-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Gabinete"
              required
            />
          </div>
          <div>
            <Label htmlFor="setor-cor">Cor</Label>
            <div className="flex items-center gap-2">
              <input
                id="setor-cor"
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                aria-label="Cor do setor"
              />
              <span className="font-mono text-sm text-muted-foreground">{cor}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEditing ? 'Salvar' : 'Adicionar'}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </form>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Erro ao carregar setores: {error}</span>
          </div>
        )}

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cor</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : setores.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum setor cadastrado.
                  </td>
                </tr>
              ) : (
                setores.map((setor) => (
                  <tr key={setor.id} className="border-t">
                    <td className="px-4 py-3 font-medium" style={{ color: setor.cor }}>
                      {setor.nome}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded border border-black/10"
                          style={{ backgroundColor: setor.cor }}
                          aria-hidden
                        />
                        <span className="font-mono text-xs text-muted-foreground">{setor.cor}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(setor)}
                          aria-label={`Editar ${setor.nome}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(setor)}
                          aria-label={`Excluir ${setor.nome}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
