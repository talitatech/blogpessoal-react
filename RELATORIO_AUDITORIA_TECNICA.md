# RELATÓRIO DE AUDITORIA TÉCNICA — Blog Pessoal React

---

## 1. RESUMO EXECUTIVO

O projeto é um Blog Pessoal em React 19 + TypeScript + Tailwind + Vite. Funcionalmente, o CRUD de Temas e Postagens funciona, o login/cadastro existe, e os toasts foram implementados. Porém, existem **problemas críticos** que impedem a entrega correta.

| Item | Status | Falta o quê? | Prioridade | Estimativa |
|---|---|---|---|---|
| **Context API** | Parcial | Navbar/Footer visíveis sem login; token não persistido | Alta | 15 min |
| **Perfil** | Parcial | Sem proteção de rota; usa foto local; layout diferente do padrão | Alta | 10 min |
| **React Toastify** | **CRÍTICO** | **Falta import do CSS** (`react-toastify/dist/ReactToastify.css`) — toasts não aparecem | **Crítica** | 2 min |
| **Alert()** | Concluído | 0 alert() restantes | Baixa | — |
| **Build** | Concluído | `npm run build` passa sem erros | Baixa | — |
| **Lint** | Pré-existente | 17 errors, 15 warnings (nenhum do Toastify) | Média | 20 min |
| **Deploy** | Não pronto | baseURL hardcoded; sem .env; sem vercel.json; tsconfig com lint ativo | Alta | 15 min |
| **CRUD Tema** | Concluído | Funcional | Baixa | — |
| **CRUD Postagem** | Concluído | Funcional | Baixa | — |
| **Rotas** | Parcial | Sem rota 404; Home não protegida | Média | 5 min |
| **Autenticação** | Parcial | Login/logout funciona; mas sem persistência; sem Conditional Rendering na Navbar | Média | 10 min |

**Riscos principais para entrega hoje:**
1. **Toastify sem CSS** — os toasts não aparecem visualmente (apenas no console)
2. **Perfil sem proteção** — crash se acessar sem login
3. **baseURL hardcoded** — impossível fazer deploy seguro

---

## 2. ESTRUTURA DO PROJETO

```
blogpessoal-react/
├── package.json
├── vite.config.ts
├── tsconfig.app.json
├── eslint.config.js
├── index.html
├── .gitignore
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                    ← APENAS: @import "tailwindcss";
│   ├── assets/
│   │   ├── talita-santos.jpg        ← usada no Perfil
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── Service.ts
│   ├── models/
│   │   ├── Postagem.ts
│   │   ├── Tema.ts
│   │   ├── Usuario.ts
│   │   └── UsuarioLogin.ts
│   ├── pages/
│   │   ├── login/Login.tsx
│   │   ├── cadastro/Cadastro.tsx
│   │   ├── home/Home.tsx
│   │   └── perfil/Perfil.tsx
│   └── components/
│       ├── navbar/Navbar.tsx
│       ├── footer/Footer.tsx
│       ├── postagem/
│       │   ├── cardpostagem/CardPostagem.tsx
│       │   ├── listapostagens/ListaPostagens.tsx
│       │   ├── formpostagem/FormPostagem.tsx
│       │   └── deletarpostagem/DeletarPostagem.tsx
│       └── tema/
│           ├── cardtema/CardTema.tsx
│           ├── listatemas/ListaTemas.tsx
│           ├── formtema/FormTema.tsx
│           └── deletartema/DeletarTema.tsx
```

**Dependências:** react 19.2.6, react-router-dom 7.18.0, axios 1.13.2, react-toastify 11.1.0, react-spinners 0.17.0, @phosphor-icons/react 2.1.10, tailwindcss 4.3.1, typescript 6.0.2, vite 8.0.12

---

## 3. REACT-8 — CONTEXT API E PERFIL

### 3.1 AuthContext.tsx — Análise

**O que está correto:**
- `createContext` com tipagem correta ✓
- `AuthProvider` com `children: ReactNode` ✓
- Estado `usuario: UsuarioLogin` com todos os campos zerados ✓
- `handleLogin` async com try/catch ✓
- `handleLogout` resetando todos os campos ✓
- `isLoading` controlando loading ✓
- `value={{ usuario, handleLogin, handleLogout, isLoading }}` ✓
- `AuthProvider` envolve toda a aplicação em `App.tsx` ✓

**O que falta:**
- **NÃO persiste token** — ao recarregar a página, o usuário é deslogado. O Cookbook (cap. 18) menciona isso como limitação didática, mas o professor não usa localStorage também.
- **Comparação com professor:** O professor usa um helper `ToastAlerta()` em vez de `toast.*()` diretamente. Funcionalmente equivalente. O professor também não persiste no localStorage.

### 3.2 Login.tsx — Análise

**Correto:**
- `useContext(AuthContext)` para obter `usuario`, `handleLogin`, `isLoading` ✓
- `useEffect` redireciona para `/home` se token !== "" ✓
- Formulário controlado com `useState` ✓
- Loading com `ClipLoader` ✓

