"use client";

import { BackToHome } from "../_components/BackNavigation";

export default function AboutPage() {
  return (
    <section className="max-w-3xl mx-auto py-8">
      <BackToHome className="mb-6" />
      <h2 className="text-3xl font-bold mb-4 text-center">About Us</h2>
      <p className="mb-6 text-lg text-zinc-700 text-center">
        Haitian Family Relief Project is a nonprofit organization dedicated to
        nourishing, educating, and empowering orphaned children in Haiti and
        uplifting whole communities.
      </p>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
        <p className="text-zinc-700">
          To provide relief and support to families in need through building
          homes, mobile clinics, feeding those in need, and supplying medical
          equipment and life essentials, educational programs for kids.
        </p>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Our Story</h3>
        <p className="text-zinc-700">
          Founded in 2018 by a coalition of Haitian-American families and global
          supporters, we saw the urgent need for consistent, loving care for
          orphans affected by poverty and disaster. Our grassroots beginnings
          have grown into a broad network with local partnerships and community
          support.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Our Leadership</h3>
        <ul className="space-y-3">
          <li className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
            <span className="font-bold">Whitney A Regis</span>, Executive Director
          </li>
          <li className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
            <span className="font-bold">Marie jean Baptiste</span>, Program Lead
          </li>
          <li className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
            <span className="font-bold">Marcdala Morose</span>, Program Lead
          </li>
          <li className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-600">
            <span className="font-bold">Pr. Deniçon Jean Charles</span>, Chef Operator Officer
          </li>
          <li className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-600">
            <span className="font-bold">Widner Regis</span>, Founder/CEO
          </li>
        </ul>
      </div>
    </section>
  );
}
