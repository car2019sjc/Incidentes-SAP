// Dicionário de traduções português-inglês para termos técnicos comuns
export const translations: Record<string, string[]> = {
  // Sistemas
  'sap': ['sap'],
  'email': ['email', 'mail', 'outlook', 'exchange'],
  'rede': ['network', 'net', 'connection', 'connectivity'],
  'network': ['rede', 'conexão'],
  'internet': ['internet', 'web'],
  'sistema': ['system', 'application', 'app'],
  'system': ['sistema', 'aplicação'],
  
  // Problemas técnicos
  'login': ['login', 'logon', 'authentication', 'auth', 'signin', 'sign-in'],
  'senha': ['password', 'pwd', 'pass'],
  'password': ['senha'],
  'acesso': ['access', 'permission', 'authorization'],
  'access': ['acesso', 'permissão'],
  'erro': ['error', 'fail', 'failure', 'issue', 'problem'],
  'error': ['erro', 'falha', 'problema'],
  'falha': ['failure', 'fail', 'error', 'crash'],
  'failure': ['falha', 'erro'],
  'lento': ['slow', 'performance', 'lag'],
  'slow': ['lento', 'performance'],
  'travado': ['freeze', 'frozen', 'hang', 'stuck'],
  'freeze': ['travado', 'congelado'],
  
  // Hardware
  'impressora': ['printer', 'print'],
  'printer': ['impressora'],
  'computador': ['computer', 'pc', 'desktop', 'laptop'],
  'computer': ['computador'],
  'monitor': ['monitor', 'screen', 'display'],
  'screen': ['tela', 'monitor'],
  'teclado': ['keyboard'],
  'keyboard': ['teclado'],
  'mouse': ['mouse'],
  
  // Software
  'software': ['software', 'program', 'application'],
  'programa': ['program', 'software', 'application'],
  'aplicação': ['application', 'app', 'software'],
  'application': ['aplicação', 'programa'],
  'navegador': ['browser', 'chrome', 'firefox', 'edge'],
  'browser': ['navegador'],
  'antivirus': ['antivirus', 'antimalware'],
  
  // Ações
  'instalar': ['install', 'setup', 'deployment'],
  'install': ['instalar', 'instalação'],
  'atualizar': ['update', 'upgrade', 'patch'],
  'update': ['atualizar', 'atualização'],
  'configurar': ['configure', 'config', 'setup'],
  'configure': ['configurar', 'configuração'],
  'backup': ['backup', 'restore'],
  'restaurar': ['restore', 'recovery'],
  'restore': ['restaurar', 'recuperar'],
  
  // Status
  'ativo': ['active', 'enabled', 'on'],
  'active': ['ativo', 'habilitado'],
  'inativo': ['inactive', 'disabled', 'off'],
  'inactive': ['inativo', 'desabilitado'],
  'disponível': ['available', 'online'],
  'available': ['disponível'],
  'indisponível': ['unavailable', 'offline', 'down'],
  'unavailable': ['indisponível'],
  
  // Departamentos/Áreas
  'ti': ['it', 'tech', 'technology'],
  'it': ['ti', 'tecnologia'],
  'rh': ['hr', 'human resources'],
  'hr': ['rh', 'recursos humanos'],
  'financeiro': ['finance', 'financial'],
  'finance': ['financeiro'],
  'vendas': ['sales', 'sell'],
  'sales': ['vendas'],
  'suporte': ['support', 'help'],
  'support': ['suporte', 'ajuda'],
  
  // Prioridades
  'urgente': ['urgent', 'critical', 'emergency'],
  'urgent': ['urgente', 'crítico'],
  'crítico': ['critical', 'urgent', 'emergency'],
  'critical': ['crítico', 'urgente'],
  'normal': ['normal', 'medium'],
  'baixo': ['low', 'minor'],
  'low': ['baixo', 'menor'],
  
  // Outros termos comuns
  'usuário': ['user', 'client', 'customer'],
  'user': ['usuário', 'cliente'],
  'cliente': ['client', 'customer', 'user'],
  'client': ['cliente', 'usuário'],
  'servidor': ['server', 'host'],
  'server': ['servidor'],
  'banco': ['database', 'db', 'data'],
  'database': ['banco', 'dados'],
  'dados': ['data', 'database', 'information'],
  'data': ['dados', 'informação'],
  'arquivo': ['file', 'document'],
  'file': ['arquivo', 'documento'],
  'documento': ['document', 'file'],
  'document': ['documento', 'arquivo'],
  'relatório': ['report', 'reporting'],
  'report': ['relatório'],
  'integração': ['integration', 'interface'],
  'integration': ['integração'],
  'api': ['api', 'interface'],
  'interface': ['interface', 'ui', 'gui'],
  'segurança': ['security', 'secure'],
  'security': ['segurança'],
  'licença': ['license', 'licensing'],
  'license': ['licença'],
  'versão': ['version', 'release'],
  'version': ['versão'],
  'teste': ['test', 'testing'],
  'test': ['teste'],
  'produção': ['production', 'prod', 'live'],
  'production': ['produção'],
  'desenvolvimento': ['development', 'dev'],
  'development': ['desenvolvimento'],
};

// Função para obter todas as variações de uma palavra (incluindo traduções)
export const getSearchVariations = (searchTerm: string): string[] => {
  const normalizedTerm = searchTerm.toLowerCase().trim();
  const variations = new Set<string>();
  
  // Adiciona o termo original
  variations.add(normalizedTerm);
  
  // Busca traduções diretas
  if (translations[normalizedTerm]) {
    translations[normalizedTerm].forEach(translation => {
      variations.add(translation.toLowerCase());
    });
  }
  
  // Busca traduções reversas (se a palavra está como tradução de outra)
  Object.entries(translations).forEach(([key, translationArray]) => {
    if (translationArray.some(t => t.toLowerCase() === normalizedTerm)) {
      variations.add(key.toLowerCase());
      // Adiciona também outras traduções da mesma palavra
      translationArray.forEach(t => variations.add(t.toLowerCase()));
    }
  });
  
  return Array.from(variations);
};

// Função para verificar se um texto contém alguma das variações da palavra de busca
export const containsSearchTerm = (text: string, searchTerm: string): boolean => {
  if (!text || !searchTerm) return false;
  
  const normalizedText = text.toLowerCase();
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  // Busca literal direta - mais precisa
  return normalizedText.includes(normalizedSearchTerm);
};