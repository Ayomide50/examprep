import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/FadeIn";

const faqs = [
  {
    question: "How do I get access after payment?",
    answer: "After making payment via bank transfer, send your payment proof and registered email to the admin on WhatsApp. Once verified, the admin will send you a unique activation code. Enter the code on the Activate page in your dashboard, and you'll instantly unlock full access.",
  },
  {
    question: "What is an Activation Code?",
    answer: "An activation code is a unique 12-character code (e.g., EXP-8K4M-92P1) that unlocks premium access to all courses and features on the platform. Each code can only be used once and is tied to your account.",
  },
  {
    question: "How long does my subscription last?",
    answer: "Your subscription duration depends on the access period tied to your activation code. Most students receive full-time access covering an entire academic session. The admin will confirm your specific duration when sending your code.",
  },
  {
    question: "What is the difference between Practice Mode and Mock Exam?",
    answer: "Practice Mode lets you answer questions one at a time with instant feedback and detailed explanations after each question. Mock Exam simulates a real CBT test environment with a timer, no explanations until the end, and a full score report when you finish.",
  },
  {
    question: "Can I try the platform before subscribing?",
    answer: "Yes! Every registered user gets 3 free practice questions per course — no payment required. This lets you experience the platform and see the quality of our questions and explanations before committing to a subscription.",
  },
  {
    question: "Can I access the platform on my phone?",
    answer: "Absolutely. MyStudyApp is fully mobile-responsive and works smoothly on smartphones, tablets, and desktop computers. Practice anywhere, anytime with the same great experience on any device.",
  },
  {
    question: "What if I lose my activation code?",
    answer: "Don't worry — once your code is activated, it's permanently linked to your account and you won't need it again. If you lose it before activation, simply contact the admin on WhatsApp with your payment proof, and they'll resend your code.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sm font-semibold text-primary">FAQ</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about MyStudyApp
          </p>
        </FadeIn>

        <StaggerGroup className="space-y-3" stagger={0.08}>
          {faqs.map((faq, i) => (
            <StaggerItem key={i}>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-sm md:text-base text-gray-800">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 ml-4 transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}