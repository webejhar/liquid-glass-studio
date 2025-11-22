import { motion } from "framer-motion";
import { Calendar, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "10 UI/UX Design Trends for 2025",
    excerpt:
      "Explore the latest design trends shaping the digital landscape this year.",
    date: "January 15, 2025",
    author: "RAHATUL ISLAM",
    category: "Design",
  },
  {
    title: "Mastering Elementor Pro: Advanced Techniques",
    excerpt:
      "Take your WordPress development to the next level with these pro tips.",
    date: "January 10, 2025",
    author: "RAHATUL ISLAM",
    category: "Development",
  },
  {
    title: "Building Scalable React Applications",
    excerpt:
      "Best practices for structuring and scaling modern React projects.",
    date: "January 5, 2025",
    author: "RAHATUL ISLAM",
    category: "Development",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen pt-32 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Latest <span className="text-primary">Insights</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Articles, tutorials, and thoughts on design & development
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <motion.article
              key={i}
              className="glass-card rounded-2xl overflow-hidden hover:scale-105 transition group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-6xl font-bold opacity-50">
                  {post.title[0]}
                </span>
              </div>
              <div className="p-6">
                <span className="text-xs px-3 py-1 rounded-full glass-card inline-block mb-3">
                  {post.category}
                </span>
                <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition">
                  {post.title}
                </h2>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </span>
                </div>
                <button className="flex items-center gap-2 text-primary hover:gap-3 transition-all">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
