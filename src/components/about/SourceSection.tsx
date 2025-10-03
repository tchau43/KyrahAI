export default function SourceSection() {
  return (
    <section className="bg-neutral-1 col-span-12 w-full">
      <div className="md:px-80 px-60 py-30 bg-neutral rounded-t-3xl">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div className="flex flex-col gap-2.5 w-1/3">
              <div className="body-18-semi">Sources We Rely On</div>
              <div className="heading-54">Grounded in Global Evidence</div>
            </div>
            <div className="flex flex-col items-end self-center text-right font-spectral font-extrabold text-[2rem] tracking-tighter text-neutral-8 leading-8 border-r-4 pr-2 border-secondary-3 h-max">
              <div>Trusted</div>
              <div>Proven</div>
              <div>Reliable</div>
            </div>
          </div>
          <div className="py-16 flex flex-col gap-4">
            <div className="flex gap-5">
              <div className="flex flex-col gap-2 w-max bg-[#F0B6407A] rounded-2xl p-6 text-neutral-10">
                <div className="heading-28">UN Women</div>
                <div className="body-16-regular">
                  Global Database on Violence Against Women
                </div>
              </div>
              <div className="flex flex-col gap-2 w-max bg-[#F0B6407A] rounded-2xl p-6 text-neutral-10">
                <div className="heading-28">WHO</div>
                <div className="body-16-regular">
                  Publications on violence & health
                </div>
              </div>
              <div className="flex flex-col gap-2 w-max bg-[#F0B6407A] rounded-2xl p-6 text-neutral-10">
                <div className="heading-28">UNHCR</div>
                <div className="body-16-regular">
                  Human rights & protection resources
                </div>
              </div>
              <div className="bg-[#F0B64029] rounded-tl-2xl rounded-bl-2xl p-6 flex-1"></div>
            </div>
            <div className="flex gap-5">
              <div className="bg-[#F0B64029] rounded-tr-2xl rounded-br-2xl p-6 flex-1"></div>
              <div className="flex flex-col gap-2 w-max bg-[#F0B6407A] rounded-2xl p-6 text-neutral-10">
                <div className="heading-28">OECD</div>
                <div className="body-16-regular">Policy frameworks on GBV</div>
              </div>
              <div className="flex flex-col gap-2 w-max bg-[#F0B6407A] rounded-2xl p-6 text-neutral-10">
                <div className="heading-28">Safe & Together Institute</div>
                <div className="body-16-regular">
                  Family violence & safety insights
                </div>
              </div>
              <div className="flex flex-col gap-2 w-max bg-[#F0B6407A] rounded-2xl p-6 text-neutral-10">
                <div className="heading-28">UNESCO</div>
                <div className="body-16-regular">
                  Gender-based violence & health
                </div>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="bg-[#F0B64029] rounded-tr-2xl rounded-br-2xl p-6 flex-1"></div>
              <div className="flex flex-col gap-2 w-max bg-[#F0B6407A] rounded-2xl p-6 text-neutral-10">
                <div className="heading-28">Kvinna till Kvinna Foundation</div>
                <div className="body-16-regular">
                  They Came Together Not to Be Silenced
                </div>
              </div>
              <div className="flex flex-col gap-2 w-max bg-[#F0B6407A] rounded-2xl p-6 text-neutral-10">
                <div className="heading-28">UNICEF</div>
                <div className="body-16-regular">
                  Guidance on school & emergency violence prevention
                </div>
              </div>
              <div className="bg-[#F0B64029] rounded-tl-2xl rounded-bl-2xl p-6 flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
