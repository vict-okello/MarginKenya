import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { sportsArticles } from "../data/sportsArticles";
import NotFoundMessage from "../components/NotFoundMessage";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

function SportsArticle() {
  const { articleId } = useParams();
  const article = Object.values(sportsArticles).find((item) => item.id === articleId);

  if (!article) {
    return <NotFoundMessage backTo="/sports" backLabel="Back to Sports" />;
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="bg-[#d8d8dc] px-4 py-10"
    >
      <div className="mx-auto w-full max-w-5xl">
        <MotionWrap
          className="overflow-hidden rounded"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <MotionImage
            src={article.image}
            alt={article.title}
            className="w-full object-contain"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>
        <MotionTitle
          className="pt-6 text-4xl font-semibold text-black"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
        >
          {article.title}
        </MotionTitle>
        <MotionText
          className="pt-3 text-black/75"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        >
          {article.summary}
        </MotionText>
        <MotionText
          className="pt-4 text-black/80"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
        >
          {article.body}
        </MotionText>
      </div>
    </MotionSection>
  );
}

export default SportsArticle;
