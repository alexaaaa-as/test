import { ConfigProvider } from 'antd';
import ar_EG from 'antd/lib/locale/ar_EG';
import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'أليكس للمستلزمات الزراعية',
  description: 'نظام إدارة شركة أليكس للمستلزمات الزراعية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body>
        <ConfigProvider
          direction="rtl"
          locale={ar_EG}
          theme={{
            token: {
              colorPrimary: '#44803F', // Green color suitable for agricultural theme
              borderRadius: 4,
            },
            components: {
              Layout: {
                colorBgHeader: '#44803F',
                colorBgBody: '#f5f5f5',
                colorBgTrigger: '#f0f0f0',
              },
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
