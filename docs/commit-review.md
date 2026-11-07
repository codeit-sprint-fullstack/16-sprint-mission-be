# 스프린트 미션 7 변경·커밋 검토

현재 작업 브랜치: `express-강재성-sprint7`

이 문서는 `fc33d7c`(스프린트 6 리뷰 수정) 이후의 미커밋 변경을 정리합니다. 실제 커밋·푸시·PR 생성은 실행하지 않습니다.

## 변경 파일 정리 결과

미추적 파일까지 포함한 임시 인덱스 기준으로 변경 파일은 130개이며, 이 중 48개는 Git이 파일 이동으로 인식했습니다. 실제 스테이징은 변경하지 않았습니다.

| 구분 | 주요 파일 | 변경 목적 |
| --- | --- | --- |
| 실행 환경 | `package.json`, `package-lock.json`, `next.config.mjs`, `jsconfig.json`, `.oxlintrc.json`, `.env.example`, `.gitignore` | Vite·React Router를 Next.js App Router로 전환하고 API 프록시·경로 별칭 구성 |
| 페이지·레이아웃 | `app/layout.jsx`, `app/globals.scss`, `app/(main)/` | 공통 헤더·푸터, 홈·상품 화면 이전, 게시판·등록·상세·수정 경로 구성 |
| 요청·상태 | `app/_api/`, `app/_utils/`, `hooks/` | 게시글·댓글 API, 조회·오류·커서 상태와 공통 표시값 관리 |
| 공통 UI | `components/` | 게시글·댓글 폼, 카드, 수정·삭제 메뉴, 확인 모달과 반응형 스타일 |
| 정적 파일 | `public/asset/`, `styles/variables.scss` | 기존 이미지·아이콘 이전 및 Figma 게시판 아이콘 추가 |
| 백엔드 보완 | `server/src/routes/articles.js` | `searchBy=title`로 제목 검색 지원. 기본 제목·내용 검색은 유지 |
| 문서 | `README.md`, `server/README.md`, `docs/` | 실행 방법, 폴더 구조, 코드 설명, 수동 확인 순서와 PR 초안 |
| 자동 생성 지침 | `AGENTS.md` | 현재 Next.js가 개발 서버 실행 시 생성하는 작업 지침 |

- 기존 이미지·아이콘 24개는 Git 객체 해시를 비교해 내용이 동일함을 확인했습니다.
- `src/` 아래 파일의 삭제 표시는 대부분 새 폴더로의 이동입니다. 실제로 제거하는 진입 파일은 `src/App.jsx`, `src/main.jsx`, `index.html`, `vite.config.js` 등 Vite 전용 파일입니다.
- 연결되지 않은 `MainPage.module.scss`와 `BottomBanner.module.scss` 사본을 정리했습니다.
- 선택 항목인 프론트 `test/articleApi.test.js`와 `npm test` 설정은 제외했습니다. 이번 작업에서 기존 서버 테스트에 추가했던 사례도 제외해 `server/test/api.test.js`의 추가 변경을 없앴습니다.
- 실제 `.env`, `.env.local`, `.next/`, `node_modules/`는 커밋 대상에서 제외하고 실제 접속 정보가 없는 `.env.example`만 포함합니다.

## 권장 커밋 순서

### 1. `feat: 게시글 목록의 제목 검색 옵션 추가`

대상: `server/src/routes/articles.js`

미션 7의 제목 검색을 지원하는 독립적인 API 변경입니다. `searchBy` 생략 시 기존 검색을 유지하고, 허용하지 않는 값은 400으로 처리합니다. 검색 목록과 `totalCount`에 같은 조건을 적용합니다.

### 2. `feat: Next.js 전환 및 자유게시판·댓글 CRUD 구현`

대상: 루트 설정 파일, `app/`, `components/`, `hooks/`, `styles/`, `public/asset/`, 이전 `src/`·Vite 파일의 삭제

폴더 이동과 새 import 경로, 공통 컴포넌트, 게시판 화면의 의존성이 연결되어 있으므로 같은 커밋으로 묶는 편이 안전합니다. 반응형·키보드 조작 보완도 이 범위에 포함합니다. `package.json`과 `package-lock.json`은 함께 포함합니다.

### 3. `docs: 미션 7 실행 방법과 제출 내용 정리`

대상: `README.md`, `server/README.md`, 이 문서와 `docs/pr-description.md`

실행 위치·포트, 폴더별 역할, 코드 설명, 검증 결과를 정리합니다. PR 제목과 본문은 `docs/pr-description.md`에서 복사할 수 있습니다.

## 커밋 전 검토 사항

- `npm run lint`, `npm run build` 결과를 확인합니다. 새 자동 테스트 파일은 작성하지 않습니다.
- 실제 로컬 실행에서 `/boards`, `/boards/new`, 기존 글의 상세·수정 주소와 목록·상세·댓글 조회 API의 정상 응답을 확인했습니다.
- 브라우저 연결 제한으로 클릭·입력·반응형 시각 검증은 아직 완료되지 않았습니다. README의 수동 확인 순서를 먼저 진행합니다.
- 제출 대상은 사용자가 선택한 `codeit-sprint-fullstack/16-sprint-mission-be`입니다. 현재 브랜치에는 이전 미션 리뷰 수정 커밋도 있으므로, PR을 만들 때 원격의 정확한 base 브랜치를 확인하고 최종 diff를 다시 검토합니다.
- 일반 `git diff`에는 미추적 새 파일이 빠집니다. 향후 실제로 스테이징할 때 `git diff --cached --stat`과 `git diff --cached --find-renames`로 이동·신규 파일까지 확인합니다.
