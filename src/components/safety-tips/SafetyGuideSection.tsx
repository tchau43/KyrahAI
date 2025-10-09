export default function SafetyGuideSection() {
  return (
    <section className="col-span-12 w-full bg-neutral pt-20 md:pt-32 lg:pt-40 xl:pt-50 pb-10 md:pb-14 lg:pb-20 flex justify-center">
      <div className="w-full md:w-[87.5%] xl:w-[80%] px-4 md:px-0">
        <div className="flex flex-col gap-3 md:gap-4 justify-between text-center">
          <div className="body-18-semi text-secondary-1">Safety Tips</div>
          <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-10 mx-auto">
            These quick steps can help you stay aware and protect yourself in
            everyday situations
          </div>
        </div>
      </div>
    </section>
  );
}
