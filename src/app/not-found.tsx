import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="bg-[#09090b] text-[#f3f3f3]">
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center px-4">
            {/* 404 Number */}
            <h1 className="text-[150px] sm:text-[200px] font-bold leading-none text-[#27272a] select-none">
              404
            </h1>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-[#f3f3f3] mb-4 -mt-8">
              Page Not Found
            </h2>

            {/* Description */}
            <p className="text-[#a5a5a5] text-base mb-8 max-w-md mx-auto">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has
              been moved.
            </p>

            {/* Action Button */}
            <Link
              href="/en"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-button-text font-medium rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
