import { Analytics } from "@vercel/analytics/next";
import { getSeasonalCampaign } from "@/lib/seasons";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { GoogleAnalyticsTag } from "@/components/analytics/GoogleAnalytics";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// Refresh calendar-driven merchandising even on otherwise static public pages.
export const revalidate = 3600;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const campaign = getSeasonalCampaign();
  return (
    <>
      <Nav seasonalLink={{ href: campaign.href, label: campaign.cta }} />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppButton
        href={buildWhatsAppLink()}
        variant="floating"
        label="Chat with MelCrochet on WhatsApp"
        dataAttributes={{ "data-ga-location": "floating_button" }}
      />
      <GoogleAnalyticsTag />
      <Analytics />
    </>
  );
}
