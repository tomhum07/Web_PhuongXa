import Header from "@/components/ui/Header/header";
import Footer from "@/components/ui/Footer/footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}
