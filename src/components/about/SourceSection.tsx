export default function SourceSection() {
  return (
    <section className="bg-neutral-1 col-span-12 w-full relative z-3 -mt-4 md:-mt-5 lg:-mt-5 xl:-mt-6">
      <div className="py-12 md:py-20 lg:py-30 bg-neutral rounded-t-2xl md:rounded-t-3xl flex justify-center">
        <div className="w-full xl:w-[80%] max-w-21xl">
          {/* Header with padding */}
          <div className="px-4 xl:px-0 mb-8 md:mb-12 lg:mb-16">
            <div className="flex flex-row justify-between gap-4 md:gap-12 xl:gap-12 md:w-[87.5%] md:mx-auto xl:w-full">
              <div className="flex flex-col gap-2 md:gap-2.5 xl:w-1/3 text-neutral-10">
                <div className="body-16-semi md:!text-[18px] lg:!text-[18px] xl:!text-[18px]">
                  Sources We Rely On
                </div>
                <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-10">
                  Grounded in
                </div>
                <div className="heading-28 md:!text-[40px] lg:!text-[40px] xl:!text-[54px] text-neutral-10">
                  Global Evidence
                </div>
              </div>
              <div className="flex flex-col items-end self-center text-right font-spectral font-extrabold text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[32px] tracking-tighter text-neutral-8 leading-6 md:leading-7 lg:leading-8 border-r-4 pr-2 border-secondary-3 h-max whitespace-nowrap">
                <div>Trusted</div>
                <div>Proven</div>
                <div>Reliable</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 px-4 md:px-0">
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-5">
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[28px] font-spectral font-semibold">
                  UN Women
                </div>
                <div className="caption-14-regular md:!text-[16px] lg:!text-[16px] xl:!text-[16px]">
                  Global Database on Violence Against Women
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[28px] font-spectral font-semibold">
                  WHO
                </div>
                <div className="caption-14-regular md:!text-[16px] lg:!text-[16px] xl:!text-[16px]">
                  Publications on violence & health
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[28px] font-spectral font-semibold">
                  UNHCR
                </div>
                <div className="caption-14-regular md:!text-[16px] lg:!text-[16px] xl:!text-[16px]">
                  Human rights & protection resources
                </div>
              </div>
              <div className="hidden md:block bg-[#F0B64029] rounded-tl-2xl rounded-bl-2xl p-6 flex-1"></div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-5">
              <div className="hidden md:block bg-[#F0B64029] rounded-tr-2xl rounded-br-2xl p-6 flex-1"></div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10 md:!h-[165.59px] lg:!h-[165.59px] xl:!h-auto lg:!justify-center">
                <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[28px] font-spectral font-semibold">
                  OECD
                </div>
                <div className="caption-14-regular md:!text-[16px] lg:!text-[16px] xl:!text-[16px]">
                  Policy frameworks on GBV
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10 md:!h-[165.59px] lg:!h-[165.59px] xl:!h-auto lg:!justify-center">
                <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[28px] font-spectral font-semibold">
                  Safe & Together Institute
                </div>
                <div className="caption-14-regular md:!text-[16px] lg:!text-[16px] xl:!text-[16px]">
                  Family violence & safety insights
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10 md:!h-[165.59px] lg:!h-[165.59px] xl:!h-auto lg:!justify-center">
                <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[28px] font-spectral font-semibold">
                  UNESCO
                </div>
                <div className="caption-14-regular md:!text-[16px] lg:!text-[16px] xl:!text-[16px]">
                  Gender-based violence & health
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-5">
              <div className="hidden md:block bg-[#F0B64029] rounded-tr-2xl rounded-br-2xl p-6 flex-1"></div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[28px] font-spectral font-semibold">
                  Kvinna till Kvinna Foundation
                </div>
                <div className="caption-14-regular md:!text-[16px] lg:!text-[16px] xl:!text-[16px]">
                  They Came Together Not to Be Silenced
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-[20px] md:!text-[28px] lg:!text-[28px] xl:!text-[28px] font-spectral font-semibold">
                  UNICEF
                </div>
                <div className="caption-14-regular md:!text-[16px] lg:!text-[16px] xl:!text-[16px]">
                  Guidance on school & emergency violence prevention
                </div>
              </div>
              <div className="hidden md:block bg-[#F0B64029] rounded-tl-2xl rounded-bl-2xl p-6 flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
