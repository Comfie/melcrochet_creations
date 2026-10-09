import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { GoogleAnalyticsTag } from "@/components/analytics/GoogleAnalytics";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppButton
        href={buildWhatsAppLink()}
        variant="floating"
        label="Chat with MelCrochet on WhatsApp"
        dataAttributes={{ "data-ga-location": "floating_button" }}
      />
      <GoogleAnalyticsTag />
    </>
  );
}
