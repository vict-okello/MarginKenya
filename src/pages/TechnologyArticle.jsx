import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { technologyArticles } from "../data/technologyArticles";
import NotFoundMessage from "../components/NotFoundMessage";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

function TechnologyArticle() {
  const { articleId } = useParams();
  const article = technologyArticles.find((item) => item.id === articleId);

  if (!article) {
    return <NotFoundMessage backTo="/technology" backLabel="Back to Technology" />;
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
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MotionImage
            src={article.image}
            alt={article.title}
            className="h-[240px] w-full object-cover object-center md:h-[360px] lg:h-[420px]"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>

        <MotionTitle
          className="pt-6 text-4xl font-semibold text-black"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
        >
          {article.title}
        </MotionTitle>

        <MotionText
          className="pt-3 text-sm text-black/65"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        >
          {article.author} - {article.date}
        </MotionText>

        <MotionText
          className="pt-4 text-black/75"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
        >
          {article.summary}
        </MotionText>

        <MotionText
          className="pt-4 text-black/80"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.36, ease: "easeOut" }}
        >
          {article.body}
        </MotionText>
      </div>
    </MotionSection>
  );
}

export default TechnologyArticle;
