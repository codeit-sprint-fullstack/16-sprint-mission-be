import "./globals.scss";

export const metadata = {
  title: "판다마켓",
  description: "일상의 모든 물건을 거래하는 판다마켓",
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}
