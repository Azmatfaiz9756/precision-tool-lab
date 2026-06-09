import React from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const FEATURED_REVIEWS = [
  {
    name: "Ahmed K.",
    rating: 5,
    text: "Best precision toolkit I've used in Dubai. The quality of the bits is exceptional — perfect for iPhone and Samsung repairs.",
    location: "Dubai",
  },
  {
    name: "Mohammad R.",
    rating: 5,
    text: "Same day delivery was amazing. Ordered at 10am, had my soldering kit by 3pm. Great quality tools for the price.",
    location: "Abu Dhabi",
  },
  {
    name: "Fatima S.",
    rating: 4,
    text: "The complete repair kit has everything I need for my phone repair shop. Highly recommend for any technician in the UAE.",
    location: "Sharjah",
  },
];

export default function ReviewsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="font-heading font-bold text-2xl md:text-3xl">Trusted by UAE Technicians</h2>
        <p className="text-muted-foreground text-sm mt-1">Real reviews from professional repair technicians</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_REVIEWS.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="bg-card border border-border rounded-lg p-6 relative"
          >
            <Quote className="h-8 w-8 text-primary/10 absolute top-4 right-4" />
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className={`h-3.5 w-3.5 ${j < review.rating ? "text-primary fill-primary" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{review.text}"</p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{review.name[0]}</span>
              </div>
              <div>
                <p className="text-sm font-semibold">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}