**Problema — Controlled Input Warning:**
```tsx
const [usuarioLogin, setUsuarioLogin] = useState<UsuarioLogin>({} as UsuarioLogin)
```
Os campos `usuarioLogin.usuario` e `usuarioLogin.senha` começam como `undefined` (objeto vazio). Quando o input renderiza `value={usuarioLogin.usuario}` com valor `undefined`, o input é **uncontrolled**. No primeiro keystroke, vira `string` → **controlled**. Isso gera o warning do React.

### 3.3 Perfil.tsx — Análise

**Seu projeto:**
```tsx
function Perfil() {
  const { usuario } = useContext(AuthContext)
  return (
    <div>
      <img src={fotoPerfil} ... />  ← FOTO LOCAL (import de assets)
      <p>{usuario.nome}</p>
      <p>{usuario.usuario}</p>
    </div>
  )
}
```

**Projeto do professor:**
```tsx
function Perfil() {
  const { usuario } = useContext(AuthContext)
  useEffect(() => {
    if (usuario.token === "") {
      ToastAlerta("Você precisa estar logado", 'info')
      navigate("/")
    }
  }, [usuario.token])
  return (
    <div>
      <img src="https://i.imgur.com/ZZFAmzo.jpg" ... /> ← CAPA
      <img src={usuario.foto} ... />  ← FOTO DO USUÁRIO (do contexto)
      <p>Nome: {usuario.nome}</p>
      <p>Email: {usuario.usuario}</p>
    </div>
  )
}
```

**Diferenças críticas:**

| Aspecto | Seu projeto | Professor | Precisa corrigir? |
|---|---|---|---|
| Proteção de rota | **AUSENTE** | useEffect com token check | **SIM** |
| Foto exibida | Import local (talita-santos.jpg) | `usuario.foto` (do contexto) | **SIM** |
| Capa/cover | Ausente | Imagem de capa (ZZFAmzo.jpg) | **SIM** |
| Layout | Card minimalista | Layout com sobreposição (mt negativo) | Estético |
| Label "Email" | Não tem | `Email: {usuario.usuario}` | Opcional |

### 3.4 Navbar.tsx — Análise

**Seu projeto:** Sempre renderiza todos os links, inclusive "Perfil" e "Sair", mesmo sem login.

**Professor:** Renderiza condicionalmente — só mostra navbar quando `usuario.token !== ""`.

```tsx
// Professor:
let component: ReactNode
if (usuario.token !== "") {
    component = ( <div>...links...</div> )
}
return <>{ component }</>
```

**Seu projeto:**
```tsx
// Sempre mostra:
<Link to="/perfil">Perfil</Link>
<Link to='' onClick={logout} className='hover:underline'>Sair</Link>
```

| Aspecto | Seu projeto | Professor |
|---|---|---|
| Conditional rendering | **Não** | Sim |
| Link "Perfil" | `to="/perfil"` sem className | `to='/perfil' className='hover:underline'` |
| `useContext` | Apenas `handleLogout` | `usuario` + `handleLogout` |

### 3.5 Footer.tsx — Análise

**Mesmo problema da Navbar:** sempre renderiza. O professor só renderiza quando logado.

### 3.6 Veredito REACT-8

**PARCIALMENTE CONCLUÍDO**

Falta:
1. **Proteção de rota no Perfil** (useEffect com token check)
2. **Usar `usuario.foto`** em vez de import local
3. **Conditional Rendering** na Navbar e Footer (professor faz)
4. **Link "Perfil"** com `hover:underline`
5. ~~Persistência de token~~ (Professor também não usa — aceitável)

---

## 4. REACT-9 — ALERTAS PERSONALIZADOS

### 4.1 Resultados das Buscas

| Busca | Resultado |
|---|---|
| `alert(` no `src/` | **0 ocorrências** ✓ |
| `toast.` no `src/` | **24 ocorrências** em 10 arquivos ✓ |
| `ToastContainer` | **2 ocorrências** em App.tsx (import + JSX) ✓ |
| `react-toastify` | **10 ocorrências** (imports nos arquivos) ✓ |

### 4.2 Detalhamento por Arquivo

| Arquivo | toast.success | toast.error | toast.info | toast.warning |
|---|---|---|---|---|
| AuthContext.tsx | 1 | 1 | — | — |
| Navbar.tsx | — | — | 1 | — |
| Cadastro.tsx | 1 | 1 | — | 1 |
| ListaPostagens.tsx | — | — | 1 | — |
| ListaTemas.tsx | — | — | 1 | — |
| FormPostagem.tsx | 2 | 2 | 1 | — |
| FormTema.tsx | 2 | 2 | 1 | — |
| DeletarPostagem.tsx | 1 | 1 | 1 | — |
| DeletarTema.tsx | 1 | 1 | 1 | — |
| **TOTAL** | **8** | **8** | **7** | **1** |

