import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    title: "Finally passed my exams",
    quote: "I failed twice before discovering ExamPrep CBT. The detailed explanations helped me understand concepts I'd been struggling with for months.",
    name: "Adebayo O.",
    role: "300 Level Student",
    initials: "AO",
    color: "bg-emerald-500",
  },
  {
    title: "Better than textbooks alone",
    quote: "The mock exams simulate the real CBT environment perfectly. I walked into my exam feeling confident and prepared. Scored 78%!",
    name: "Chidinma O.",
    role: "200 Level Student",
    initials: "CO",
    color: "bg-blue-500",
  },
  {
    title: "Worth every naira",
    quote: "With 700+ questions and explanations for every answer, this platform is an investment in your academic success. I recommend it to everyone.",
    name: "Ibrahim M.",
    role: "400 Level Student",
    initials: "IM",
    color: "bg-violet-500",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            What Students Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join hundreds of students who have transformed their exam preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h3 className="font-heading font-semibold text-sm mb-2">{t.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}