# Blog Pessoal

Blog pessoal desenvolvido com **React + TypeScript + Vite**.

## Funcionalidades

- Página inicial com boas-vindas
- Navbar com menu de navegação (Postagens, Temas, Cadastrar tema, Perfil, Sair)
- Footer com direitos autorais dinâmicos e ícones de redes sociais

## Tecnologias

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Phosphor Icons
- ESLint

## Estrutura do Projeto

```
src/
├── App.tsx
├── index.css              (@import "tailwindcss")
├── main.tsx
├── components/
│   ├── navbar/Navbar.tsx
│   └── footer/Footer.tsx
└── pages/
    └── home/Home.tsx
```

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