### 4.3 PROBLEMA CRÍTICO — CSS NÃO IMPORTADO

**Seu App.tsx:**
```tsx
import { ToastContainer } from 'react-toastify'
// ← FALTA: import 'react-toastify/dist/ReactToastify.css'
```

**Professor App.tsx:**
```tsx
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'  // ← PRESENTE
```

**Impacto:** Sem o CSS, o `ToastContainer` renderiza mas **os toasts não aparecem visualmente**. Eles existem no DOM mas sem estilo — são invisíveis.

### 4.4 Posicionamento do ToastContainer

| Projeto | Posição do ToastContainer |
|---|---|
| Seu | Fora do `<AuthProvider>` e fora do `<BrowserRouter>` |
| Professor | Dentro do `<AuthProvider>`, antes do `<BrowserRouter>` |

A posição do seu projeto (fora de ambos) é aceitável, pois o ToastContainer não depende de contexto nem de rotas.

### 4.5 Tipos de Toast

- `toast.success` — cadastros, atualizações, exclusões ✓
- `toast.error` — erros de API, credenciais ✓
- `toast.info` — logout, necessidade de login ✓
- `toast.warning` — dados inconsistentes no cadastro ✓

Todos os tipos são usados adequadamente.

### 4.6 Ausência de Duplicidade

Nenhum arquivo possui `alert()` junto com `toast()`. A substituição foi limpa.

### 4.7 Veredito REACT-9

**PARCIALMENTE CONCLUÍDO**

A implementação lógica está correta, mas **FALTA O IMPORT DO CSS**, que é essencial para os toasts funcionarem visualmente. Sem isso, a atividade REACT-9 não está funcional.

---

## 5. REACT-11 — BUILD E DEPLOY

### 5.1 Resultado do Build

```
> npm run build
> tsc -b && vite build

✓ built in 1.77s

dist/index.html                           0.48 kB │ gzip:   0.31 kB
dist/assets/talita-santos-DeoisT8q.jpg   68.50 kB
dist/assets/index-5b3F0LO3.css           13.71 kB │ gzip:   3.49 kB
dist/assets/index-B5_mJV3-.js           335.40 kB │ gzip: 105.30 kB
```

**Build passa sem erros.** ✓

### 5.2 baseURL — PROBLEMA

**Seu projeto (Service.ts):**
```tsx
const api = axios.create({
    baseURL: 'https://blogpessoal-spring-backend.onrender.com'  // HARDCODED
})
```

**Professor (Service.ts):**
```tsx
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL  // VARIÁVEL DE AMBIENTE
})
```

**Impacto:** A URL do backend ficará exposta no código-fonte. No deploy, é necessário usar variável de ambiente.

### 5.3 Ausência de Arquivo .env

- Não existe `.env` na raiz do projeto
- Não existe `VITE_API_URL` no `.gitignore`
- Não existe `VITE_API_URL` configurado

### 5.4 tsconfig.app.json — Linting Ativo

```json
/* Linting */
"noUnusedLocals": true,
"noUnusedParameters": true,
"erasableSyntaxOnly": true,
"noFallthroughCasesInSwitch": true
```

O Cookbook (cap. 35) instrui a **descomentar essas linhas** (desativar) para evitar erros no deploy. O professor provavelmente já tem isso desativado.

### 5.5 Ausência de vercel.json

Para SPA no Vercel, é necessário um `vercel.json` com rewrite para `index.html`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Sem isso, ao recarregar uma rota como `/postagens`, o Vercel retorna 404.

### 5.6 O que Falta para Deploy

1. Criar arquivo `.env` com `VITE_API_URL=https://blogpessoal-spring-backend.onrender.com`
2. Alterar `Service.ts` para usar `import.meta.env.VITE_API_URL`
3. Adicionar `.env` no `.gitignore`
4. Adicionar variável `VITE_API_URL` no painel da Vercel
5. Criar `vercel.json` para rotas SPA
6. (Opcional) Desativar lint no tsconfig para deploy

### 5.7 Veredito REACT-11

**NÃO PRONTO PARA DEPLOY**

Falta: variável de ambiente, vercel.json, BaseService URL.

---

## 6. WARNING DE INPUT CONTROLADO

### 6.1 Ocorrências de `useState<...>({} as ...)`

| Arquivo | Linha | Estado | Campos afetados |
|---|---|---|---|
| `Login.tsx` | 13 | `useState<UsuarioLogin>({} as UsuarioLogin)` | `usuario.usuario`, `usuario.senha` |
| `FormTema.tsx` | 13 | `useState<Tema>({} as Tema)` | `tema.descricao` |
| `FormPostagem.tsx` | 20 | `useState<Postagem>({} as Postagem)` | `postagem.titulo`, `postagem.texto` |
| `DeletarPostagem.tsx` | 14 | `useState<Postagem>({} as Postagem)` | `postagem.titulo`, `postagem.texto` |
| `DeletarTema.tsx` | 13 | `useState<Tema>({} as Tema)` | `tema.descricao` |

