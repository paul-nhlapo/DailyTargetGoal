import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Daily Target Goal</h1>
        <p className="text-xl text-slate-300 mb-8">Timebox your day into a focused X-hour window</p>
        <Link className="btn text-lg px-6 py-3" href="/login">Get Started →</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold mb-2">Daily Planning</h3>
          <p className="text-sm text-slate-300">Focus your day from midnight to 4 PM. Plan what matters most.</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-semibold mb-2">Task Management</h3>
          <p className="text-sm text-slate-300">Create, schedule, and track your daily tasks with ease.</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">⏱️</div>
          <h3 className="font-semibold mb-2">Time Blocking</h3>
          <p className="text-sm text-slate-300">Adjust task times in 15-minute increments to optimize your schedule.</p>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold">1</div>
            <div>
              <h4 className="font-semibold mb-1">Create Your Account</h4>
              <p className="text-sm text-slate-300">Sign up with your email to get started. Your data is securely stored.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold">2</div>
            <div>
              <h4 className="font-semibold mb-1">Add Your Tasks</h4>
              <p className="text-sm text-slate-300">List everything you want to accomplish today. Keep it simple.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold">3</div>
            <div>
              <h4 className="font-semibold mb-1">Schedule Your Day</h4>
              <p className="text-sm text-slate-300">Use the +15m/-15m buttons to adjust task timing within your 16-hour window.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-bold">4</div>
            <div>
              <h4 className="font-semibold mb-1">Stay Focused</h4>
              <p className="text-sm text-slate-300">Execute your plan and check off tasks as you complete them.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link className="btn text-lg px-6 py-3" href="/login">Start Planning Your Day →</Link>
      </div>
    </div>
  )
}
