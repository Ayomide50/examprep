import React from "react";

const testimonials = [
  {
    title: "Finally passed my exams",
    quote: "I failed twice before discovering ExamPrep CBT. The detailed explanations helped me understand concepts I'd been struggling with for months.",
    name: "Adebayo Ogunlesi",
    role: "300 Level Student",
    color: "bg-green-500",
  },
  {
    title: "Better than textbooks alone",
    quote: "The mock exams simulate the real CBT environment perfectly. I walked into my exam feeling confident and prepared. Scored 78%!",
    name: "Chidinma Okafor",
    role: "200 Level Student",
    color: "bg-blue-500",
  },
  {
    title: "Worth every naira",
    quote: "With 700+ questions and explanations for every answer, this platform is an investment in your academic success. I recommend it to everyone.",
    name: "Ibrahim Mohammed",
    role: "400 Level Student",
    color: "bg-orange-500",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
            What Students Say
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card border border-border/60 rounded-xl p-6 hover:shadow-md transition-shadow">
              <h3 className="font-heading font-semibold mb-3">{t.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
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