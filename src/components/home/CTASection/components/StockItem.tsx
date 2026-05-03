import * as motion from "motion/react-client";

interface StockItemProps {
  name: string;
  profit: string;
  isPositive: boolean;
  animationDelay: number;
  width?: number;
}

export const StockItem = (props: StockItemProps) => {
  const { name, profit, isPositive, animationDelay, width } = props;
  return (
    <motion.div
      whileHover={{
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: "0.5rem",
        transition: { duration: 0.2 },
      }}
      className="p-2"
    >
      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 12,
            },
          },
        }}
        className="flex justify-between"
      >
        <div>
          <div className="mb-1 text-sm opacity-70">Stock</div>
          <div className="font-medium">{name}</div>
        </div>
        <div className="text-right">
          <div className="mb-1 text-sm opacity-70">Profit</div>
          <motion.div
            className={`font-medium ${isPositive ? "text-green-400" : "text-red-400"} flex items-center justify-end`}
          >
            {profit}
          </motion.div>
        </div>
      </motion.div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`relative h-full bg-gradient-to-r ${
            isPositive ? "from-blue-400 to-green-400" : "from-red-400 to-red-500"
          } rounded-full`}
          initial={{ width: 0 }}
          animate={{
            width: `${width}%`,
            transition: {
              duration: 1.2,
              ease: "easeOut",
              delay: animationDelay,
            },
          }}
        >
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StockItem;
