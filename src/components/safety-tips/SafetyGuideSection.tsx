export default function SafetyGuideSection() {
  return (
    <section className="col-span-12 w-full bg-neutral pt-20 md:pt-32 lg:pt-40 xl:pt-50 pb-10 md:pb-14 lg:pb-20 flex justify-center">
      <div className="w-full md:w-[87.5%] xl:w-[80%] max-w-21xl px-4 md:px-0">
        <div className="flex flex-col gap-3 md:gap-4 justify-between text-center">
          <div className="text-sm md:text-base lg:body-18-semi text-secondary-1">
            Safety Tips
          </div>
          <div className="text-2xl md:text-3xl lg:text-4xl xl:text-[3.375rem] xl:leading-[110%] xl:tracking-[-0.06em] text-neutral-10 font-spectral font-semibold max-w-5xl mx-auto">
            These quick steps can help you stay aware and protect yourself in
            everyday situations
          </div>
        </div>
      </div>
    </section>
  );
}