### 6.2 Origem do Warning

Quando `useState` inicia com `{} as Tipo`, as propriedades string são `undefined`. O React renderiza `<input value={undefined}>` como **uncontrolled**. No primeiro `onChange`, o valor vira `string` → **controlled**. O React detecta essa mudança e emite o warning.

### 6.3 Correção Recomendada

Inicializar todos os campos com string vazia:

```tsx
// Login.tsx
const [usuarioLogin, setUsuarioLogin] = useState<UsuarioLogin>({
    id: 0, nome: "", usuario: "", senha: "", foto: "", token: ""
})

// FormTema.tsx
const [tema, setTema] = useState<Tema>({ id: 0, descricao: '' })

// FormPostagem.tsx
const [postagem, setPostagem] = useState<Postagem>({
    id: 0, titulo: '', texto: '', data: '', tema: null, usuario: null
})
```

### 6.4 Cadastro.tsx — Sem Problema

```tsx
const [usuario, setUsuario] = useState<Usuario>({
    id: 0, nome: '', usuario: '', senha: '', foto: ''
})
```
Todos os campos iniciam com string vazia. **Correto.** ✓

---

## 7. AUDITORIA DE FORMULÁRIOS

### 7.1 Problemas Encontrados

| Arquivo | Problema | Severidade |
|---|---|---|
| `Login.tsx:13` | Estado inicial `{} as UsuarioLogin` — campos undefined | Média |
| `FormTema.tsx:13` | Estado inicial `{} as Tema` — descricao undefined | Média |
| `FormPostagem.tsx:20` | Estado inicial `{} as Postagem` — titulo/texto undefined | Média |
| `FormPostagem.tsx:183` | `<option value="" selected disabled>` — `selected` em JSX não é a forma React (deveria ser `defaultValue` no `<select>`) | Baixa |
| `FormPostagem.tsx:185-188` | Fragment `<>...</>` desnecessário dentro do `.map()` | Baixa |
| `FormPostagem.tsx:167` | Label `htmlFor="titulo"` duplicado (deveria ser `htmlFor="texto"`) | Baixa |
| Todos os forms | Sem validação de formulário (react-hook-form, etc.) | Baixa |

---

## 8. AUDITORIA DE REACT E HOOKS

| Arquivo | Linha | Problema | Impacto | Prioridade | Solução |
|---|---|---|---|---|---|
| `ListaPostagens.tsx` | 26 | useEffect falta dependência `navigate` | Warning | Baixa | Adicionar `[token, navigate]` |
| `ListaPostagens.tsx` | 29-30 | `buscarPostagens()` chamada antes da declaração; dependência `postagens.length` pode causar loop | **Alto** | Alta | Usar `useEffect` com `[]` e chamar após declaração |
| `ListaTemas.tsx` | 26 | Mesmo problema: `navigate` ausente | Warning | Baixa | Adicionar `[token, navigate]` |
| `ListaTemas.tsx` | 29-30 | Mesmo problema: `buscarTemas()` antes da declaração | **Alto** | Alta | Idem |
| `FormPostagem.tsx` | 68 | useEffect falta `navigate` | Warning | Baixa | — |
| `FormPostagem.tsx` | 76 | useEffect falta `buscarPostagemPorId`, `buscarTemas` | Warning | Baixa | — |
| `FormPostagem.tsx` | 78-83 | `setPostagem()` síncrono dentro de useEffect | **Alto** | Média | Reestruturar lógica |
| `FormTema.tsx` | 39 | useEffect falta `navigate` | Warning | Baixa | — |
| `FormTema.tsx` | 45 | useEffect falta `buscarPorId` | Warning | Baixa | — |
| `DeletarPostagem.tsx` | 40 | useEffect falta `navigate` | Warning | Baixa | — |
| `DeletarPostagem.tsx` | 46 | useEffect falta `buscarPorId` | Warning | Baixa | — |
| `DeletarTema.tsx` | 41 | useEffect falta `navigate` | Warning | Baixa | — |
| `DeletarTema.tsx` | 47 | useEffect falta `buscarPorId` | Warning | Baixa | — |
| `Cadastro.tsx` | 28 | useEffect falta `retornar` | Warning | Baixa | — |
| `Login.tsx` | 21 | useEffect falta `navigate` | Warning | Baixa | — |
| **6 componentes** | Vários | `useEffect` de proteção de rota **duplicado** em cada componente | Manutenção | Média | Extrair para Custom Hook |
| **5 arquivos** | Vários | `error: any` em blocos catch | Warning lint | Baixa | Usar `unknown` |

---

## 9. BUILD E LINT

### 9.1 Build

```
✓ built in 1.77s — ZERO erros
```

### 9.2 Lint — 32 problemas (17 errors, 15 warnings)

**Erros:**

