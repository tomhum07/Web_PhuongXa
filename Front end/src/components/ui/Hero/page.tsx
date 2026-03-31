import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex h-72 items-center justify-center overflow-hidden text-white sm:h-80 md:h-96 ">
      <Image
        // src="/Cầu_Cao_Lãnh.jpg"
        src="/cau-cao-lanh-2.jpg"
        alt="Hero"
        fill
        priority
        className="object-cover object-center"
        quality={75}
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 px-4 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          Phường Cao Lãnh
        </h1>
        <p className="mt-3 text-base sm:text-lg">
          Trang giới thiệu Phường Cao Lãnh
        </p>
      </div>
    </section>
  );
}
