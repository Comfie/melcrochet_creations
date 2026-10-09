import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NotFoundContent from "@/components/NotFoundContent";

/**
 * Unmatched URLs resolve here, outside the (site) route group, so the site
 * chrome is rendered explicitly to keep visitors one click from the shop.
 */
export default function RootNotFound() {
  return (
    <>
      <Nav />
      <main id="main">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