| Tipo | Arquivos | Qtd |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | DeletarPostagem, DeletarTema, FormPostagem, FormTema, ListaPostagens, ListaTemas | 17 |
| `react-hooks/set-state-in-effect` | FormPostagem:79 | 1 |
| `react-hooks/immutability` | ListaPostagens:29, ListaTemas:29 | 2 |

**Warnings:**

| Tipo | Arquivos | Qtd |
|---|---|---|
| `react-hooks/exhaustive-deps` | Todos os componentes com useEffect | 15 |

**Todos são pré-existentes.** Nenhum foi introduzido pela atividade REACT-9.

---

## 10. COMPARAÇÃO COM O PROFESSOR

| Arquivo | Seu projeto | Professor | Corrigir? | Motivo |
|---|---|---|---|---|
| `App.tsx` | ToastContainer fora de tudo; sem CSS import | ToastContainer dentro de AuthProvider; **com CSS import** | **SIM** | CSS faltante = toasts invisíveis |
| `App.tsx` | `min-h-[80vh]` | `min-h-screen flex flex-col` | Não | Diferença estética |
| `AuthContext.tsx` | Usa `toast.*()` diretamente | Usa `ToastAlerta()` helper | Não | Funcionalmente equivalente |
| `Service.ts` | baseURL hardcoded | `import.meta.env.VITE_API_URL` | **SIM** | Deploy |
| `Navbar.tsx` | Sempre renderiza; sem `hover:underline` no Perfil | Conditional rendering; com `hover:underline` | **SIM** | UX + padrão |
| `Footer.tsx` | Sempre renderiza | Só quando logado | **SIM** | Padrão |
| `Perfil.tsx` | Sem proteção; foto local; layout diferente | Com proteção; `usuario.foto`; layout com capa | **SIM** | Funcional + visual |
| `Home.tsx` | `div` sem ação | `<ModalPostagem />` + `<ListaPostagens />` | **SIM** | Botão inativo |
| `package.json` | Sem `reactjs-popup` | Tem `reactjs-popup` | Não | Não usado no seu |
| `tsconfig.app.json` | Linting ativo | (Não verificado) | **SIM** (se Cookbook pede) | Deploy |

---

## 11. COMPARAÇÃO COM O COOKBOOK

### Capítulos Relevantes

| Capítulo | Tema | Seu projeto |
|---|---|---|
| 18 | AuthContext config | ✓ Implementado |
| 19 | Login lógica | ✓ Implementado |
| 32 | Página de Perfil | ⚠️ Implementado SEM proteção e com foto local |
| 33-34 | Ajustes finais | ⚠️ Parcialmente |
| 35 | Deploy Vercel | ❌ Não implementado |

### O que o Cookbook exige para Deploy (cap. 35):
1. Arquivo `.env` com `VITE_API_URL` ✓ **NÃO TEM**
2. `Service.ts` usando `import.meta.env.VITE_API_URL` ✗ **HARDCODED**
3. `.gitignore` com `.env` ✗ **NÃO TEM**
4. Desativar lint no tsconfig ✗ **ATIVO**
5. Push para branch main do GitHub — **não verificado**

---

## 12. TESTES MANUAIS NECESSÁRIOS

| # | Ação | Resultado esperado | Erro possível |
|---|---|---|---|
| 1 | Login com dados corretos | Redireciona para /home; toast.success aparece | Toast invisível (CSS faltante) |
| 2 | Login com dados incorretos | Toast.error aparece; permanece na página | Toast invisível |
| 3 | Cadastro com senhas iguais e >= 8 chars | toast.success; redireciona para / | Toast invisível |
| 4 | Cadastro com senhas diferentes | toast.warning | Toast invisível |
| 5 | Logout via Navbar | toast.info; redireciona para / | — |
| 6 | Acessar /perfil sem login | Deveria redirecionar para / (NÃO FAZ) | **Página quebrada** |
| 7 | Acessar /postagens sem login | toast.info; redireciona para / | Toast invisível |
| 8 | Listar temas (logado) | Grid de temas aparece | — |
| 9 | Cadastrar tema | toast.success; volta para /temas | Toast invisível |
| 10 | Editar tema | toast.success | — |
| 11 | Excluir tema | Tela confirmação → toast.success | — |
| 12 | Listar postagens (logado) | Grid de postagens | — |
| 13 | Cadastrar postagem | toast.success | — |
| 14 | Editar postagem | toast.success | — |
| 15 | Excluir postagem | toast.success | — |
| 16 | Atualizar página (F5) em /postagens | **Usuário deslogado** (sem persistência) | — |
| 17 | Navegar direto para /postagens | Redireciona para / | — |
| 18 | Backend dormindo (Render) | Espera ~30s; funciona | Timeout |
| 19 | Deploy na Vercel | **Falha**: baseURL hardcoded; sem vercel.json | 404 ao recarregar |

---

## 13. ARQUIVOS ESSENCIAIS PARA ANÁLISE EXTERNA

