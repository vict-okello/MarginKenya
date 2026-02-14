import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import NotFoundMessage from "../components/NotFoundMessage";
import useReadTracker from "../hooks/useReadTracker";
import useArticleViewTracker from "../hooks/useArticleViewTracker";
import NewsletterBanner from "./NewsletterBanner";
import useSeo from "../hooks/useSeo";
import slugify from "../utils/slugify";

const MotionSection = motion.section;
const MotionWrap = motion.div;
const MotionImage = motion.img;
const MotionTitle = motion.h1;
const MotionText = motion.p;

export default function ArticlePage({ data, backTo = "/", backLabel = "Back", sectionName = "" }) {
  const { articleId } = useParams();
  const article = data.find((item) => item.id === articleId);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const sectionBase = backTo === "/" ? "/worldnews" : backTo;
  const canonicalPath = article
    ? `${sectionBase}/article/${article.id}/${slugify(article.title || article.id)}`
    : "";
  const seoImage = article?.image
    ? /^https?:\/\//i.test(article.image)
      ? article.image
      : article.image.startsWith("/")
        ? `${origin}${article.image}`
        : article.image
    : "";

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

  useSeo({
    title: article ? `${article.title}` : `${sectionName} Article`,
    description: article?.summary || article?.body || `${sectionName} news article`,
    url: article ? `${origin}${canonicalPath}` : `${origin}${sectionBase}`,
    image: seoImage,
    type: "article",
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

        <MotionWrap className="mx-auto max-w-4xl overflow-hidden rounded pt-5">
          <MotionImage
            src={article.image}
            alt={article.title}
            className="h-auto w-full object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.35 }}
          />
        </MotionWrap>

        <MotionTitle className="pt-6 text-4xl font-semibold leading-tight text-black md:text-5xl [font-family:Georgia,Times,serif]">
          {article.title}
        </MotionTitle>

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
