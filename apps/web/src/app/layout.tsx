import './globals.css';

export const metadata = { title: 'Snips News', description: 'Sports RSS viewer' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <body>{children}</body>
    </html>
  );
}