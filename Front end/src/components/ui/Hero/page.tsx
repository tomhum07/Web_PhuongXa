import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex h-75  items-center justify-center overflow-hidden text-white ">
      <Image
        // src="/Cầu_Cao_Lãnh.jpg"
        src="/cau-cao-lanh-2-1.png"
        alt="Hero"
        fill
        priority
        className="object-cover object-center"
        quality={75}
      />

      <div className="absolute inset-0 bg-black/20" />
    </section>
  );
}
