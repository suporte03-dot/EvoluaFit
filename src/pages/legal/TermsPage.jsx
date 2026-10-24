import { Link } from 'react-router-dom'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import LegalLayout from './LegalLayout'

export default function TermsPage() {
  useDocumentTitle('Termos de uso')

  return (
    <LegalLayout title="Termos de uso">
      <p>Última atualização: 24 de outubro de 2026.</p>
      <p>
        O EvoluaFit é um aplicativo de organização de treinos, acompanhamento de evolução e
        orientação de rotina. Ao criar uma conta, você concorda com estes termos.
      </p>
      <h2>1. Conta e responsabilidade</h2>
      <p>
        Você é responsável pelas informações que cadastra e pelo uso da conta. O EvoluaFit não
        substitui avaliação médica, personal trainer presencial ou diagnóstico de saúde.
      </p>
      <h2>2. Treinos e Coach</h2>
      <p>
        Planilhas, sugestões do Coach e progressões são apoios educacionais. Adapte volume, carga e
        exercícios à sua condição. Pare se sentir dor aguda e procure um profissional de saúde.
      </p>
      <h2>3. Conteúdo do usuário</h2>
      <p>
        Fotos, medidas e anotações do Espelho Evolutivo pertencem a você. Usamos esses dados só para
        exibir sua evolução na sua conta, conforme a{' '}
        <Link to="/privacidade">Política de Privacidade</Link>.
      </p>
      <h2>4. Disponibilidade</h2>
      <p>
        Podemos atualizar o produto, corrigir falhas e alterar estes termos. Mudanças relevantes
        serão indicadas nesta página.
      </p>
      <h2>5. Contato</h2>
      <p>
        Dúvidas sobre a conta ou estes termos: use a área Ajuda no aplicativo ou o e-mail informado
        no cadastro da conta.
      </p>
    </LegalLayout>
  )
}
