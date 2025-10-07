import HowItWorksCard from '../cards/HowItWorksCard';

const cardsData = [
  {
    step: '01',
    title: 'Detect',
    description:
      'By detecting hidden cues in language like stress or manipulation, Kyrah.ai brings forward signals that usually go unnoticed.',
    imageSrc: '/reading.svg',
    imageAlt: 'Reading',
    backgroundColor: 'bg-secondary-3',
  },
  {
    step: '02',
    title: 'Support',
    description:
      'As patterns emerge, Kyrah delivers safe guidance and practical choices—designed to bring clarity and keep you empowered.',
    imageSrc: '/doggie.svg',
    imageAlt: 'Support',
    backgroundColor: 'bg-primary',
  },
  {
    step: '03',
    title: 'Empower',
    description:
      'Kyrah.ai turns awareness into action—offering resources, guidance, and steps to protect yourself before harm escalates.',
    imageSrc: '/swing.svg',
    imageAlt: 'Empower',
    backgroundColor: 'bg-secondary-2',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="col-span-12 w-full grid grid-cols-12 gap-10 bg-neutral rounded-t-3xl z-60 py-40"
    >
      <div className="w-[87.5%] xl:w-[80%] max-w-21xl mx-auto col-span-12">
        <div className="flex flex-col gap-8 col-span-6 text-neutral-9">
          <div className="body-18-semi">How It Works</div>
          <div className="heading-54">Healing shouldn&apos;t be confusing</div>
        </div>
        <div className="grid grid-cols-12 gap-8 mt-10">
          {cardsData.map((card, index) => (
            <HowItWorksCard
              key={index}
              step={card.step}
              title={card.title}
              description={card.description}
              imageSrc={card.imageSrc}
              imageAlt={card.imageAlt}
              backgroundColor={card.backgroundColor}
              isFirst={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
