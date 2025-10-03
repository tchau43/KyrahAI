import { CloseQuoteIcon, OpenQuoteIcon } from '../icons';

export default function Quote() {
  return (
    <div className="rounded-2xl bg-secondary-3 py-6 px-13.5 relative">
      <div className="absolute top-0 left-0 transform -translate-y-1/2 -translate-x-1/2">
        <OpenQuoteIcon />
      </div>
      <div className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/2">
        <CloseQuoteIcon />
      </div>
      <div className="font-spectral font-medium italic text-2xl leading-[1.3] tracking-tighter text-center">
        Our vision is a safer digital world where technology doesn&apos;t just
        connect us, it protects us.
      </div>
    </div>
  );
}
