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

## 게시글 등록·수정 코드 읽기

1. `app/_api/articleApi.js`: `GET` 상세 조회, `POST` 등록, `PATCH` 수정 요청입니다. JSON 본문에는 `Content-Type: application/json`을 붙이고 서버 오류 메시지를 화면에 전달합니다.
2. `components/ArticleForm.jsx`: 등록·수정이 같은 입력 폼을 사용합니다. 전달받은 `article`이 있으면 수정 모드입니다.
3. `title.trim()`과 `content.trim()`이 모두 있어야 버튼이 활성화됩니다. 유효 여부는 입력값에서 계산하므로 별도 상태와 동기화할 필요가 없습니다.
4. `<form onSubmit>`의 `preventDefault()`는 저장할 때 브라우저가 페이지를 새로 고치지 않게 합니다. `useRef` 잠금과 `isSubmitting`은 연속 클릭으로 같은 요청이 중복 전송되는 것을 막습니다.
5. `hooks/useArticle.js`: 상세·수정 화면의 조회와 로딩·오류 처리를 공유합니다. 수정 화면은 조회 후 폼을 생성해 기존 제목·내용으로 입력값을 초기화합니다.
6. 저장 성공 후 `router.push`로 서버가 반환한 ID의 상세 페이지에 이동합니다. 실패하면 입력값을 유지하고 다시 저장할 수 있게 합니다.

브라우저에서 `/boards` → **글쓰기**로 등록하고, 상세 화면의 **게시글 메뉴** → **수정하기**로 수정합니다. 이미지 업로드는 추가하지 않았으며 목록 이미지는 미션 요구사항에 맞게 프론트 기본 이미지를 사용합니다.

미션 7의 필수 요구사항에 자동 테스트 작성은 포함되지 않습니다. 프론트엔드의 별도 테스트 파일은 두지 않고 `npm run lint`, `npm run build`와 아래 수동 확인 순서로 점검합니다.

## 게시글 삭제·댓글 코드 읽기

- `components/DeleteArticleButton.jsx`: 삭제 확인 후 API를 요청하고 성공하면 `router.replace("/boards")`로 이동합니다. 삭제된 상세 주소를 브라우저 기록에서 목록으로 교체합니다.
- `components/ConfirmDialog.jsx`: 게시글·댓글 삭제가 공유하는 기본 `<dialog>`입니다. 열려 있는 동안 배경 조작을 막고, 요청 실패 시 오류를 보여주면서 다시 시도하거나 취소할 수 있게 합니다.
- `components/ArticleComments.jsx`: 댓글 입력과 목록을 구성합니다. 공백만 입력하면 등록 버튼이 비활성화되며, 등록 성공 후에만 입력창을 비웁니다.
- `components/ArticleCommentItem.jsx`: 댓글 한 개의 조회·편집·삭제를 담당합니다. 수정 실패 시 편집 내용이 유지되고, 취소하면 원래 내용을 보여줍니다.
- `hooks/useArticleComments.js`: 최초 댓글 3개를 조회하고 `nextCursor`가 있으면 **댓글 더 보기**를 표시합니다. 성공한 등록은 앞에 추가하고, 수정은 `map()`, 삭제는 `filter()`로 새 목록을 만듭니다.
- `components/CommentAuthor.jsx`: 미션 요구사항에 맞는 임의 닉네임과 실제 작성 시각을 표시합니다.

상세 화면의 **게시글 메뉴 → 삭제하기**로 글을 삭제합니다. 댓글은 각 **댓글 메뉴 → 수정하기/삭제하기**로 관리합니다. 댓글이 없을 때와 조회 실패·추가 조회 실패 상태를 구분하며, 실제 삭제 요청은 확인 창의 **삭제**를 눌러야 전송됩니다.

## 브라우저에서 직접 확인할 순서

자동 테스트 파일 작성은 생략합니다. 빌드·정적 검사와 실제 화면 조작은 확인하는 범위가 다르므로, 아래 항목은 브라우저에서 별도로 확인해야 합니다.

| 확인할 항목 | 기대하는 동작 |
| --- | --- |
| 폭 320px·375px | 헤더의 로고·메뉴·로그인 버튼이 겹치지 않고 게시판에 가로 스크롤이 생기지 않음 |
| 폭 744px·1920px | 베스트 게시글이 각각 2개·3개 표시되고 입력창과 목록이 화면 너비에 맞춰짐 |
| 키보드로 검색·정렬 | Tab으로 이동 시 포커스가 보이고, 정렬에서 방향키로 열기·Escape로 닫기 가능 |
| 게시글 목록 → 글쓰기 | 제목·내용을 모두 입력했을 때만 등록 가능, 등록 성공 시 해당 글 상세로 이동 |
| 상세 → 수정 | 기존 제목·내용이 채워지고 수정 후 상세 화면에 변경 내용 표시 |
| 댓글 등록·수정·취소 | 공백 등록 불가, 수정 취소 시 기존 내용 유지, 성공 후 새 내용 표시 |
| 댓글 더 보기 | 이전 댓글과 중복되지 않는 다음 댓글을 이어서 표시 |
| 게시글·댓글 삭제 | 취소하면 유지되고, 확인 후 성공했을 때만 목록에서 제거 |
| 오류 상태 | 조회 오류·빈 목록을 구분하고, 저장 실패 시 입력한 내용 유지 |

현재 브라우저 연결 제한으로 위 화면 조작·시각 검증은 완료되지 않았습니다. 실행 중인 개발 서버가 이전 폴더 구조를 사용하고 있다면 종료 후 저장소 루트에서 `npm run dev`로 다시 실행하세요.

실제 로컬 실행에서는 개발 서버 재시작 후 게시판·등록·상세·수정 주소와 프론트 `/api`를 통한 목록·상세·댓글 조회의 200 응답을 확인했습니다.

## 커밋·PR 준비 문서

- [변경 파일 분류와 권장 커밋 순서](docs/commit-review.md)
- [PR 제목·본문 초안](docs/pr-description.md)

두 문서는 검토용 초안이며 실제 커밋·푸시·PR 생성은 실행하지 않았습니다.
