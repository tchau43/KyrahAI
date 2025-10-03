import {
  BlackHeartIcon,
  CommentIcon,
  InstaKyrahIcon,
  RedHeartIcon,
  SaveIcon,
  SendIcon,
  ThreeDotIcon,
} from '../icons';
import Image from 'next/image';

export default function InstaCard() {
  return (
    <div className="col-span-4 col-start-9 bg-neutral rounded-lg px-4 pt-4 pb-6 flex flex-col gap-3 rotate-3">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <InstaKyrahIcon />
          <div className="body-18-regular">kyrah.ai</div>
        </div>
        <div className="px-[0.266rem] py-[0.641rem]">
          <ThreeDotIcon />
        </div>
      </div>
      <div className="w-full h-[367px] relative bg-secondary-3 border border-neutral-2">
        <Image
          src="/loving.svg"
          alt="loving"
          fill
          className="object-contain pb-[0.907rem]"
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <div className="px-[0.167rem] py-[0.264rem]">
            <RedHeartIcon />
          </div>
          <div className="p-[0.219rem]">
            <CommentIcon />
          </div>
          <div className="p-[0.237rem]">
            <SendIcon />
          </div>
        </div>
        <div className="py-[0.219rem] px-[0.364rem]">
          <SaveIcon />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-1 items-center">
          <div className="py-[0.171rem] px-[0.104rem]">
            <BlackHeartIcon />
          </div>
          <div className="body-16-regular">361 likes</div>
        </div>
        <div className="body-16-regular">
          Kyrah.ai exists to confront a hidden crisis — the early signs of abuse
          and manipulation too often overlooked.
        </div>
        <div className="caption-14-regular flex gap-2 items-center text-[#2587C4]">
          <div>#KyrahAI</div>
          <div>#EndAbuse</div>
          <div>#EmotionalWellbeing</div>
        </div>
      </div>
    </div>
  );
}
