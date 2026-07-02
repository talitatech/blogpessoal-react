# Blog Pessoal

Blog pessoal desenvolvido com **React + TypeScript + Vite**, consumindo uma API REST Spring Boot.

## Funcionalidades

- Autenticação de usuários (login e cadastro)
- CRUD de Temas (cadastrar, listar, editar, deletar)
- CRUD de Postagens (cadastrar, listar, editar, deletar) com seleção de tema
- Proteção de rotas: usuário sem token é redirecionado ao login
- Loading states com spinners (SyncLoader e ClipLoader)
- Design responsivo com Tailwind CSS

## Tecnologias

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- React Router DOM 7
- Axios
- Phosphor Icons
- React Spinners
- ESLint

## Estrutura do Projeto

```
src/
├── App.tsx
├── index.css
├── main.tsx
├── components/
│   ├── navbar/Navbar.tsx
│   ├── footer/Footer.tsx
│   └── postagem/
│       ├── cardpostagem/CardPostagem.tsx
│       ├── listapostagens/ListaPostagens.tsx
│       ├── formpostagem/FormPostagem.tsx
│       └── deletarpostagem/DeletarPostagem.tsx
│   └── tema/
│       ├── cardtema/CardTema.tsx
│       ├── listatemas/ListaTemas.tsx
│       ├── formtema/FormTema.tsx
│       └── deletartema/DeletarTema.tsx
├── contexts/
│   └── AuthContext.tsx
├── models/
│   ├── Postagem.ts
│   ├── Tema.ts
│   ├── Usuario.ts
│   └── UsuarioLogin.ts
├── pages/
│   ├── login/Login.tsx
│   ├── cadastro/Cadastro.tsx
│   └── home/Home.tsx
└── services/
    └── Service.ts
```

## Rotas

| Rota | Componente |
|------|-----------|
| `/` | Login |
| `/home` | Home |
| `/cadastro` | Cadastro |
| `/temas` | ListaTemas |
| `/cadastrartema` | FormTema |
| `/editartema/:id` | FormTema |
| `/deletartema/:id` | DeletarTema |
| `/postagens` | ListaPostagens |
| `/cadastrarpostagem` | FormPostagem |
| `/editarpostagem/:id` | FormPostagem |
| `/deletarpostagem/:id` | DeletarPostagem |

## Endpoints da API

Base URL: `https://blogpessoal-spring-backend.onrender.com`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/usuarios/logar` | Login |
| POST | `/usuarios/cadastrar` | Cadastro |
| GET | `/postagens` | Listar postagens |
| GET | `/postagens/{id}` | Buscar postagem por ID |
| POST | `/postagens` | Cadastrar postagem |
| PUT | `/postagens` | Atualizar postagem |
| DELETE | `/postagens/{id}` | Deletar postagem |
| GET | `/temas` | Listar temas |
| GET | `/temas/{id}` | Buscar tema por ID |
| POST | `/temas` | Cadastrar tema |
| PUT | `/temas` | Atualizar tema |
| DELETE | `/temas/{id}` | Deletar tema |

## Como executar

```bash
npm install
npm run dev
```

O servidor será iniciado em `http://localhost:5173`.

## Build

```bash
npm run build
```

## Preview da build

```bash
npm run preview
```
