'use client';

export default function MailConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-neutral">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-neutral-2">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-primary"
          >
            <path d="M1.5 8.67v8.58A2.25 2.25 0 003.75 19.5h16.5a2.25 2.25 0 002.25-2.25V8.67l-8.708 5.232a3.75 3.75 0 01-3.784 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75A2.25 2.25 0 0020.25 4.5H3.75A2.25 2.25 0 001.5 6.75v.158l9.158 5.5a2.25 2.25 0 002.184 0L22.5 6.908z" />
          </svg>
        </div>
        <h1 className="heading-32 text-neutral-9 mb-2">Check your email</h1>
        <p className="body-16-regular text-neutral-7 mb-6">
          We have sent a confirmation link to your email. Please open the link to
          verify your account.
        </p>
        <div className="text-neutral-6 text-sm space-y-2">
          <p>If you don’t see the email, check your spam folder.</p>
          <p>Still no email? Try signing up again or use a different address.</p>
        </div>
      </div>
    </div>
  );
}


