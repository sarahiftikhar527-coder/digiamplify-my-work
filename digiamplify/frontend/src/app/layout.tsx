import { Poppins } from 'next/font/google';
import '@/app/globals.css';
import Navbar from '@/layouts/Navbar/Navbar';
import Footer from '@/layouts/Footer/Footer'; 

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'DigiAmplify',
  description: 'Empowering businesses with innovative solutions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <Navbar />
        
        <main>{children}</main>
        
        <Footer />
      </body>
    </html>
  );
}