### package.json
```json
{
  "name": "blogpessoal-react",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@phosphor-icons/react": "^2.1.10",
    "axios": "^1.13.2",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-router-dom": "^7.18.0",
    "react-spinners": "^0.17.0",
    "react-toastify": "^11.1.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@tailwindcss/vite": "^4.3.1",
    "@types/node": "^24.12.3",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "tailwindcss": "^4.3.1",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.59.2",
    "vite": "^8.0.12"
  }
}
```

### src/App.tsx
```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
// ⚠️ FALTA: import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/footer/Footer'
import Navbar from './components/navbar/Navbar'
// ... imports de rotas ...
import { AuthProvider } from './contexts/AuthContext'

function App() {
    return (
        <>
            <ToastContainer />
            <AuthProvider>
                <BrowserRouter>
                    <Navbar />
                    <div className="min-h-[80vh]">
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/cadastro" element={<Cadastro />} />
                            <Route path="/temas" element={<ListaTemas />} />
                            <Route path="/cadastrartema" element={<FormTema />} />
                            <Route path="/editartema/:id" element={<FormTema />} />
                            <Route path="/deletartema/:id" element={<DeletarTema />} />
                            <Route path="/postagens" element={<ListaPostagens />} />
                            <Route path="/cadastrarpostagem" element={<FormPostagem />} />
                            <Route path="/editarpostagem/:id" element={<FormPostagem />} />
                            <Route path="/deletarpostagem/:id" element={<DeletarPostagem />} />
                            <Route path="/perfil" element={<Perfil />} />
                        </Routes>
                    </div>
                    <Footer />
                </BrowserRouter>
            </AuthProvider>
        </>
    )
}
```

### src/contexts/AuthContext.tsx
```tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, type ReactNode, useState } from "react"
import { toast } from "react-toastify"
import type UsuarioLogin from "../models/UsuarioLogin"
import { login } from "../services/Service"

interface AuthContextProps {
    usuario: UsuarioLogin
    handleLogout(): void
    handleLogin(usuario: UsuarioLogin): Promise<void>
    isLoading: boolean
}

interface AuthProviderProps { children: ReactNode }

export const AuthContext = createContext({} as AuthContextProps)

export function AuthProvider({ children }: AuthProviderProps) {
    const [usuario, setUsuario] = useState<UsuarioLogin>({
        id: 0, nome: "", usuario: "", senha: "", foto: "", token: ""
    })
    const [isLoading, setIsLoading] = useState(false)

    async function handleLogin(usuarioLogin: UsuarioLogin) {
        setIsLoading(true)
        try {
            await login(`/usuarios/logar`, usuarioLogin, setUsuario)
            toast.success("O Usuário foi autenticado com sucesso!")
        } catch {
            toast.error("Os Dados do usuário estão inconsistentes!")
        }
        setIsLoading(false)
    }

    function handleLogout() {
        setUsuario({ id: 0, nome: "", usuario: "", senha: "", foto: "", token: "" })
    }

    return (
        <AuthContext.Provider value={{ usuario, handleLogin, handleLogout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
```

### src/services/Service.ts
```tsx
/* eslint-disable @typescript-eslint/no-wrapper-object-types, @typescript-eslint/no-unsafe-function-type */
import axios from "axios";

const api = axios.create({
    baseURL: 'https://blogpessoal-spring-backend.onrender.com'  // ⚠️ HARDCODED
})

export const cadastrarUsuario = async (url: string, dados: Object, setDados: Function) => {
    const resposta = await api.post(url, dados)
    setDados(resposta.data)
}

export const login = async (url: string, dados: Object, setDados: Function) => {
    const resposta = await api.post(url, dados)
    setDados(resposta.data)
}

export const buscar = async (url: string, setDados: Function, header: Object) => {
    const resposta = await api.get(url, header)
    setDados(resposta.data)
}

export const cadastrar = async (url: string, dados: Object, setDados: Function, header: Object) => {
    const resposta = await api.post(url, dados, header)
    setDados(resposta.data)
}

export const atualizar = async (url: string, dados: Object, setDados: Function, header: Object) => {
    const resposta = await api.put(url, dados, header)
    setDados(resposta.data)
}

export const deletar = async (url: string, header: Object) => {
    await api.delete(url, header)
}
```

### src/pages/perfil/Perfil.tsx
```tsx
import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import fotoPerfil from '../../assets/talita-santos.jpg'  // ⚠️ FOTO LOCAL

function Perfil() {
  const { usuario } = useContext(AuthContext)
  // ⚠️ SEM useEffect de proteção de rota
  return (
    <div className="container mx-auto my-8 flex justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="h-28 bg-indigo-900"></div>
        <div className="flex flex-col items-center px-6 pb-6 -mt-14">
          <img src={fotoPerfil} alt={usuario.nome}
               className="h-28 w-28 rounded-full border-4 border-white object-cover" />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">{usuario.nome}</h1>
          <p className="text-gray-600">{usuario.usuario}</p>
        </div>
      </div>
    </div>
  )
}
```

