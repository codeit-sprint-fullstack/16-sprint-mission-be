# Panda Market 프로젝트

백엔드는 [`server/`](server/)에 있습니다. 백엔드 설치·실행·테스트는 [백엔드 README](server/README.md)를 참고하고 `server/`에서 명령어를 실행하세요.

저장소 루트의 `src/`, `public/`, Vite 설정과 아래 설명은 기존 프론트엔드 프로젝트에 해당합니다. FE 저장소와의 분리 여부는 프로젝트 운영 방식에 따라 결정할 수 있도록 파일을 유지했습니다.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
