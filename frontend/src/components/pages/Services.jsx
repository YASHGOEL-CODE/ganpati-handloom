import React from 'react';
import { FiShoppingBag, FiPackage, FiGift, FiCalendar } from 'react-icons/fi';

const Services = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Tailored solutions for all your handloom needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Custom Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-saffron-100 dark:bg-saffron-900 rounded-full flex items-center justify-center mb-6">
              <FiShoppingBag className="w-8 h-8 text-saffron-600 dark:text-saffron-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Custom Orders
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Have a specific design in mind? We offer fully customized handloom products tailored 
              to your exact requirements. Choose your fabric, colors, patterns, and dimensions.
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                <span>Personalized designs and patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                <span>Custom sizes and dimensions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                <span>Color matching services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                <span>Delivery in 4-6 weeks</span>
              </li>
            </ul>
            <button className="bg-saffron-600 text-white px-6 py-3 rounded-lg hover:bg-saffron-700 transition-colors w-full">
              Request Custom Order
            </button>
          </div>

          {/* Bulk Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-deepgreen-100 dark:bg-deepgreen-900 rounded-full flex items-center justify-center mb-6">
              <FiPackage className="w-8 h-8 text-deepgreen-600 dark:text-deepgreen-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Bulk Orders
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Planning to furnish a hotel, resort, or multiple properties? We offer attractive 
              pricing and dedicated support for bulk orders.
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-deepgreen-600 dark:text-deepgreen-400 font-bold">•</span>
                <span>Volume discounts up to 30%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deepgreen-600 dark:text-deepgreen-400 font-bold">•</span>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deepgreen-600 dark:text-deepgreen-400 font-bold">•</span>
                <span>Flexible payment terms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-deepgreen-600 dark:text-deepgreen-400 font-bold">•</span>
                <span>Priority production and delivery</span>
              </li>
            </ul>
            <button className="bg-deepgreen-600 text-white px-6 py-3 rounded-lg hover:bg-deepgreen-700 transition-colors w-full">
              Get Bulk Quote
            </button>
          </div>

          {/* Corporate Gifting */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-golden-100 dark:bg-golden-900 rounded-full flex items-center justify-center mb-6">
              <FiGift className="w-8 h-8 text-golden-600 dark:text-golden-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Corporate Gifting
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Make a lasting impression with authentic handloom gifts. Perfect for employee rewards, 
              client appreciation, and festive occasions.
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-golden-600 dark:text-golden-400 font-bold">•</span>
                <span>Curated gift collections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-600 dark:text-golden-400 font-bold">•</span>
                <span>Custom branding options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-600 dark:text-golden-400 font-bold">•</span>
                <span>Premium gift packaging</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-600 dark:text-golden-400 font-bold">•</span>
                <span>Bulk pricing available</span>
              </li>
            </ul>
            <button className="bg-golden-600 text-white px-6 py-3 rounded-lg hover:bg-golden-700 transition-colors w-full">
              Explore Gifting Options
            </button>
          </div>

          {/* Festival Collections */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-saffron-100 dark:bg-saffron-900 rounded-full flex items-center justify-center mb-6">
              <FiCalendar className="w-8 h-8 text-saffron-600 dark:text-saffron-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Festival Collections
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Celebrate Indian festivals with our specially curated seasonal collections featuring 
              traditional designs and festive colors.
            </p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                <span>Diwali special collections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                <span>Wedding season specials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                <span>New Year collections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-saffron-600 dark:text-saffron-400 font-bold">•</span>
                <span>Early bird discounts</span>
              </li>
            </ul>
            <button className="bg-saffron-600 text-white px-6 py-3 rounded-lg hover:bg-saffron-700 transition-colors w-full">
              View Collections
            </button>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Additional Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Free Consultation
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our handloom experts are available to help you choose the perfect products 
                for your needs
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Installation Guidance
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Step-by-step guides and video tutorials for proper installation and care
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Maintenance Support
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Lifetime care instructions and tips to keep your handloom products looking new
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;