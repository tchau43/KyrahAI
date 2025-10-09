import Image from 'next/image';

interface BlogCardProps {
  imageSrc: string;
  category: string;
  title: string;
  description: string;
}

export default function BlogCard({
  imageSrc,
  category,
  title,
  description,
}: BlogCardProps) {
  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Image Container */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden ${imageSrc === '/blog-2.jpg' ? 'h-80' : 'h-72'}`}
      >
        <Image
          src={imageSrc}
          alt={title}
          width={500}
          height={300}
          className={`w-full object-cover h-full`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <div className="caption-14-regular text-neutral-9">{category}</div>
        <h3 className="font-spectral font-semibold text-[1.5rem] leading-[110%] tracking-[-0.04rem] md:!text-[1.75rem] md:!tracking-[-0.06rem] text-neutral-9">{title}</h3>
        <p className="caption-16-regular text-neutral-8 line-clamp-2 md:line-clamp-2 xl:line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  );
}
