import React from 'react'
import Worldnews from './Worldnews'
import Hero from "./Hero"
import LatestNews from "./LatestNews";
import ArticlesResources from "./ArticlesResources";
import NewsletterBanner from "./NewsletterBanner";

function Home() {
  return (
    <div className="bg-[#cfd4da]">
      <section className="px-4 pb-7 pt-5">
        <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-black/10 bg-gradient-to-br from-[#e7eaef] via-[#dde2ea] to-[#d5dbe4] px-3 py-3 shadow-[0_16px_42px_rgba(20,20,20,0.08)] md:px-5 md:py-5">
          <Hero withSection={false} />
        </div>
      </section>

      <section className="px-4 pb-7">
        <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-black/10 bg-gradient-to-br from-[#f0efe9] via-[#ecece5] to-[#e6e4dd] px-3 py-5 shadow-[0_12px_34px_rgba(24,24,24,0.06)] md:px-5 md:py-6">
          <LatestNews withSection={false} showHeader />
        </div>
      </section>

      <section className="px-4 pb-7">
        <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-black/10 bg-gradient-to-br from-[#e5e9ee] via-[#dee3ea] to-[#d5dde6] px-3 py-5 shadow-[0_14px_36px_rgba(20,20,20,0.07)] md:px-5 md:py-6">
          <Worldnews withSection={false} />
        </div>
      </section>

      <section className="px-4 pb-7">
        <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-black/10 bg-gradient-to-br from-[#ece7df] via-[#e8e2d9] to-[#dfd7ca] px-3 py-5 shadow-[0_12px_32px_rgba(20,20,20,0.06)] md:px-5 md:py-6">
          <ArticlesResources />
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="mx-auto w-full max-w-6xl">
          <NewsletterBanner />
        </div>
      </section>
    </div>
  )
}

export default Home
