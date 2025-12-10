"use client";

import Link from "next/link";

export default function ProgramsPage() {
  return (
    <section className="max-w-4xl mx-auto py-8 space-y-8">
      <h2 className="text-3xl font-bold mb-4 text-center">Our Programs</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/programs/feeding" className="group">
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-orange-600 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="font-bold text-xl mb-2 group-hover:text-orange-600 transition-colors">
              Feeding Program
            </h3>
            <p className="text-zinc-700 mb-2">
              Nutritious daily meals for hundreds of orphans and at-risk youth.
              Our nutrition centers are at the heart of each community we serve.
            </p>
            <div className="mt-4 text-orange-600 font-medium">Learn More →</div>
          </div>
        </Link>
        <Link href="/programs/healthcare" className="group">
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-green-600 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🏥</div>
            <h3 className="font-bold text-xl mb-2 group-hover:text-green-600 transition-colors">
              Healthcare
            </h3>
            <p className="text-zinc-700 mb-2">
              Essential medical care, health screenings, and preventive
              healthcare for underserved communities.
            </p>
            <div className="mt-4 text-green-600 font-medium">Learn More →</div>
          </div>
        </Link>
        <Link href="/programs/education" className="group">
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-blue-600 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors">
              Education
            </h3>
            <p className="text-zinc-700 mb-2">
              From primary school to job training, we empower kids with learning
              and skills for a better tomorrow.
            </p>
            <div className="mt-4 text-blue-600 font-medium">Learn More →</div>
          </div>
        </Link>
        <Link href="/programs/shelter" className="group">
          <div className="bg-white rounded-xl shadow p-6 border-t-4 border-purple-600 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 transition-colors">
              Safe Housing
            </h3>
            <p className="text-zinc-700 mb-2">
              We ensure every child has shelter, care, and a supportive
              environment as they grow, learn, and heal.
            </p>
            <div className="mt-4 text-purple-600 font-medium">Learn More →</div>
          </div>
        </Link>
      </div>
    </section>
  );
}
