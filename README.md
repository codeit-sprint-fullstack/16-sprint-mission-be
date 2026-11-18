# 판다마켓 — 스프린트 미션 7

한 저장소에서 프론트엔드와 백엔드를 각각 실행합니다.

| 구분 | 폴더 | 기술 | 로컬 주소 |
| --- | --- | --- | --- |
| 프론트엔드 | `app/`, `components/` 등 루트 폴더 | Next.js App Router, React, SCSS | http://localhost:3001 |
| 백엔드 | `server/` | Express, Prisma, PostgreSQL | http://localhost:3000 |

## 실행

첫 번째 터미널에서 [백엔드 설정](server/README.md)을 마친 후 실행합니다.

```powershell
cd server
npm run dev
```

두 번째 터미널은 저장소 루트에서 실행합니다.

```powershell
npm ci
npm run dev
```

브라우저에서 http://localhost:3001 을 엽니다. `npm run build`로 프로덕션 빌드하고 `npm start`로 실행할 수 있습니다.

프론트는 `/api/products`처럼 같은 주소의 `/api` 경로로 요청합니다. Next.js가 이를 백엔드로 전달합니다.
백엔드 주소를 바꾸려면 루트 `.env.example`을 `.env.local`로 복사하고 `API_BASE_URL`을 변경한 뒤 Next.js를 다시 실행하세요. 배포에서는 백엔드의 공개 주소를 빌드 전에 설정합니다.

## Next.js로 바뀐 부분

이전 `App.jsx`의 React Router 설정 대신 `app/`의 파일 위치로 경로가 결정됩니다.
참고 PR #57의 Next.js 프로젝트처럼 라우트·공통 컴포넌트·API·정적 이미지를 분리했습니다.

```text
app/
  layout.jsx                 # HTML 구조, 전역 스타일
  globals.scss
  _api/                      # 상품·게시글 API 요청
  (main)/
    layout.jsx               # 공통 Header·Footer
    page.jsx                 # 홈
    MainPage.jsx
    boards/                  # 게시글 목록
      page.jsx
      BoardPage.jsx
      BoardPage.module.scss
    items/                   # 상품 목록
      page.jsx
      MarketPage.jsx
      [id]/                  # 상품 상세
        page.jsx
        ProductDetailPage.jsx
    registration/            # 상품 등록
      page.jsx
      RegistrationPage.jsx
components/                  # Header.jsx, ArticleCard.jsx 등 공통 UI와 SCSS
hooks/                       # 반응형 페이지 크기·상품 입력 검증
styles/                      # 공통 SCSS 변수
public/asset/                # 이미지·아이콘, board/ 게시판 아이콘
server/                      # Express 백엔드
```

| 파일 | 주소 |
| --- | --- |
| `app/(main)/page.jsx` | `/` |
| `app/(main)/boards/page.jsx` | `/boards` |
| `app/(main)/boards/new/page.jsx` | `/boards/new` 게시글 등록 |
| `app/(main)/boards/[id]/page.jsx` | `/boards/1` 등 게시글 상세 조회 |
| `app/(main)/boards/[id]/edit/page.jsx` | `/boards/1/edit` 등 게시글 수정 |
| `app/(main)/items/page.jsx` | `/items` |
| `app/(main)/items/[id]/page.jsx` | `/items/1` 등 상품 상세 |
| `app/(main)/registration/page.jsx` | `/registration` |

- `(main)`은 경로 그룹이며 URL에는 표시되지 않습니다. 공통 헤더·푸터는 이 그룹의 `layout.jsx`에서 한 번만 렌더링합니다.
- `_api`는 Next.js 라우트에서 제외되는 내부 폴더입니다. 백엔드 API 요청 함수를 모아 둡니다.
- `page.jsx`는 주소와 페이지 정보를 정의합니다. 상태·이벤트를 다루는 화면 컴포넌트와 SCSS는 각 페이지 폴더에 함께 둡니다.
- `components/`는 여러 화면에서 사용하는 UI, `hooks/`는 재사용 로직, `styles/`는 공통 스타일 변수입니다.
- `public/asset/logo.png`는 브라우저에서 `/asset/logo.png`로 사용합니다.
- `jsconfig.json`의 `@/*`는 프로젝트 루트입니다. 예: `@/components/Header`, `@/app/_api/articleApi`.
- 이벤트·상태·브라우저 기능이 필요한 화면은 `"use client"`로 구분합니다.
- 페이지 링크는 `next/link`, 이동·현재 경로는 `next/navigation`을 사용합니다.

```powershell
npm run lint
npm run build
npm run test:server
```

## 미션 7 진행 순서

- [x] Vite → Next.js 전환 및 기존 상품 화면 연결
- [x] Figma 게시판 디자인 확인·공통 UI 구성
- [x] 게시글 목록·최신순·제목 검색·베스트 게시글 3개
- [x] 게시글 등록·수정
- [x] 게시글 상세·삭제
- [x] 댓글 등록·수정·삭제
- [x] 모바일 로고·헤더·푸터 크기 및 정렬 메뉴 키보드 조작 보완
- [x] 변경 파일 정리·커밋 내용 검토·PR 본문 초안 준비
- [ ] 브라우저 반응형·전체 흐름 확인
- [ ] 커밋·푸시·PR 생성
