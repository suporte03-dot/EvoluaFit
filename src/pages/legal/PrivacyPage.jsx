import { Link } from 'react-router-dom'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import LegalLayout from './LegalLayout'

export default function PrivacyPage() {
  useDocumentTitle('Privacidade')

  return (
    <LegalLayout title="Política de Privacidade">
      <p>Última atualização: 24 de outubro de 2026.</p>
      <p>
        Esta política descreve como o EvoluaFit trata dados pessoais, em linha com a Lei Geral de
        Proteção de Dados (LGPD).
      </p>
      <h2>1. Quais dados coletamos</h2>
      <ul>
        <li>Cadastro: nome, e-mail e senha (a senha não é armazenada em texto aberto).</li>
        <li>Perfil de treino: objetivo, nível, frequência e restrições que você informa.</li>
        <li>Uso: treinos, séries, cargas e histórico de sessões.</li>
        <li>Espelho Evolutivo: medidas, fotos e metas corporais, só com o seu consentimento.</li>
      </ul>
      <h2>2. Para que usamos</h2>
      <p>
        Autenticar a conta, gerar e ajustar treinos, mostrar progresso e o Espelho Evolutivo, e
        melhorar o produto. Não vendemos seus dados.
      </p>
      <h2>3. Base legal</h2>
      <p>
        Execução do serviço (conta e treinos) e consentimento específico para fotos e medidas do
        Espelho Evolutivo. Você pode retirar o consentimento e apagar esses registros no próprio
        Espelho.
      </p>
      <h2>4. Compartilhamento</h2>
      <p>
        Usamos provedores de autenticação, hospedagem e armazenamento (por exemplo, login com Google
        e banco na nuvem) apenas para operar o app. O reconhecimento de voz do Coach acontece no
        navegador e o áudio não é enviado aos nossos servidores.
      </p>
      <h2>5. Seus direitos</h2>
      <p>
        Você pode acessar, corrigir e excluir dados da conta, do histórico e do Espelho Evolutivo.
        Para pedidos adicionais, use a área Ajuda no aplicativo.
      </p>
      <h2>6. Segurança e retenção</h2>
      <p>
        Aplicamos criptografia em trânsito e controles de acesso. Dados da conta permanecem enquanto
        a conta existir; registros apagados por você são removidos do produto.
      </p>
      <p>
        Veja também os <Link to="/termos">Termos de uso</Link>.
      </p>
    </LegalLayout>
  )
}
