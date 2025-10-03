export default function SupportedSection() {
  return (
    <section className="col-span-12 w-full md:px-80 px-60 bg-neutral pt-28 pb-20">
      <div className="bg-secondary-3 rounded-3xl flex flex-row gap-1.5 p-10 justify-between">
        <div className="flex flex-col gap-0.5 w-1/4 items-center">
          <div className="text-neutral-9 heading-54">10000+</div>
          <div className="body-18-regular text-neutral-9">Users supported</div>
        </div>
        <div className="flex flex-col gap-0.5 w-1/4 items-center">
          <div className="text-neutral-9 heading-54">20+</div>
          <div className="body-18-regular text-neutral-9">
            Countries reached
          </div>
        </div>
        <div className="flex flex-col gap-0.5 w-1/4 items-center">
          <div className="text-neutral-9 heading-54">50+</div>
          <div className="body-18-regular text-neutral-9">
            Expert collaborators
          </div>
        </div>
        <div className="flex flex-col gap-0.5 w-1/4 items-center">
          <div className="text-neutral-9 heading-54">Countless</div>
          <div className="body-18-regular text-neutral-9">
            Safer conversations every day
          </div>
        </div>
      </div>
    </section>
  );
}
