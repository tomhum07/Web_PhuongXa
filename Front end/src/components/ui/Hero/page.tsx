export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[url('/cau-cao-lanh-2.jpg')] text-white">
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto flex min-h-90 max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Cổng thông tin chính thức
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Phường Cao Lãnh
            </h1>

            <p className="max-w-2xl text-base font-medium text-white/85 sm:text-lg">
              Tỉnh Đồng Tháp • Cập nhật thông tin và dịch vụ công địa phương
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: "137K", label: "Dân số" },
              { value: "73,33", label: "km² diện tích" },
              { value: "35", label: "Dịch vụ công" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-5 text-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm"
              >
                <p className="text-2xl font-semibold leading-none sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-1 text-sm font-medium text-white/80">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
