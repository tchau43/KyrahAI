export default function TopRated() {
  return (
    <section className="col-span-12 w-full z-50 px-60 py-[7.5rem] bg-neutral rounded-t-2xl mt-16">
      <div className="col-span-12 w-full relative rounded-2xl bg-secondary-3">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left block */}
          <div className="col-span-3 px-20 flex items-center gap-1">
            {/* Vertical email */}
            <span className="text-xl text-neutral-9 self-start font-inter font-semibold tracking-widest [writing-mode:sideways-lr] pt-2">
              safe@kyrah.ai
            </span>

            {/* Award text */}
            <div className="flex flex-col text-neutral-9 gap-2 relative">
              <div className="text-5xl font-extrabold font-spectral leading-[0.8] tracking-[-0.04]">
                BEST <br />
                OF <br />
                OUR <br />
                STATE
              </div>
              <p className="absolute top-40 -right-4 font-spectral font-extrabold tracking-[-4%] uppercase text-right">
                2024 winner
              </p>
            </div>
          </div>

          {/* Right block */}
          <div className="col-span-9 py-[3.75rem] px-20">
            <h3 className="heading-56 text-[3.375rem] text-neutral-9 text-right">
              Rated &quot;Best AI Companion&quot;
            </h3>
            <h3 className="heading-56 text-[3.375rem] text-neutral-9 text-right">
              by our growing community
            </h3>
            <p className="subtitle-20-medium text-neutral-9 text-right pt-5">
              Helping users in 20+ countries find warmth and care, every day
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
