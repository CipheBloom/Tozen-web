import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-8">
      <header className="mb-8 flex flex-col items-center">
        <Image
          src="/dumbbell.svg"
          alt="tozen Logo"
          width={64}
          height={64}
          className="mb-2"
        />
        <h1 className="text-5xl font-extrabold text-black mb-2 tracking-tight brutalist-title">
          Tozen
        </h1>
        <span className="block text-lg font-semibold text-black/70 mb-4">Your daily movement, made mindful.</span>
        <p className="text-lg text-black/80 max-w-xl text-center mb-2">
          Welcome to <span className="font-bold">Tozen</span> — a modern, mindful fitness companion.
        </p>
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="text-base text-black/80">What you can do with tozen:</span>
          <ul className="text-left text-black/90 text-base font-medium list-disc list-inside">
            <li>Log your daily workouts and track progress on a calendar</li>
            <li>Build and edit your own custom exercises</li>
            <li>View your fitness journey at a glance</li>
            <li>Enjoy a unique, brutalist-inspired interface</li>
            <li>Stay motivated and organized every day</li>
          </ul>
        </div>
      </header>

      <section className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <FeatureCard
          title="Workouts"
          description="Log your daily workouts, view your history on a calendar, and track your progress over time."
          href="/workouts"
          icon="/workout.svg"
        />
        <FeatureCard
          title="Todo"
          description="Stay on top of your fitness tasks and checklists. Never miss a step in your journey."
          href="/todo"
          icon="/todo.svg"
        />
        <FeatureCard
          title="Plans"
          description="Create, organize, and follow custom fitness plans tailored to your goals."
          href="/plans"
          icon="/plans.svg"
        />
        <FeatureCard
          title="Profile"
          description="View and update your personal info, profile image, and more."
          href="/profile"
          icon="/profile.svg"
        />
      </section>

      <footer className="text-black/60 text-sm mt-8">
        &copy; 2024-{new Date().getFullYear()} tozen. Your daily movement, made mindful.
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center border-2 border-black rounded-lg bg-white p-6 shadow-brutal hover:bg-yellow-200 transition-colors"
    >
      <Image src={icon} alt={title} width={40} height={40} className="mb-2" />
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      <p className="text-black/80 text-center text-sm">{description}</p>
    </Link>
  );
}
