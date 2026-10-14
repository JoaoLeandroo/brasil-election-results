export interface TSECandidato {
  n?: string;
  nm?: string;
  nmu?: string;

  vap?: string;
  pvap?: string;
  pvapn?: string;

  st?: string;
  dvt?: string;
  e?: string;
}

export interface TSESecoes {
  // Total de seções
  ts?: string;

  // Seções totalizadas
  st?: string;

  // Percentual de seções totalizadas
  pst?: string;
  pstn?: string;

  // Seções não totalizadas
  snt?: string;
  psnt?: string;
  psntn?: string;
}

export interface TSEEleitorado {
  // Total de eleitores
  te?: string;

  // Comparecimento
  c?: string;
  pc?: string;
  pcn?: string;

  // Abstenção
  a?: string;
  pa?: string;
  pan?: string;
}

export interface TSEVotos {
  // Total de votos
  tv?: string;

  // Votos válidos
  vv?: string;
  pvv?: string;
  pvvn?: string;

  // Votos brancos
  vb?: string;
  pvb?: string;
  pvbn?: string;

  // Votos nulos
  vn?: string;
  pvn?: string;
  pvnn?: string;
}

export interface TSEObjeto {
  [key: string]: unknown;
}