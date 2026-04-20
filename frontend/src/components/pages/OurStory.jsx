import React from 'react';

const OurStory = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our Handloom Story
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            A legacy of traditional craftsmanship woven with love
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg mb-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              The Beginning
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Ganpati Handloom was born out of a deep reverence for India's rich textile heritage. 
              For over 25 years, we have been preserving and promoting the ancient art of handloom weaving, 
              creating products that carry the soul of our artisans and the essence of our culture.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Our Heritage
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Every thread in our products tells a story. From the cotton fields of rural India to the 
              skilled hands of our master weavers, each product is a testament to centuries-old traditions. 
              We work directly with artisan communities, ensuring that their craft not only survives but thrives 
              in the modern world.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Handloom vs Machine-Made
            </h2>
            <div className="bg-saffron-50 dark:bg-saffron-900 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Why Choose Handloom?
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                  <span><strong>Unique Character:</strong> Each piece is one-of-a-kind with subtle variations that machine-made products lack</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                  <span><strong>Superior Quality:</strong> Handloom fabrics are more durable and breathable than machine-woven alternatives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                  <span><strong>Eco-Friendly:</strong> Handloom production consumes minimal energy and creates zero pollution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                  <span><strong>Supports Artisans:</strong> Your purchase directly impacts the lives of skilled craftspeople and their families</span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Our Artisan Community
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              We work with over 200 skilled artisans across Rajasthan, Gujarat, and West Bengal. 
              These master weavers have inherited their craft through generations, and we ensure they 
              receive fair wages, safe working conditions, and the respect they deserve. When you purchase 
              from Ganpati Handloom, you're not just buying a product – you're supporting entire communities 
              and keeping a dying art alive.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-12">
              Timeline of Our Journey
            </h2>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-8 mb-12">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-32 text-right">
              <span className="text-2xl font-bold text-saffron-600 dark:text-saffron-400">1998</span>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                The Foundation
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Ganpati Handloom was established with a small team of 10 artisans in Rajasthan, 
                focusing on traditional bedsheets and quilts.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-32 text-right">
              <span className="text-2xl font-bold text-saffron-600 dark:text-saffron-400">2005</span>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Expansion & Recognition
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Expanded our product line to include curtains, sofa covers, and door mats. 
                Received the National Handloom Award for excellence in traditional weaving.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-32 text-right">
              <span className="text-2xl font-bold text-saffron-600 dark:text-saffron-400">2015</span>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Going Digital
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Launched our first online store, making authentic handloom products accessible to 
                customers across India and beyond.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-32 text-right">
              <span className="text-2xl font-bold text-saffron-600 dark:text-saffron-400">2023</span>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sustainable Future
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Launched eco-friendly packaging and carbon-neutral shipping. Now working with 200+ 
                artisans and serving 10,000+ happy customers nationwide.
              </p>
            </div>
          </div>
        </div>

        {/* Artisan Spotlight */}
        <div className="bg-gradient-to-r from-saffron-600 to-golden-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Meet Our Master Weavers
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Every product you see here is crafted by skilled artisans who have dedicated their lives 
            to perfecting the art of handloom weaving. Their expertise, passed down through generations, 
            is what makes our products truly special.
          </p>
          <button className="bg-white text-saffron-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Support Our Artisans
          </button>
        </div>
      </div>
    </div>
  );
};

export default OurStory;