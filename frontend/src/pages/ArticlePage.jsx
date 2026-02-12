import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import NotFoundMessage from "../components/NotFoundMessage";
import useReadTracker from "../hooks/useReadTracker";
import useArticleViewTracker from "../hooks/useArticleViewTracker";
import NewsletterBanner from "./NewsletterBanner";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

export default function ArticlePage({ data, backTo = "/", backLabel = "Back", sectionName = "" }) {
  const { articleId } = useParams();
  const article = data.find((item) => item.id === articleId);

  useReadTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.category || sectionName,
    section: sectionName,
    minSeconds: 20,
    minScrollPercent: 60,
  });

  useArticleViewTracker({
    articleId: article?.id,
    title: article?.title,
    category: article?.category || sectionName,
    section: sectionName,
  });

  if (!article) {
    return <NotFoundMessage backTo={backTo} backLabel={backLabel} />;
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="bg-[#d8d8dc] px-4 py-10"
    >
      <div className="mx-auto w-full max-w-5xl">
        <Link
          to={backTo}
          className="inline-block rounded border border-black/35 px-4 py-2 text-sm font-medium text-black/75 transition hover:bg-black/5 hover:text-black"
        >
          &larr; {backLabel}
        </Link>

        <MotionWrap className="overflow-hidden rounded pt-5">
          <MotionImage
            src={article.image}
            alt={article.title}
            className="h-[240px] w-full object-cover object-center md:h-[360px] lg:h-[420px]"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>

        <MotionTitle className="pt-6 text-4xl font-semibold text-black">{article.title}</MotionTitle>

        <MotionText className="pt-3 text-sm text-black/65">
          {(article.category || sectionName)} - {article.date}
        </MotionText>

        <MotionText className="pt-4 text-black/75">{article.summary}</MotionText>
        <MotionText className="pt-4 text-black/80">{article.body}</MotionText>
      </div>
      <NewsletterBanner variant="sports" />
    </MotionSection>
  );
}
