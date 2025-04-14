import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import Accessories from '../components/Accessories'

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection />
      <Accessories /> 
      <BestSeller />
      <OurPolicy />
    </div>
  );
};

export default Home
