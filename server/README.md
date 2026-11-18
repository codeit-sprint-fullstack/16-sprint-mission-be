# Panda Market 백엔드

Express 5, PostgreSQL, Prisma로 구현한 상품·게시글·댓글 API입니다.
백엔드 명령어는 이 `server/` 폴더에서 실행합니다. 저장소 루트의 `app/`, `components/`, `public/`, `package.json`은 Next.js 프론트엔드에 해당합니다.

## 실행

Node.js와 PostgreSQL을 준비한 뒤 다음 순서로 실행합니다.

```powershell
cd server
npm ci
Copy-Item .env.example .env
```

`.env`의 `DATABASE_URL`을 사용할 PostgreSQL 접속 주소로 변경합니다. 기존 `.env`가 있으면 해당 파일을 사용합니다.

```powershell
npm run db:generate
npm run db:migrate
npm run dev
```

`db:migrate`는 `DATABASE_URL`이 가리키는 DB에 미적용 마이그레이션을 적용합니다. 기본 포트는 3000이며 `PORT`로 변경할 수 있습니다.
선택적으로 `npm run seed`를 실행하면 상품·게시글 5개씩과 댓글을 추가합니다. 반복 실행하면 데이터가 추가됩니다. 게시글에는 좋아요순 정렬 확인을 위한 서로 다른 `likeCount`가 들어갑니다.

## API

| 경로 | 메서드 | 동작 |
| --- | --- | --- |
| `/products`, `/articles` | GET, POST | 목록 조회, 등록 |
| `/products/:id`, `/articles/:id` | GET, PATCH, DELETE | 상세 조회, 수정, 삭제 |
| `/products/:id/comments`, `/articles/:id/comments` | GET, POST | 댓글 목록 조회, 등록 |
| `/products/:id/comments/:commentId`, `/articles/:id/comments/:commentId` | PATCH, DELETE | 댓글 수정, 삭제 |

- 상품·게시글 목록: `offset=0`, `limit=10`, `keyword`로 페이지네이션·검색을 지원합니다.
- 게시글 정렬: `sort=recent`(기본값), `sort=like`. 좋아요 수 동률이면 생성일, ID 내림차순입니다.
- 모든 목록의 `limit`은 1~50입니다. 범위를 벗어나면 400으로 응답합니다.
- 댓글 목록: ID 내림차순, `cursor`와 `limit`을 사용합니다. 마지막 페이지는 `nextCursor: null`입니다.
- 상품 가격은 0~2147483647의 정수, ID·커서는 1~2147483647의 정수입니다.
- 게시글 `image`는 선택값입니다. 수정에서 생략하면 유지하고 `null`이면 제거합니다.
- `likeCount`는 기본값 0입니다. 등록·수정 요청에서 이 값을 직접 변경할 수 없습니다.
- 상품 등록·상세·수정 응답은 `id`, `name`, `description`, `price`, `tags`, `createdAt`입니다. 목록은 `id`, `name`, `price`, `createdAt`입니다.
- 게시글 응답은 `id`, `title`, `content`, `image`, `likeCount`, `createdAt`입니다.
- 댓글 응답은 `id`, `content`, `createdAt`입니다. 내부 필드인 `updatedAt`·부모 ID는 응답에서 제외합니다.
- 잘못된 입력은 400, 없는 리소스는 404, 생성 성공은 201로 응답합니다.

## 구조와 검증

- `app.js`: 서버 실행 및 DB 연결
- `src/app.js`: Express 앱 구성
- `src/routes/`: 상품·게시글 라우터와 두 리소스가 공유하는 댓글 라우터
- `src/utils/`: 입력 검증, 응답 변환, HTTP 에러
- `src/middleware/`: 공통 에러 처리
- `prisma/migrations/`: PostgreSQL 마이그레이션
- `requests/`: REST Client에서 실행할 수 있는 수동 요청 예시

```powershell
npm test
npx prisma validate
```

자동 테스트는 실제 HTTP 요청, Prisma Client, 메모리 PostgreSQL(PGlite)을 연결해 입력 검증·응답·에러 처리·정렬·페이지네이션·댓글 소속·Cascade·마이그레이션을 확인합니다. 매번 독립된 메모리 DB를 만들며 `.env`의 DB에는 접속하지 않습니다. 병렬 쿼리 시작과 예상하지 못한 에러 처리는 별도의 DB 대역으로 검증합니다. 배포 환경 PostgreSQL 연동은 마이그레이션을 적용한 DB로 서버를 실행한 후 `requests/`의 요청으로 확인할 수 있습니다.
