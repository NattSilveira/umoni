# Umoni

## Controle financeiro pessoal

O Umoni é uma aplicação web para organizar gastos e receitas de forma simples, visual e acessível. O sistema transforma movimentações financeiras em informações práticas para apoiar o acompanhamento do orçamento e a tomada de decisões no dia a dia.

## Principais recursos

- Dashboard com visão geral das movimentações.
- Cadastro de despesas e receitas.
- Suporte a Real brasileiro, Dólar e Euro.
- Categorias personalizadas com identificação visual.
- Meios de movimentação como crédito, débito, Pix, empréstimo e criptomoedas.
- Edição e exclusão de registros.
- Gráficos vinculados aos dados cadastrados.
- Análise de gastos por categoria.
- Calendário mensal com movimentações por dia.
- Despesas destacadas em vermelho e receitas em azul.
- Temas Claro, Estação do ano e Noturno.
- Layout responsivo para desktop, iPhone e Android.
- Navegação por módulos independentes: Lançamentos, Categorias, Orçamento, Calendário, Análises e Configurações.

## Stack tecnológica

- HTML5 semântico.
- CSS3 com layout responsivo, Grid, Flexbox e variáveis de tema.
- JavaScript moderno para interações, cálculos e renderização dos módulos.
- `localStorage` para persistência local dos dados durante a fase inicial.
- Git e GitHub para versionamento.
- GitHub Actions e GitHub Pages para publicação contínua.

## Estrutura do projeto

```text
.
├── outputs/
│   └── umoni/
│       ├── index.html
│       ├── lancamentos.html
│       ├── categorias.html
│       ├── orcamento.html
│       ├── calendario.html
│       ├── analises.html
│       ├── configuracoes.html
│       ├── css/
│       │   └── style.css
│       └── js/
│           ├── app.js
│           ├── module.js
│           └── theme.js
├── .github/
│   └── workflows/
│       └── pages.yml
└── README.md
```

## Como executar localmente

1. Clone o repositório:

   ```bash
   git clone https://github.com/NattSilveira/umoni.git
   ```

2. Abra a pasta no VS Code.
3. Inicie o arquivo `outputs/umoni/index.html` com o Live Server ou outro servidor HTTP local.

O endereço público do projeto é:

https://nattsilveira.github.io/umoni/

## Persistência dos dados

Na versão atual, os registros são armazenados no `localStorage` do navegador. Isso mantém os dados disponíveis no mesmo dispositivo e navegador, mas ainda não sincroniza informações entre diferentes celulares ou usuários.

## Próximas evoluções

- Autenticação e perfis de usuário.
- Banco de dados remoto.
- Sincronização entre dispositivos.
- Orçamentos por categoria.
- Exportação de relatórios.
- Testes automatizados.
- Melhorias de acessibilidade e internacionalização.

## Status

Projeto em desenvolvimento contínuo, com foco em uma experiência financeira clara, visual e comercial.

## Licença

Este projeto está disponível para fins de portfólio e demonstração profissional.
