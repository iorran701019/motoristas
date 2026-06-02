import { Bus, Trash2, Users } from 'lucide-react'
import { MotoristaForm } from '@/components/cadastros/MotoristaForm'
import { VeiculoForm } from '@/components/cadastros/VeiculoForm'
import { SupabaseConfigAlert } from '@/components/SupabaseConfigAlert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCadastrosContext } from '@/context/CadastrosContext'
import { useToast } from '@/hooks/use-toast'

/** Tela de gestão de motoristas e veículos (acesso a todos os usuários) */
export function CadastrosPage() {
  const { motoristas, veiculos, loading, deleteMotorista, deleteVeiculo } = useCadastrosContext()
  const { toast } = useToast()

  const handleDeleteMotorista = async (id: string, nome: string) => {
    if (!window.confirm(`Excluir o motorista "${nome}"?`)) return
    const { error } = await deleteMotorista(id)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error })
      return
    }
    toast({ variant: 'success', title: 'Motorista excluído' })
  }

  const handleDeleteVeiculo = async (id: string, placa: string) => {
    if (!window.confirm(`Excluir o veículo "${placa}"?`)) return
    const { error } = await deleteVeiculo(id)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error })
      return
    }
    toast({ variant: 'success', title: 'Veículo excluído' })
  }

  return (
    <div className="space-y-6">
      <SupabaseConfigAlert />

      {/* Motoristas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-institucional-700" />
            Motoristas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MotoristaForm />

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome completo</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Matrícula</th>
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
                ) : motoristas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                      Nenhum motorista cadastrado.
                    </td>
                  </tr>
                ) : (
                  motoristas.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-4 py-3">{m.nome_completo}</td>
                      <td className="px-4 py-3">{m.matricula}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMotorista(m.id, m.nome_completo)}
                          aria-label={`Excluir ${m.nome_completo}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Veículos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bus className="h-5 w-5 text-institucional-700" />
            Veículos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <VeiculoForm />

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Placa</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Modelo</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cor</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                ) : veiculos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      Nenhum veículo cadastrado.
                    </td>
                  </tr>
                ) : (
                  veiculos.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{v.placa}</td>
                      <td className="px-4 py-3">{v.modelo}</td>
                      <td className="px-4 py-3">{v.cor}</td>
                      <td className="px-4 py-3">{v.tipo}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVeiculo(v.id, v.placa)}
                          aria-label={`Excluir ${v.placa}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
