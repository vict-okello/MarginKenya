import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { latestNewsArticles } from "../data/latestNewsArticles";
import NotFoundMessage from "../components/NotFoundMessage";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

function LatestNewsArticle() {
  const { articleId } = useParams();
  const article = latestNewsArticles.find((item) => item.id === articleId);
  const isSportsImage = article?.category === "Sports";

  if (!article) {
    return <NotFoundMessage backTo="/" backLabel="Back to Home" />;
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="bg-[#d8d8dc] px-4 py-10"
    >
      <div className="mx-auto w-full max-w-5xl">
        <MotionWrap
          className="overflow-hidden rounded bg-gradient-to-b from-[#e4e7ec] to-[#cfd4db]"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MotionImage
            src={article.image}
            alt={article.title}
            className={`h-[260px] w-full md:h-[430px] ${
              isSportsImage ? "object-contain p-3 md:p-6" : "object-cover"
            }`}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>
        <MotionText
          className="pt-5 text-sm text-black/65"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          {article.category} - {article.date}
        </MotionText>
        <MotionTitle
          className="pt-2 text-4xl font-semibold text-black"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          {article.title}
        </MotionTitle>
        <MotionText
          className="pt-4 text-lg text-black/75"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
        >
          {article.summary}
        </MotionText>
        <MotionText
          className="pt-4 text-black/80"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.36 }}
        >
          {article.body}
        </MotionText>
      </div>
    </MotionSection>
  );
}

export default LatestNewsArticle;
