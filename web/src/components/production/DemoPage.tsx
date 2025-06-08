"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function DemoPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // In a real scenario, you'd send this to your waitlist service
    console.log("Waitlist signup:", email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Prepilot</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your AI-powered exam preparation companion
          </p>
          <div className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-sm font-medium">
            📚 Coming Soon
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded shadow-xl p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Ace Your Exams with Confidence
                </h2>
                <p className="text-gray-600 mb-6">
                  Prepilot is an intelligent exam preparation platform that
                  helps students study smarter, not harder. Built with AI to
                  create personalized study plans, practice tests, and
                  interactive learning experiences tailored to your exam goals.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-primary mr-3">✓</span>
                    AI-generated personalized study plans
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-3">✓</span>
                    Comprehensive practice tests and mock exams
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-3">✓</span>
                    Interactive flashcards and memory techniques
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-3">✓</span>
                    Progress tracking and performance analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-3">✓</span>
                    Expert study tips and exam strategies
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded p-8 text-white text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold mb-2">
                  Study Smart, Not Hard
                </h3>
                <p className="text-primary-foreground/90 text-sm">
                  We&apos;re crafting the ultimate exam prep experience. Every
                  feature is being designed with student success in mind, backed
                  by proven learning methodologies.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded p-6 shadow-lg text-center">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Study Plans
              </h3>
              <p className="text-gray-600 text-sm">
                Personalized schedules that adapt to your exam dates and
                learning pace
              </p>
            </div>
            <div className="bg-white rounded p-6 shadow-lg text-center">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Practice Tests
              </h3>
              <p className="text-gray-600 text-sm">
                Realistic exam simulations with detailed explanations and
                scoring
              </p>
            </div>
            <div className="bg-white rounded p-6 shadow-lg text-center">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smart Flashcards
              </h3>
              <p className="text-gray-600 text-sm">
                AI-powered spaced repetition to maximize retention and recall
              </p>
            </div>
          </div>

          {/* Waitlist Section */}
          <div className="bg-white rounded shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join the Waitlist for Early Access
            </h3>
            <p className="text-gray-600 mb-8">
              Be among the first students to experience the future of exam
              preparation. Get exclusive early access and special launch
              pricing.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Join Waitlist
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Perfect for high school, college, and professional
                  certification exams
                </p>
              </form>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <div>
                      <p className="font-semibold">You&apos;re on the list!</p>
                      <p className="text-sm">
                        We&apos;ll notify you when Prepilot launches.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-gray-500">
            <p className="mb-4">
              Questions? Reach out to us at{" "}
              <a
                href="mailto:hello@prepilot.com"
                className="text-primary hover:underline"
              >
                hello@prepilot.com
              </a>
            </p>
            <div className="flex justify-center text-sm space-x-6">
              <a href="#" className="hover:text-gray-700 hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-700 hover:underline">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-700 hover:underline">
                Contact
              </a>
            </div>
            <p className="text-xs mt-4">
              © {new Date().getFullYear()} Prepilot. Empowering students to
              achieve their academic goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
