import React from 'react'
import Worldnews from './Worldnews'
import Hero from "./Hero"
import LatestNews from "./LatestNews";

function Home() {
  return (
    <div>
      <Hero/>
      <LatestNews />
      <Worldnews/>
    </div>
  )
}

export default Home
