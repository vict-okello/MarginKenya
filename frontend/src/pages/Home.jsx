import React from 'react'
import Worldnews from './Worldnews'
import Hero from "./Hero"
import LatestNews from "./LatestNews";
import ArticlesResources from "./ArticlesResources";
import NewsletterBanner from "./NewsletterBanner";

function Home() {
  return (
    <div>
      <Hero/>
      <LatestNews />
      <Worldnews/>
      <ArticlesResources />
      <NewsletterBanner />
    </div>
  )
}

export default Home
