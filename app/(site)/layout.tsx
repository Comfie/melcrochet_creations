import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton href={buildWhatsAppLink()} variant="floating" />
    </>
  );
}
