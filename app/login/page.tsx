'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('Erro de autenticação: ' + error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setErro('Usuário não retornado.')
      setLoading(false)
      return
    }

    const { data: usuario, error: erroUsuario } = await supabase
      .from('usuarios')
      .select('status, perfil')
      .eq('id', data.user.id)
      .single()

    if (erroUsuario) {
      setErro('Erro ao buscar perfil: ' + erroUsuario.message)
      setLoading(false)
      return
    }

    if (!usuario) {
      setErro('Perfil não encontrado na tabela usuarios.')
      setLoading(false)
      return
    }

    if (usuario.status === 'pendente') {
      await supabase.auth.signOut()
      setErro('Cadastro aguardando aprovação.')
      setLoading(false)
      return
    }

    if (usuario.status === 'inativo') {
      await supabase.auth.signOut()
      setErro('Acesso desativado.')
      setLoading(false)
      return
    }

   window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-2xl mb-4">
            <span className="text-white text-2xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Educação Especial</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Gestão AEE</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Entrar no sistema</h2>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              ❌ {erro}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-blue-600 hover:underline">
              Solicitar acesso
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}