### src/pages/login/Login.tsx
```tsx
import { useContext, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { AuthContext } from "../../contexts/AuthContext";
import type UsuarioLogin from "../../models/UsuarioLogin";

function Login() {
    const navigate = useNavigate();
    const { usuario, handleLogin, isLoading } = useContext(AuthContext)
    const [usuarioLogin, setUsuarioLogin] = useState<UsuarioLogin>({} as UsuarioLogin)
    // ⚠️ Estado inicial vazio gera controlled/uncontrolled warning

    useEffect(() => {
        if (usuario.token !== "") { navigate('/home') }
    }, [usuario])

    // ... formulário com inputs controlados ...
}
```

### src/pages/cadastro/Cadastro.tsx
```tsx
// Estado inicial CORRETO (todos os campos com string vazia):
const [usuario, setUsuario] = useState<Usuario>({
    id: 0, nome: '', usuario: '', senha: '', foto: ''
})
// ✅ Sem problema de controlled/uncontrolled
```

### src/components/navbar/Navbar.tsx
```tsx
// ⚠️ SEMPRE renderiza — professor só renderiza quando logado
function Navbar() {
    const { handleLogout } = useContext(AuthContext)  // ⚠️ Não usa 'usuario'
    // ... sempre mostra todos os links ...
}
```

### src/components/footer/Footer.tsx
```tsx
// ⚠️ SEMPRE renderiza — professor só renderiza quando logado
function Footer() {
    // ... sempre mostra footer ...
}
```

### src/components/tema/formtema/FormTema.tsx
```tsx
const [tema, setTema] = useState<Tema>({} as Tema)
// ⚠️ tema.descricao começa como undefined → controlled/uncontrolled warning
```

### src/components/postagem/formpostagem/FormPostagem.tsx
```tsx
const [postagem, setPostagem] = useState<Postagem>({} as Postagem)
// ⚠️ postagem.titulo e postagem.texto começam como undefined
```

### vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### eslint.config.js
```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: { globals: globals.browser },
  },
])
```

### tsconfig.app.json
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### Saída de `npm run build`
```
> blogpessoal-react@0.0.0 build
> tsc -b && vite build

vite v8.0.16 building client environment for production...
✓ 4661 modules transformed.
dist/index.html                           0.48 kB │ gzip:   0.31 kB
dist/assets/talita-santos-DeoisT8q.jpg   68.50 kB
dist/assets/index-5b3F0LO3.css           13.71 kB │ gzip:   3.49 kB
dist/assets/index-B5_mJV3-.js           335.40 kB │ gzip: 105.30 kB

✓ built in 1.77s
```

### Saída de `npm run lint`
```
✖ 32 problems (17 errors, 15 warnings)

src/components/postagem/deletarpostagem/DeletarPostagem.tsx
  28:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
  40:8   warning  React Hook useEffect has a missing dependency: 'navigate'                             react-hooks/exhaustive-deps
  46:8   warning  React Hook useEffect has a missing dependency: 'buscarPorId'                          react-hooks/exhaustive-deps
  60:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any

src/components/postagem/formpostagem/FormPostagem.tsx
  32:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
  44:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
  56:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
  68:8   warning  React Hook useEffect has a missing dependency: 'navigate'                             react-hooks/exhaustive-deps
  76:8   warning  React Hook useEffect has missing dependencies: 'buscarPostagemPorId' and 'buscarTemas' react-hooks/exhaustive-deps
  79:9   error    Avoid calling setState() directly within an effect                                    react-hooks/set-state-in-effect
  83:8   warning  React Hook useEffect has a missing dependency: 'postagem'                             react-hooks/exhaustive-deps
  112:29 error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
  130:29 error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any

src/components/postagem/listapostagens/ListaPostagens.tsx
  26:8   warning  React Hook useEffect has a missing dependency: 'navigate'                             react-hooks/exhaustive-deps
  29:9   error    Cannot access variable before it is declared                                          react-hooks/immutability
  30:8   warning  React Hook useEffect has a missing dependency: 'buscarPostagens'                      react-hooks/exhaustive-deps
  40:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any

src/components/tema/deletartema/DeletarTema.tsx
  29:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
  41:8   warning  React Hook useEffect has a missing dependency: 'navigate'                             react-hooks/exhaustive-deps
  47:8   warning  React Hook useEffect has a missing dependency: 'buscarPorId'                          react-hooks/exhaustive-deps
  61:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any

src/components/tema/formtema/FormTema.tsx
  27:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
  39:8   warning  React Hook useEffect has a missing dependency: 'navigate'                             react-hooks/exhaustive-deps
  45:8   warning  React Hook useEffect has a missing dependency: 'buscarPorId'                          react-hooks/exhaustive-deps
  68:29  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
  82:29  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any

src/components/tema/listatemas/ListaTemas.tsx
  26:8   warning  React Hook useEffect has a missing dependency: 'navigate'                             react-hooks/exhaustive-deps
  29:9   error    Cannot access variable before it is declared                                          react-hooks/immutability
  30:8   warning  React Hook useEffect has a missing dependency: 'buscarTemas'                          react-hooks/exhaustive-deps
  40:25  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any

src/pages/cadastro/Cadastro.tsx
  28:6   warning  React Hook useEffect has a missing dependency: 'retornar'                             react-hooks/exhaustive-deps

src/pages/login/Login.tsx
  21:8   warning  React Hook useEffect has a missing dependency: 'navigate'                             react-hooks/exhaustive-deps
```

