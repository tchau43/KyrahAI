'use client';


interface MessageListSkeletonProps {
  messageCount?: number;
}

export default function MessageListSkeleton({
  messageCount = 4
}: MessageListSkeletonProps) {
  return (
    <>
      <div
        className="flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges]"
        role="status"
        aria-label="Loading messages"
        aria-busy="true"
      >
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 py-4 md:py-6 pb-[180px] md:pb-[200px] lg:pb-[220px]">
          <div className="max-w-full md:max-w-2xl lg:max-w-3xl xl:max-w-3xl mx-auto pb-25 pt-25">
            {Array.from({ length: messageCount }).map((_, index) => {
              const isUser = index % 2 === 0;

              return (
                <div key={index} className="flex flex-col mb-4">
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2 gap-3 `}>
                    {isUser ? (
                      <div className="w-[40%]">
                        <div className="py-3">
                          <div className="space-y-2 flex flex-col items-end">
                            <div className="h-4 md:h-6 bg-neutral-7 animate-pulse w-full rounded-lg"></div>
                            <div className="h-4 md:h-6 bg-neutral-7 animate-pulse w-[80%] rounded-lg"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="space-y-2">
                          <div className="h-4 md:h-6 bg-neutral-3 animate-pulse w-8/9 rounded-lg"></div>
                          <div className="h-4 md:h-6 bg-neutral-3 animate-pulse w-5/6 rounded-lg"></div>
                          <div className="h-4 md:h-6 bg-neutral-3 animate-pulse w-2/3 rounded-lg"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pb-3 md:pb-4 lg:pb-6 bg-neutral">
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="max-w-full md:max-w-2xl lg:max-w-3xl xl:max-w-3xl mx-auto">
            <div
              className={`w-full bg-white border border-neutral-3 shadow-lg rounded-full
                p-2 md:p-[0.625rem] min-h-[2.25rem] flex items-center`}
            >
              <textarea
                aria-label="Message input"
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none outline-none caption-14-regular md:!text-[16px] text-neutral-9 placeholder:text-neutral-5 bg-transparent max-h-[9rem] overflow-y-auto pl-3 md:pl-4"
              />
            </div>
            <p className="caption-12-regular md:!text-[14px] text-neutral-6 text-center mt-1.5 md:mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
