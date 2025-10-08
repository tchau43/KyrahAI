export default function SourceSection() {
  return (
    <section className="bg-neutral-1 col-span-12 w-full">
      <div className="py-12 md:py-20 lg:py-30 bg-neutral rounded-t-2xl md:rounded-t-3xl flex justify-center">
        <div className="w-full xl:w-[80%] max-w-21xl">
          {/* Header with padding */}
          <div className="px-4 xl:px-0 mb-8 md:mb-12 lg:mb-16">
            <div className="flex flex-row justify-between gap-4 md:gap-12 xl:gap-12 md:w-[87.5%] md:mx-auto xl:w-full">
              <div className="flex flex-col gap-2 md:gap-2.5 xl:w-1/3 text-neutral-10">
                <div className="text-base md:text-lg lg:body-18-semi">
                  Sources We Rely On
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl xl:heading-54 font-spectral font-semibold">
                  Grounded in Global Evidence
                </div>
              </div>
              <div className="flex flex-col items-end self-center text-right font-spectral font-extrabold text-xl md:text-2xl lg:text-[2rem] tracking-tighter text-neutral-8 leading-6 md:leading-7 lg:leading-8 border-r-4 pr-2 border-secondary-3 h-max whitespace-nowrap">
                <div>Trusted</div>
                <div>Proven</div>
                <div>Reliable</div>
              </div>
            </div>
          </div>

          {/* Rows - full width on mobile/tablet, with padding on desktop */}
          <div className="flex flex-col gap-3 md:gap-4 px-4 md:px-0">
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-5">
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-xl md:text-2xl lg:heading-28 font-spectral font-semibold">
                  UN Women
                </div>
                <div className="text-sm md:text-base lg:body-16-regular">
                  Global Database on Violence Against Women
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-xl md:text-2xl lg:heading-28 font-spectral font-semibold">
                  WHO
                </div>
                <div className="text-sm md:text-base lg:body-16-regular">
                  Publications on violence & health
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-xl md:text-2xl lg:heading-28 font-spectral font-semibold">
                  UNHCR
                </div>
                <div className="text-sm md:text-base lg:body-16-regular">
                  Human rights & protection resources
                </div>
              </div>
              <div className="hidden md:block bg-[#F0B64029] rounded-tl-2xl rounded-bl-2xl p-6 flex-1"></div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-5">
              <div className="hidden md:block bg-[#F0B64029] rounded-tr-2xl rounded-br-2xl p-6 flex-1"></div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-xl md:text-2xl lg:heading-28 font-spectral font-semibold">
                  OECD
                </div>
                <div className="text-sm md:text-base lg:body-16-regular">
                  Policy frameworks on GBV
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-xl md:text-2xl lg:heading-28 font-spectral font-semibold">
                  Safe & Together Institute
                </div>
                <div className="text-sm md:text-base lg:body-16-regular">
                  Family violence & safety insights
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-xl md:text-2xl lg:heading-28 font-spectral font-semibold">
                  UNESCO
                </div>
                <div className="text-sm md:text-base lg:body-16-regular">
                  Gender-based violence & health
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-5">
              <div className="hidden md:block bg-[#F0B64029] rounded-tr-2xl rounded-br-2xl p-6 flex-1"></div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-xl md:text-2xl lg:heading-28 font-spectral font-semibold">
                  Kvinna till Kvinna Foundation
                </div>
                <div className="text-sm md:text-base lg:body-16-regular">
                  They Came Together Not to Be Silenced
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-[#F0B6407A] rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-neutral-10">
                <div className="text-xl md:text-2xl lg:heading-28 font-spectral font-semibold">
                  UNICEF
                </div>
                <div className="text-sm md:text-base lg:body-16-regular">
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
