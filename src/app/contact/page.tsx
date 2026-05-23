import Image from "next/image";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#ebe3d6]">
      <Image
        src="/contact-sarrthak.png"
        alt="Contact details for Sarrthak Chauhan"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </main>
  );
}
