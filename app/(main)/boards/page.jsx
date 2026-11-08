import BoardPage from "./BoardPage";

export const metadata = { title: "자유게시판 | 판다마켓" };

// 이 파일의 위치가 /boards 주소를 만듭니다. 상태와 이벤트는 아래 화면 컴포넌트가 담당합니다.
export default function BoardsPage() {
  return <BoardPage />;
}
