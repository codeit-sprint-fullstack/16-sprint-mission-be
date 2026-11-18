# 스프린트 미션 6

MongoDB에서 PostgreSQL·Prisma로 전환하고 상품·게시글·댓글 API를 구현했습니다. 리뷰 후 게시글 이미지와 좋아요순 정렬을 보완하고 입력 검증·응답·에러 처리를 통일했습니다.

## 구현 사항

- [x] PostgreSQL·Prisma 기반 상품 CRUD
- [x] 게시글 CRUD: `id`, `title`, `content`, `image`, `likeCount`, `createdAt`, `updatedAt` 스키마
- [x] 선택 이미지 등록·수정·제거 및 조회 응답 반영
- [x] 게시글 목록 Offset 페이지네이션, 제목·내용 검색
- [x] 최신순(`recent`)·좋아요순(`like`) 정렬, 동률 정렬 및 잘못된 정렬값 400 처리
- [x] 상품·게시글 댓글 등록·수정·삭제 및 Cursor 페이지네이션
- [x] 부모와 댓글 간 관계 및 `onDelete: Cascade`
- [x] 초기 데이터 Seed 코드와 좋아요 수가 다른 게시글 예시
- [x] 상품·게시글 라우터 분리와 공통 댓글 라우터
- [x] 공통 ID·본문 검증, 에러 미들웨어, 응답 변환 함수
- [x] 본문 없는 요청 및 가격·ID의 PostgreSQL Int 범위 검증
- [x] 목록 `limit` 최대 50 및 `findMany`·`count` 병렬 실행
- [x] `DATABASE_URL` 환경변수 예제 및 실행·마이그레이션 문서
- [x] 미사용 MongoDB 코드·의존성, Vitest 스크립트, 자동 도구 동기화 스크립트 정리
- [x] 자동 생성 도구 폴더 Git 추적 해제 및 `.gitignore` 반영

## 검증

`server/`에서 `npm test`로 실제 HTTP 요청·Prisma·독립된 메모리 PostgreSQL을 연결한 테스트와 일부 DB 대역 테스트를 실행합니다.

- 상품·게시글 CRUD와 일관된 응답 필드
- 이미지 유지·변경·제거, 좋아요순·최신순과 동률 정렬
- 본문 누락·잘못된 JSON·가격 상한·잘못된 ID·잘못된 목록 입력
- 검색·Offset 및 Cursor 페이지네이션, `limit` 상한
- 없는 부모에 댓글 등록 거부, 다른 부모의 댓글 수정·삭제 거부
- `onDelete: Cascade`와 기존 데이터 보존·새 필드 기본값 마이그레이션
- Express 5 async 에러 전달과 목록 쿼리 병렬 시작

테스트 DB는 매번 메모리에 새로 만들며 `.env`의 실제 DB에 접속하지 않습니다. 실제 사용 DB에는 `npm run db:migrate`로 마이그레이션을 별도로 적용해야 합니다.

## 저장소 구조 관련

BE 코드는 `server/`에 있고 루트에는 기존 FE 프로젝트가 함께 있습니다. FE 파일은 유지하고 README에서 각 프로젝트의 실행 위치를 구분했습니다.
