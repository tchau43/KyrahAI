import ResourceCard from './cards/ResourceCard';

const resourcesData = [
  {
    title: 'UNFPA GBV Dashboard',
    description: 'Country-level data and resources on gender-based violence',
  },
  {
    title: 'UNHCR GBV Toolkit',
    description:
      'Guidance, tools, and resource lists for survivors and responders',
  },
  {
    title: 'Befrienders Worldwide',
    description: 'International suicide prevention hotlines at befrienders.org',
  },
];

export default function ResourceSection() {
  return (
    <section className="col-span-12 w-full grid grid-cols-12 gap-10 bg-secondary-1 z-60 px-60 py-30 items-stretch">
      <div className="col-span-6 flex flex-col gap-7.5">
        <div className="body-18-semi text-neutral">Resources & Hotlines</div>
        <div className="heading-54 text-neutral">Find Safety, Find Support</div>
      </div>
      <div className="col-span-6 pl-10 pt-5 flex flex-col justify-between">
        <div className="subtitle-20-regular text-neutral">
          <span className="font-spectral font-bold text-2xl">
            <i>Kyrah.ai</i>
          </span>{' '}
          is not a medical, clinical, or emergency service. It is designed only
          to raise awareness of potential emotional risks in communication.
          <br />
          <br />
          <span>
            If you or someone you know is in immediate danger, please call{' '}
            <span className="font-bold">911 (U.S.)</span> or your local
            emergency number right away.
          </span>
        </div>
        <button className="body-18-semi w-max rounded-full border border-neutral text-neutral px-6 py-2.5 mt-10 cursor-pointer">
          Find your local 24/7 confidential support
        </button>
      </div>
      <div className="flex flex-col gap-6 col-span-12">
        <div className="subtitle-22 pt-15 text-neutral">Global Resources</div>
        <div className="grid grid-cols-9 gap-10">
          {resourcesData.map((resource, index) => (
            <ResourceCard
              key={index}
              title={resource.title}
              description={resource.description}
              isFirst={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
