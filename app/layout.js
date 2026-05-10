import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Cookbook',
  description: 'A beautiful automated cookbook from Google Sheets',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
