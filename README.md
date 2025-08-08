# Sistema de Gestão de Incidentes - SAP

Um sistema profissional para análise e gestão de incidentes de TI, desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

### 📊 Dashboard Executivo
- **KPIs em Tempo Real**: Métricas de incidentes, taxa de resolução, prioridades críticas
- **Gráficos Interativos**: Distribuição por categoria, análise de tendências
- **Filtros Dinâmicos**: Por período, categoria, prioridade e grupo de atribuição
- **Modo Escuro**: Interface adaptável com tema claro/escuro

### 📁 Upload e Processamento de Dados
- **Suporte Multi-formato**: CSV, TXT, Excel (.xlsx, .xls)
- **Validação Automática**: Verificação de integridade dos dados
- **Limpeza de Dados**: Remoção de duplicatas e normalização
- **Relatórios de Validação**: Feedback sobre qualidade dos dados importados

### 🔍 Análise de Strings
- **Filtros Inteligentes**: Busca por palavras-chave em descrições e comentários
- **Análise Detalhada**: Métricas por string configurada
- **Gráficos de Barras**: Visualização de incidência por termo
- **Persistência Local**: Strings salvas automaticamente no navegador

### 📋 Tabela de Incidentes
- **Busca Avançada**: Filtros por múltiplos campos
- **Paginação**: Navegação eficiente em grandes volumes
- **Exportação CSV**: Dados formatados para análise externa
- **Detalhes Expandidos**: Modal com informações completas do incidente

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Processamento**: XLSX para arquivos Excel
- **Datas**: date-fns com suporte ao português brasileiro
- **Ícones**: Lucide React
- **Build**: Vite

## 📦 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── ExecutiveDashboard.tsx
│   ├── FileUpload.tsx
│   ├── IncidentTable.tsx
│   ├── StringSelectionModal.tsx
│   ├── StringAnalytics.tsx
│   ├── UnifiedBarChart.tsx
│   └── LoadingSpinner.tsx
├── hooks/              # Hooks personalizados
│   └── useAppState.ts
├── types/              # Definições TypeScript
│   └── incident.ts
├── utils/              # Utilitários
│   ├── dateUtils.ts
│   ├── stringUtils.ts
│   ├── validation.ts
│   └── translations.ts
└── App.tsx            # Componente principal
```

## 🔧 Melhorias Implementadas

### 1. **Arquitetura e Performance**
- ✅ Centralização de utilitários (datas, strings, validação)
- ✅ Hook personalizado para gerenciamento de estado
- ✅ Componente unificado para gráficos (eliminação de duplicação)
- ✅ Otimização de re-renderizações com useMemo

### 2. **Qualidade de Dados**
- ✅ Validação robusta de entrada
- ✅ Limpeza automática de dados
- ✅ Relatórios de validação
- ✅ Tratamento de erros aprimorado

### 3. **Experiência do Usuário**
- ✅ Componente de loading profissional
- ✅ Feedback visual melhorado
- ✅ Modo escuro consistente
- ✅ Navegação intuitiva

### 4. **Manutenibilidade**
- ✅ Código modular e reutilizável
- ✅ Tipagem TypeScript rigorosa
- ✅ Documentação inline
- ✅ Separação de responsabilidades

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação
```bash
# Clonar o repositório
git clone <repository-url>
cd project

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run lint` - Verificação de código
- `npm run preview` - Preview do build

## 📊 Formato dos Dados

### Incidentes (CSV/Excel)
O sistema espera as seguintes colunas:
- `number` - Número do incidente
- `shortDescription` - Descrição resumida
- `caller` - Solicitante
- `state` - Estado atual
- `category` - Categoria
- `assignmentGroup` - Grupo de atribuição
- `assignedTo` - Responsável
- `priority` - Prioridade
- `closed` - Data de fechamento
- `opened` - Data de abertura
- `updated` - Data de atualização
- `resolved` - Data de resolução
- `updatedByTags` - Tags de atualização
- `commentsAndWorkNotes` - Comentários e notas

### Strings de Seleção (CSV/Excel)
- `string` - Palavra-chave para busca
- `description` - Descrição opcional

## 🎯 Funcionalidades Avançadas

### Filtros Inteligentes
- Busca por texto em múltiplos campos
- Filtros por período de datas
- Filtros por estado, prioridade e categoria
- Combinação de filtros

### Análise de Tendências
- Métricas por período (dia, semana, mês)
- Comparação com períodos anteriores
- Identificação de padrões

### Exportação de Dados
- CSV formatado para Excel
- Codificação UTF-8 com BOM
- Escape adequado de caracteres especiais

## 🔒 Segurança e Privacidade

- Dados processados localmente no navegador
- Nenhuma informação enviada para servidores externos
- Persistência opcional no localStorage
- Validação de entrada para prevenir injeção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório do projeto.

---

**Desenvolvido com ❤️ para otimizar a gestão de incidentes de TI** 