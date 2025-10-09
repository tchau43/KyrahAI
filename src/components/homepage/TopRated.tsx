export default function TopRated() {
  return (
    <section className="col-span-12 w-full z-50 py-[7.5rem] bg-neutral rounded-t-3xl mt-16">
      <div className="w-[87.5%] xl:w-[80%] 2xl:w-[70%] max-w-7xl mx-auto">
        <div className="col-span-12 relative rounded-2xl bg-secondary-3">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Left block */}
            <div className="col-span-12 md:col-span-3 xl:col-span-3 px-6 md:px-8 xl:px-20 flex items-center gap-1">
              {/* Vertical email */}
              <span className="text-[0.75rem] xl:!text-xl text-neutral-9 self-start font-inter font-semibold tracking-[0] xl:tracking-[-0.07] [writing-mode:sideways-lr] xl:pt-2">
                Ask@Kyrah.AI
              </span>

              {/* Award text */}
              <div className="flex flex-col text-neutral-9 gap-2 relative">
                <div className="text-[1.25rem] md:!text-[1.5rem] xl:!text-5xl font-extrabold font-spectral leading-[0.9] xl:leading-[0.8] tracking-[-0.04rem]">
                  BEST <br />
                  OF <br />
                  OUR <br />
                  STATE
                </div>
                <p className="absolute md:top-22 md:!left-0 xl:!top-40 xl:!-right-4 font-spectral font-extrabold tracking-[-0.04rem] uppercase text-right whitespace-nowrap">
                  2024 winner
                </p>
              </div>
            </div>

            {/* Right block */}
            <div className="col-span-12 md:col-span-9 xl:col-span-9 py-8 md:py-12 lg:py-[3.75rem] px-6 md:px-8 xl:px-20">
              <h3 className="heading-28 md:!text-[2rem] xl:!text-[3.375rem] xl:!tracking-[-0.06rem] xl:!leading-[1.1] text-neutral-9 text-right">
                Rated &quot;Best AI Companion&quot;
              </h3>
              <h3 className="heading-28 md:!text-[2rem] xl:!text-[3.375rem] xl:!tracking-[-0.06rem] xl:!leading-[1.1] text-neutral-9 text-right">
                by our growing community
              </h3>
              <p className="caption-14-semi xl:!text-[1.125rem] xl:!leading-[1.6] xl:!text-medium text-neutral-9 text-right pt-5">
                Helping users in 20+ countries find warmth and care, every day
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
