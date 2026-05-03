import * as motion from "motion/react-client";

export const EnhancedCard = () => {
  return (
    <motion.div
      className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-lg lg:p-10"
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
    >
      {/* Centered title */}
      <motion.h3
        className="mb-4 text-center text-xl font-bold text-gray-100"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        viewport={{ once: true }}
      >
        Our Story
      </motion.h3>

      {/* Quote */}
      <blockquote className="relative mb-8 text-xl font-light italic md:text-2xl">
        <motion.span
          className="text-4xl text-blue-400"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          &quot;
        </motion.span>
        <span>
          &nbsp;I built PsxWorth because I needed a tool that truly{" "}
          <span className="inline-block font-medium text-blue-400">understands</span> the unique challenges Pakistani
          investors face.
        </span>

        <motion.span
          className="text-4xl text-blue-400"
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
        >
          &quot;
        </motion.span>
      </blockquote>

      {/* Body copy with highlighted terms */}
      <motion.p
        className="mb-8 leading-relaxed text-slate-300"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        viewport={{ once: true }}
      >
        Managing my own stocks Portfolio, I struggled to track my total investment and actual profit/loss. Existing
        tools were lacking or unfairly priced. So, I built PsxWorth to offer investors the clarity I wished I had.
      </motion.p>

      {/* Team member with hover effect */}
      <motion.div
        className="group flex items-center"
        whileHover={{ x: 8 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="relative mr-5">
          <motion.div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-500"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.span className="text-xl font-bold" initial={{ opacity: 1 }} whileHover={{ opacity: 0 }}>
              WG
            </motion.span>
            <motion.img
              src="/founder.webp"
              alt="Founder Image"
              className="absolute inset-0 h-full w-full object-cover md:opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-full"
            />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-slate-900 bg-green-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div>
          <motion.p
            className="font-medium"
            animate={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            Wajahat Gul
          </motion.p>
          <motion.p
            className="text-sm text-blue-400 opacity-80"
            initial={{ color: "#60a5fa" }}
            whileHover={{ color: "#93c5fd" }}
          >
            Founder & Developer
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};