### Resultados de Buscas

**Busca por `alert(` no `src/`:**
```
0 ocorrências — todos substituídos ✓
```

**Busca por `useState<...>({} as ...)`:**
```
5 ocorrências:
- Login.tsx:13       → {} as UsuarioLogin
- FormTema.tsx:13    → {} as Tema
- FormPostagem.tsx:20 → {} as Postagem
- DeletarPostagem.tsx:14 → {} as Postagem
- DeletarTema.tsx:13 → {} as Tema
```

**Busca por `value={`:**
```
6 ocorrências:
- AuthContext.tsx:56  → value={{ usuario, handleLogin, handleLogout, isLoading }}
- Cadastro.tsx:136   → value={confirmarSenha}
- FormPostagem.tsx:162 → value={postagem.titulo}
- FormPostagem.tsx:174 → value={postagem.texto}
- FormPostagem.tsx:187 → <option value={tema.id}>
- FormTema.tsx:111    → value={tema.descricao}
```

---

## 14. PLANO DE AÇÃO PARA ENTREGA HOJE

### PASSO 1 — Correção Crítica (5 min)
- **Arquivo:** `src/App.tsx`
- **Problema:** Toastify sem CSS — toasts invisíveis
- **Ação:** Adicionar `import 'react-toastify/dist/ReactToastify.css'` após o import do ToastContainer
- **Tempo:** 2 min

- **Arquivo:** `src/pages/perfil/Perfil.tsx`
- **Problema:** Sem proteção de rota; usa foto local
- **Ação:** Adicionar useEffect com token check; usar `usuario.foto` em vez de import local
- **Tempo:** 3 min

### PASSO 2 — Correções REACT-8 (10 min)
- **Arquivo:** `src/components/navbar/Navbar.tsx`
- **Ação:** Adicionar conditional rendering (só mostrar quando logado); adicionar `hover:underline` no Link "Perfil"
- **Tempo:** 5 min

- **Arquivo:** `src/components/footer/Footer.tsx`
- **Ação:** Adicionar conditional rendering (só mostrar quando logado)
- **Tempo:** 3 min

- **Arquivo:** `src/pages/login/Login.tsx`, `FormTema.tsx`, `FormPostagem.tsx`
- **Ação:** Inicializar estados com campos vazios em vez de `{} as Tipo`
- **Tempo:** 2 min

### PASSO 3 — Validação REACT-9 (2 min)
- **Testar:** Login, logout, cadastro, CRUD — confirmar que toasts aparecem visualmente
- **Tempo:** 2 min

### PASSO 4 — Preparação Deploy (10 min)
- **Arquivo:** `src/services/Service.ts`
- **Ação:** Trocar baseURL para `import.meta.env.VITE_API_URL`
- **Criar:** arquivo `.env` na raiz com `VITE_API_URL=https://blogpessoal-spring-backend.onrender.com`
- **Atualizar:** `.gitignore` com linha `.env`
- **Criar:** `vercel.json` na raiz:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **Tempo:** 5 min

### PASSO 5 — Deploy e Testes Finais (10 min)
- `git add . && git commit && git push origin main`
- Vercel: importar repo → adicionar variável `VITE_API_URL` → Deploy
- Testar URL pública
- **Tempo:** 10 min

**Total estimado: ~37 minutos**

---

## 15. VEREDITO FINAL

| Atividade | Status atual | O que falta | Pode entregar agora? |
|---|---|---|---|
| **Context API e Perfil** | Parcial | Proteção de rota no Perfil; conditional rendering Navbar/Footer; foto do contexto | **NÃO** |
| **Alertas personalizados** | Parcial | **Import do CSS do Toastify** (crítico) | **NÃO** |
| **Build** | Concluído | Nada — build passa | **SIM** |
| **Deploy** | Não pronto | .env, Service.ts, vercel.json, variável Vercel | **NÃO** |
| **Projeto completo** | Parcial | Todos os itens acima + inicialização de estados | **NÃO** |

**Resumo:** O projeto está **funcional localmente** mas **não pronto para entrega**. As 3 correções mais urgentes são: (1) import do CSS do Toastify, (2) proteção da página Perfil, (3) preparação para deploy. Com essas correções + deploy na Vercel, o projeto fica entregável.
