'use client';

export default function ProgramsPage() {
  return (
    <section className="max-w-4xl mx-auto py-8 space-y-8">
      <h2 className="text-3xl font-bold mb-4 text-center">Our Programs</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-blue-600 text-center">
          <h3 className="font-bold text-xl mb-2">Food & Nutrition</h3>
          <p className="text-zinc-700 mb-2">Nutritious daily meals for hundreds of orphans and at-risk youth. Our nutrition centers are at the heart of each community we serve.</p>
          <div className="h-24 bg-zinc-100 rounded" />
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-red-600 text-center">
          <h3 className="font-bold text-xl mb-2">Safe Housing</h3>
          <p className="text-zinc-700 mb-2">We ensure every child has shelter, care, and a supportive environment as they grow, learn, and heal.</p>
          <div className="h-24 bg-zinc-100 rounded" />
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-zinc-500 text-center">
          <h3 className="font-bold text-xl mb-2">Education & Mentorship</h3>
          <p className="text-zinc-700 mb-2">From primary school to job training, we empower kids with learning and skills for a better tomorrow.</p>
          <div className="h-24 bg-zinc-100 rounded" />
        </div>
      </div>
      <div className="mt-6 text-center text-zinc-600">
        <span>Photos, statistics, and more program details coming soon.</span>
      </div>
    </section>
  );
}
